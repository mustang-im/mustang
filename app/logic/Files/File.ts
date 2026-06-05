import { FileOrDirectory } from "./FileOrDirectory";
import type { WebAppListed } from "../WebApps/WebAppListed";
import { openOSAppForFile } from "../util/os-integration";
import { getFilesDir } from "../util/backend-wrapper";
import { appGlobal } from "../app";
import { RunOnce } from "../util/flow/RunOnce";
import { notifyChangedProperty } from "../util/Observable";
import { NotImplemented, assert, type URLString } from "../util/util";
import { sanitize } from "../../../lib/util/sanitizeDatatypes";
import { ArrayColl, type Collection } from "svelte-collections";

export class File extends FileOrDirectory {
  /** substring of `name`, excluding `fileExt` and dot */
  nameWithoutExt: string;
  /** substring of `name`, just the part after the last dot */
  ext: string;
  @notifyChangedProperty
  mimetype: string;
  /** in bytes */
  @notifyChangedProperty
  size: number;
  @notifyChangedProperty
  url: URLString;
  /** null/undefined = not loaded. Does not mean that the file is empty. */
  @notifyChangedProperty
  contents: Blob;
  protected readonly downloadRunOnce = new RunOnce<void>();
  protected readonly readFileRunOnce = new RunOnce<void>();
  protected readonly getURLRunOnce = new RunOnce<URLString | null>();

  /** If a File is GCed, the registered blob: URL is revoked automatically.
   * @see Abstract/Attachment. */
  protected static urlFinalizer = new FinalizationRegistry((url: URLString) => {
    URL.revokeObjectURL(url);
  });

  get account() {
    return this.parent?.account;
  }

  setFileName(val: string) {
    this.name = val;
    let pos = val.lastIndexOf(".");
    if (pos == -1) {
      this.ext = "";
      this.nameWithoutExt = val;
      return;
    }
    this.nameWithoutExt = val.substring(0, pos);
    this.ext = val.substring(pos + 1);
  }

  /** Refresh metadata for this file from the source. */
  async stat() {
  }

  get isDownloaded(): boolean {
    return !!this.contents;
  }

  async download() {
    throw new NotImplemented(`Download of ${this.account.protocol} file not yet implemented`);
  }

  /** Reads the local cached file from disk into `this.contents`.
   * If fail, will return without touching `this.contents`, e.g. leaving it empty. */
  protected async readLocalFile(): Promise<void> {
    if (!this.filepathLocal) {
      return;
    }
    return await this.readFileRunOnce.runOnce(async () => {
      let array: Uint8Array;
      try {
        array = await appGlobal.remoteApp.readFile(this.filepathLocal);
      } catch (ex) {
        console.error(ex); // e.g. file was deleted
        return;
      }
      if (!array.length) {
        return;
      }
      this.contents = new globalThis.File([array], this.name, { type: this.mimetype });
    });
  }

  protected async saveAsLocalFile() {
    assert(this.contents, "Need contents");
    this.filepathLocal ??= await this.getLocalFilePath();
    let contents = new Uint8Array(await this.contents.arrayBuffer());
    await appGlobal.remoteApp.writeFile(this.filepathLocal, 0o600, contents);
    await this.saveLocally(); // file path as marker that we have the file on disk
    // TODO Watch local file for changes, in case user edited, and then trigger upload
  }

  async getURL(): Promise<URLString | null> {
    if (this.url) {
      return this.url;
    }
    return await this.getURLRunOnce.runOnce(async () => {
      if (this.url) {
        return this.url;
      }
      await this.download();
      if (!this.contents) {
        return null;
      }
      this.url = URL.createObjectURL(this.contents); // blob: URL
      File.urlFinalizer.register(this, this.url, this);
      return this.url;
    });
  }

  /** Release the cached blob: URL, if any.
   * Call when dropping the file or replacing `this.contents`. */
  clearURL() {
    if (this.url?.startsWith("blob:")) {
      URL.revokeObjectURL(this.url);
      File.urlFinalizer.unregister(this);
    }
    this.url = null;
  }

  async saveLocally() {
    await this.account.storage?.saveFile(this);
  }

  async deleteLocally() {
    this.clearURL();
    this.parent?.files.remove(this);
    await this.account.storage?.deleteFile(this);
  }

  /** Imports the browser `File` with its content
   * and meta-data into this object.
   * Call this on a new object. */
  fromBrowserFile(fileBlob: globalThis.File) {
    this.name = fileBlob.name;
    this.contents = fileBlob;
    this.mimetype = fileBlob.type;
    this.size = fileBlob.size;
    this.lastMod = new Date(fileBlob.lastModified);
  }

  /** Open the native desktop app with this file */
  async openOSApp() {
    if (!this.contents) {
      await this.download();
    }
    console.log("open", this.filepathLocal);
    await openOSAppForFile(this.filepathLocal);
  }

  async availableOnlineEditors(): Promise<Collection<WebAppListed>> {
    return new ArrayColl();
  }

  async preferredOnlineEditor(): Promise<WebAppListed | null> {
    let editors = await this.availableOnlineEditors();
    // TODO read preference (and set it in <FileRightPane>)
    return editors.first; // may be null
  }

  protected async getLocalFilePath(): Promise<string> {
    filesDir ??= await getFilesDir();
    let fullDir = `${filesDir}/files/cloud/${this.account.id}`;
    let dir = sanitize.dirname(this.parent.path, false, "");
    if (dir) {
      fullDir += "/" + dir;
    }
    await appGlobal.remoteApp.fs.mkdir(fullDir, { recursive: true, mode: 0o700 });
    return `${fullDir}/${sanitize.filename(this.name)}`;
  }
}

let filesDir: string = null;
