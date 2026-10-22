import { File } from "../File";
import type { JMAPDirectory } from "./JMAPDirectory";
import type { JMAPFileAccount } from "./JMAPFileAccount";
import type { TJMAPFileNode } from "./TJMAPFileNode";
import type { TJMAPGetResponse } from "../../Mail/JMAP/TJMAPGeneric";
import { appGlobal } from "../../app";
import { getFilesDir } from "../../util/backend-wrapper";
import { Lock } from "../../util/flow/Lock";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assert } from "../../util/util";

/** A file in a JMAP account.
 * If we have it on disk, `syncLocalCopy()` keeps the file on disk and the file on the server
 * in sync, using the algorithm in `JMAPFileSync.md`. */
export class JMAPFile extends File {
  declare parent: JMAPDirectory;
  /** FileNode ID. null = not yet on the server */
  nodeID: string | null = null;
  /** The file on disk, as we last wrote it or uploaded it.
   * null = we don't have it on disk, or never synced it */
  localCopy: LocalCopy | null = null;
  /** The server version that is in `contents` */
  protected contentsBlobID: string | null = null;
  protected readonly syncLock = new Lock();

  get account(): JMAPFileAccount {
    return this.parent?.account;
  }

  /** The current contents on the server. Changes with every change of the contents. */
  get blobID(): string | null {
    return this.syncState as string;
  }
  set blobID(val: string | null) {
    this.syncState = val;
  }

  fromJMAP(json: TJMAPFileNode) {
    this.nodeID = sanitize.alphanumdash(json.id);
    this.setFileName(sanitize.nonemptylabel(json.name));
    this.path = this.parent.childPath(this.name);
    this.blobID = sanitize.alphanumdash(json.blobId, null);
    this.size = sanitize.integerRange(json.size, 0, Number.MAX_SAFE_INTEGER, 0);
    this.mimetype = sanitize.nonemptystring(json.mediaType ?? json.type, "application/octet-stream");
    this.lastModOnServer = sanitize.date(json.modified, new Date());
    this.lastMod = new Date(this.lastModOnServer);
    if (this.contents && this.contentsBlobID != this.blobID && !this.filepathLocal) {
      this.clearURL();
      this.contents = null;
    }
  }

  async download() {
    if (this.filepathLocal) {
      try {
        await this.syncLocalCopy();
      } catch (ex) {
        this.account.errorCallback(ex); // e.g. offline. The file on disk is still there.
      }
    }
    if (this.contents) {
      return;
    }
    await this.readLocalFile();
    if (this.contents) {
      return;
    }
    await this.downloadRunOnce.runOnce(async () => {
      let lock = await this.syncLock.lock();
      try {
        if (this.contents) {
          return;
        }
        let contents = await this.downloadServerVersion();
        // #if [!WEBMAIL]
        await this.writeLocalFile(contents);
        // #endif
      } finally {
        lock.release();
      }
    });
  }

  async upload() {
    await this.syncLocalCopy();
  }

  /** @returns We uploaded or downloaded changes */
  async uploadIfChanged(): Promise<boolean> {
    let before = this.blobID;
    await this.syncLocalCopy();
    return before != this.blobID;
  }

  /** Compares the file on disk with the server, and brings both to the same state.
   * @see JMAPFileSync.md */
  async syncLocalCopy() {
    let lock = await this.syncLock.lock();
    try {
      const kMaxRounds = 5;
      for (let round = 1; round <= kMaxRounds; round++) {
        if (await this.syncLocalCopyStep()) {
          return;
        }
      }
      throw new Error(`${this.name}: The file keeps changing on the server. We'll try again later.`);
    } finally {
      lock.release();
    }
  }

  /** @returns Done. false = The state changed, so call again. */
  protected async syncLocalCopyStep(): Promise<boolean> {
    if (!this.filepathLocal) {
      return true;
    }
    let localChanged: boolean;
    try {
      localChanged = await this.isLocalFileChanged();
    } catch (ex) {
      if (ex.code != "ENOENT") {
        throw ex;
      }
      // The user deleted the file on disk. It was only our copy.
      await this.deleteLocalCache();
      await this.saveLocally();
      return true;
    }
    if (localChanged) {
      this.clearURL();
      this.contents = null;
      this.contentsBlobID = null;
    }
    if (!this.nodeID) {
      await this.createOnServer();
      return true;
    }
    let serverChanged = this.blobID != this.localCopy?.blobID;
    if (!localChanged && !serverChanged) {
      return true;
    }
    if (!serverChanged) {
      return await this.uploadLocalChanges();
    }
    if (!localChanged) {
      await this.updateLocalCopy();
      return true;
    }
    return await this.resolveConflict();
  }

  /** @returns The file on disk is different from what we wrote or uploaded
   * @throws ENOENT, when the file is no longer on disk */
  async isLocalFileChanged(): Promise<boolean> {
    if (!this.filepathLocal) {
      return false;
    }
    let stat = await appGlobal.remoteApp.statFile(this.filepathLocal);
    if (!this.localCopy) {
      return true;
    }
    return stat.size != this.localCopy.size ||
      Math.floor(new Date(stat.lastMod).getTime() / 1000) != Math.floor(this.localCopy.lastMod.getTime() / 1000);
  }

  /** Only the user changed the file, on disk.
   * @returns false, if the file changed on the server in the meantime */
  protected async uploadLocalChanges(): Promise<boolean> {
    let stat = await appGlobal.remoteApp.statFile(this.filepathLocal); // before reading, so that a change while we read is noticed next time
    let lastMod = new Date(stat.lastMod);
    let contents = await this.readFromDisk(this.filepathLocal);
    let blobID = await this.account.uploadContents(contents, this.name, this.mimetype);
    let updated = await this.account.updateFileIfUnchanged(this.nodeID, this.localCopy?.blobID ?? this.blobID, {
      blobId: blobID,
      modified: lastMod.toISOString(),
    });
    if (!updated) {
      await this.refresh();
      return false;
    }
    this.blobID = blobID;
    this.size = contents.size;
    this.lastMod = new Date(lastMod);
    this.lastModOnServer = new Date(lastMod);
    this.localCopy = { blobID, lastMod, size: stat.size };
    await this.saveLocally();
    return true;
  }

  protected async updateLocalCopy() {
    let contents = await this.downloadServerVersion();
    try {
      await this.writeLocalFile(contents);
    } catch (ex) {
      if (!this.isLocked(ex)) {
        throw ex;
      }
      // Another app has the file open and locked, e.g. on Windows. We'll try again later, and `contents` keeps the download.
    }
  }

  /** Both the user on disk and somebody else on the server changed the file.
   * Keeps both versions, as two files.
   * @returns false, if this needs another round */
  protected async resolveConflict(): Promise<boolean> {
    let stat = await appGlobal.remoteApp.statFile(this.filepathLocal);
    let localLastMod = new Date(stat.lastMod);
    let localContents = await this.readFromDisk(this.filepathLocal);
    let serverContents = await this.downloadServerVersion();
    let localBytes = new Uint8Array(await localContents.arrayBuffer());
    let serverBytes = new Uint8Array(await serverContents.arrayBuffer());
    if (localBytes.length == serverBytes.length && localBytes.every((byte, i) => byte == serverBytes[i])) {
      // Both made the same change
      this.localCopy = { blobID: this.blobID, lastMod: localLastMod, size: stat.size };
      await this.saveLocally();
      return true;
    }

    let modifiedName = this.conflictName("modified", localLastMod);
    let modifiedPath = await this.freeLocalPath(modifiedName);
    try {
      await appGlobal.remoteApp.fs.rename(this.filepathLocal, modifiedPath);
    } catch (ex) {
      if (!this.isLocked(ex)) {
        throw ex;
      }
      // Another app has the file open and locked it, e.g. on Windows. So, the file on disk keeps
      // the user's version, and the server version goes into a new file.
      let serverName = this.conflictName("server", this.lastModOnServer);
      let serverPath = await this.freeLocalPath(serverName);
      await this.writeToDisk(serverPath, serverContents, this.lastModOnServer);
      await this.parent.addLocalFile(serverName, serverPath, this.mimetype, this.blobID);
      // The user's version is now based on the server version, so that the next round uploads it
      this.localCopy = { blobID: this.blobID, lastMod: new Date(0), size: -1 };
      await this.saveLocally();
      return false;
    }
    await this.writeLocalFile(serverContents);
    await this.parent.addLocalFile(modifiedName, modifiedPath, this.mimetype);
    return true;
  }

  /** The server deleted this file.
   * @param survivor If the user changed the file on disk, then we keep it in this directory, as new file. */
  async removedOnServer(survivor: JMAPDirectory) {
    let lock = await this.syncLock.lock();
    try {
      await this.keepLocalChanges(survivor);
    } finally {
      lock.release();
    }
  }

  /** Like `removedOnServer()`, for when we already have the `syncLock` */
  protected async keepLocalChanges(survivor: JMAPDirectory) {
    let localChanged = false;
    try {
      localChanged = await this.isLocalFileChanged();
    } catch (ex) {
      if (ex.code != "ENOENT") {
        throw ex;
      }
    }
    if (!localChanged) {
      await this.deleteLocally();
      return;
    }
    let stat = await appGlobal.remoteApp.statFile(this.filepathLocal);
    let modifiedName = this.conflictName("modified", new Date(stat.lastMod));
    let modifiedPath = await this.freeLocalPath(modifiedName);
    try {
      await appGlobal.remoteApp.fs.rename(this.filepathLocal, modifiedPath);
      this.filepathLocal = modifiedPath;
    } catch (ex) {
      if (!this.isLocked(ex)) {
        throw ex;
      }
    }
    this.nodeID = null;
    this.blobID = null;
    this.localCopy = null;
    this.setFileName(modifiedName);
    this.moveTo(survivor);
    await this.saveLocally();
    await this.createOnServer();
  }

  /** Uploads a file that we have only on disk */
  async createOnServer(blobID?: string) {
    let stat = await appGlobal.remoteApp.statFile(this.filepathLocal);
    let lastMod = new Date(stat.lastMod);
    blobID ??= await this.account.uploadContents(await this.readFromDisk(this.filepathLocal), this.name, this.mimetype);
    let created = await this.account.setNodes({
      create: {
        file: this.account.newNodeJSON("File", {
          name: this.name,
          parentId: this.parent.nodeID,
          blobId: blobID,
          mediaType: this.mimetype,
          modified: lastMod.toISOString(),
        }),
      },
      onExists: "rename",
    });
    let json = created["file"];
    this.nodeID = sanitize.alphanumdash(json?.id);
    for (let duplicate of this.parent.files.filterOnce(file => file.nodeID == this.nodeID && file != this)) {
      await duplicate.deleteLocally(); // The push notification was faster
    }
    if (json.name) {
      this.setFileName(sanitize.nonemptylabel(json.name, this.name)); // The server changed the name, because it's taken
    }
    this.path = this.parent.childPath(this.name);
    this.blobID = blobID;
    this.size = stat.size;
    this.lastMod = new Date(lastMod);
    this.lastModOnServer = new Date(lastMod);
    this.localCopy = { blobID, lastMod, size: stat.size };
    await this.saveLocally();
  }

  protected async refresh() {
    let response = await this.account.jmapAccount.makeSingleCall("FileNode/get", {
      accountId: this.account.jmapAccount.accountID,
      ids: [this.nodeID],
    }) as TJMAPGetResponse<TJMAPFileNode>;
    let json = response.list.find(json => json.id == this.nodeID);
    if (json) {
      await this.account.applyServerNode(json);
      return;
    }
    await this.keepLocalChanges(this.parent);
  }

  /** Rename */
  async saveOnServer() {
    if (!this.nodeID || this.parent.childPath(this.name) == this.path) {
      return;
    }
    try {
      await this.account.setNodes({
        update: {
          [this.nodeID]: { name: this.name },
        },
      });
    } catch (ex) {
      await this.parent.listContents(); // Shows the name on the server again
      throw ex;
    }
    this.path = this.parent.childPath(this.name);
    await this.saveLocally();
  }

  async deleteOnServer() {
    if (!this.nodeID) {
      return;
    }
    await this.account.setNodes({
      destroy: [this.nodeID],
    });
  }

  async deleteLocalCache() {
    this.localCopy = null;
    this.contentsBlobID = null;
    try {
      await super.deleteLocalCache();
    } catch (ex) {
      if (!this.isLocked(ex) && ex.code != "ENOENT") {
        throw ex;
      }
    }
  }

  moveTo(parent: JMAPDirectory) {
    if (parent != this.parent) {
      this.parent?.files.remove(this);
      this.parent = parent;
    }
    if (!parent.files.contains(this)) {
      parent.files.add(this);
    }
    this.path = parent.childPath(this.name);
  }

  protected async readLocalFile(): Promise<void> {
    this.contentsBlobID = null;
    await super.readLocalFile();
  }

  protected async downloadServerVersion(): Promise<Blob> {
    if (this.contents && this.contentsBlobID == this.blobID) {
      return this.contents;
    }
    assert(this.blobID, `${this.name}: The server has no contents for this file`);
    let blobID = this.blobID;
    let contents = await this.account.downloadContents(blobID, this.name, this.mimetype);
    this.clearURL();
    this.contents = contents;
    this.contentsBlobID = blobID;
    return contents;
  }

  /** Writes the server version into our file on disk */
  protected async writeLocalFile(contents: Blob) {
    this.filepathLocal ??= await this.getLocalFilePath();
    let stat = await this.writeToDisk(this.filepathLocal, contents, this.lastModOnServer);
    this.localCopy = { blobID: this.contentsBlobID ?? this.blobID, lastMod: new Date(stat.lastMod), size: stat.size };
    await this.saveLocally();
  }

  /** @param lastMod The modification time for the file on disk */
  protected async writeToDisk(filepath: string, contents: Blob, lastMod: Date) {
    await appGlobal.remoteApp.writeFile(filepath, 0o600, new Uint8Array(await contents.arrayBuffer()));
    await appGlobal.remoteApp.fs.utimes(filepath, new Date(), lastMod);
    return await appGlobal.remoteApp.statFile(filepath);
  }

  protected async readFromDisk(filepath: string): Promise<Blob> {
    let bytes = await appGlobal.remoteApp.readFile(filepath);
    return new Blob([bytes], { type: this.mimetype });
  }

  /** Each file is in its own directory, named after the node ID, so that
   * a rename or move on the server doesn't need to move the file on disk,
   * and names that are the same after sanitizing don't collide. */
  protected async getLocalFilePath(): Promise<string> {
    assert(this.nodeID, `${this.name}: Not yet on the server`);
    let dir = `${await getFilesDir()}/files/cloud/${this.account.id}/${this.nodeID}`;
    await appGlobal.remoteApp.fs.mkdir(dir, { recursive: true, mode: 0o700 });
    return `${dir}/${sanitize.filename(this.name, "file")}`;
  }

  /** A path for a new file in the same directory on disk as our file, which is not yet taken */
  protected async freeLocalPath(name: string): Promise<string> {
    let dir = await appGlobal.remoteApp.path.dirname(this.filepathLocal);
    let filename = sanitize.filename(name, "file");
    const kMaxTries = 100;
    for (let i = 1; i <= kMaxTries; i++) {
      let filepath = `${dir}/${i == 1 ? "" : i + "-"}${filename}`;
      try {
        await appGlobal.remoteApp.fs.stat(filepath);
      } catch (ex) {
        if (ex.code == "ENOENT") {
          return filepath;
        }
        throw ex;
      }
    }
    throw new Error(`${name}: Too many files with this name`);
  }

  /** E.g. `report-modified-26-10-21-14-03-59.docx`. The date is in local time. */
  protected conflictName(kind: "modified" | "server", date: Date): string {
    let stamp = [date.getFullYear() % 100, date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()]
      .map(number => String(number).padStart(2, "0"))
      .join("-");
    return `${this.nameWithoutExt}-${kind}-${stamp}` + (this.ext ? "." + this.ext : "");
  }

  /** Another app has the file open, and the operating system doesn't let us change it, e.g. on Windows */
  protected isLocked(ex: any): boolean {
    return ["EBUSY", "EPERM", "EACCES"].includes(ex?.code);
  }

  toExtraJSON(): any {
    let json = super.toExtraJSON();
    json.nodeID = this.nodeID;
    json.localCopy = this.localCopy && {
      blobID: this.localCopy.blobID,
      lastMod: this.localCopy.lastMod.toISOString(),
      size: this.localCopy.size,
    };
    return json;
  }
  fromExtraJSON(json: any) {
    super.fromExtraJSON(json);
    this.nodeID = sanitize.alphanumdash(json?.nodeID, null);
    this.localCopy = json?.localCopy
      ? {
        blobID: sanitize.alphanumdash(json.localCopy.blobID, null),
        lastMod: sanitize.date(json.localCopy.lastMod, new Date(0)),
        size: sanitize.integer(json.localCopy.size, -1),
      }
      : null;
  }
}

interface LocalCopy {
  /** The server version that the file on disk is based on */
  blobID: string | null;
  /** of the file on disk */
  lastMod: Date;
  /** of the file on disk */
  size: number;
}
