import { MailAccount, TLSSocketType } from "../MailAccount";
import { IMAPFolder } from "./IMAPFolder";
import { appGlobal } from "../../app";
import { SQLAccount } from "../SQL/SQLAccount";
import { SQLFolder } from "../SQL/SQLFolder";
import { assert } from "../../util/util";
import type { ArrayColl, Collection } from "svelte-collections";
import type { ImapFlow } from "../../../../e2/node_modules/imapflow";

export class IMAPAccount extends MailAccount {
  readonly protocol: string = "imap";
  _connection: ImapFlow;
  accessToken: string | undefined;
  acceptOldTLS = false;
  acceptBrokenTLSCerts = false;

  constructor() {
    super();
    assert(appGlobal.remoteApp.createIMAPFlowConnection, "IMAP: Need backend");
  }

  get isLoggedIn(): boolean {
    return !!this._connection?.authenticated;
  }

  async login(interactive: boolean): Promise<void> {
    if (!this.dbID) {
      await SQLAccount.save(this);
    }
    await SQLFolder.readAllHierarchy(this);

    await this.connection();
    await this.listFolders();
  }

  async connection(): Promise<ImapFlow> {
    if (this._connection) {
      return this._connection;
    }
    // <https://imapflow.com/module-imapflow-ImapFlow.html>
    let options = {
      host: this.hostname,
      port: this.port,
      secure: this.tls == TLSSocketType.TLS,
      auth: {
        user: this.username,
        pass: this.password,
        // accessToken: ...
      },
      clientInfo: useragent,
      tls: {
        minVersion: this.acceptOldTLS ? 'TLSv1.0' : undefined,
        rejectUnauthorized: !this.acceptBrokenTLSCerts,
      },
      maxIdleTime: 30 * 1000, // 30 s, refresh IDLE
      connectionTimeout: 5 * 1000, // 5 s connection timeout
      greetingTimeout: 5 * 1000, // 5 s greeting timeout
      socketTimeout: 30 * 60 * 1000, // 30 min of inactivity
      logger: false,
    }
    this._connection = await appGlobal.remoteApp.createIMAPFlowConnection(options);
    assert(this._connection, `Connection is null\n${this.hostname} IMAP server`);

    try {
      await this._connection.connect();
    } catch (ex) {
      if (ex.code == "NoConn" || ex.message == "Command failed.") {
        throw new Error("Failed to connect to server " + this.hostname + " for account " + this.name);
      } else {
        throw ex;
      }
    }
    this.attachListeners(this._connection);
    return this._connection;
  }

  attachListeners(connection: ImapFlow): void {
    connection.on("close", async () => {
      try {
        console.log(`IMAP connection to ${this.hostname} was closed by server, network or OS.`);
        await this.reconnect();
      } catch (ex) {
        ex.message = `Reconnection failed after connection closed:\n${ex.message}\n${this.hostname} IMAP server`;
        this.errorCallback(ex);
      }
    });
    connection.on("error", async (ex) => {
      try {
        ex.message = `Connection to server for ${this.name} failed:\n${ex.message}`;
        this.errorCallback(ex);
        await this.reconnect();
      } catch (ex) {
        ex.message = `Reconnect failed after connection error:\n${ex.message}\n${this.hostname} IMAP server`;
        this.errorCallback(ex);
      }
    });
    connection.on("exists", async (info) => {
      try {
        let folder = this.getFolderByPath(info.path);
        assert(folder, `We don't know about this folder`);
        assert(typeof (info.count) == "number" && typeof (info.prevCount) == "number", "Counts need to be numbers");
        await folder.countChanged(info.count, info.prevCount);
      } catch (ex) {
        console.log("Server event", info);
        ex.message = `Server event about folder ${info.path} failed:\n${ex.message}\n${this.hostname} IMAP server`;
        this.errorCallback(ex);
      }
    });
    connection.on("flags", async (info) => {
      try {
        let folder = this.getFolderByPath(info.path);
        assert(folder, `We don't know about this folder`);
        assert(!info.uid || typeof (info.uid) == "number", "Expected optional number for UID");
        assert(typeof (info.seq) == "number", "Expected number for seq");
        assert(!info.modseq || typeof (info.modseq) == "number", "Expected number for modseq");
        assert(info.flags instanceof Set, "Expected Set for flags");
        await folder.messageFlagsChanged(info.uid ?? null, info.seq, info.flags, info.modseq);
      } catch (ex) {
        console.log("Server event", info);
        ex.message = `Server event about message seq ${info.seq} = UID ${info.uid} in folder ${info.path} failed:\n${ex.message}\n${this.hostname} IMAP server`;
        this.errorCallback(ex);
      }
    });
  }

  protected async reconnect(): Promise<void> {
    console.log(`Reconnecting...`);
    this._connection.close();
    this._connection = null;
    if (!(this.password || this.accessToken)) {
      return;
    }
    await this.connection();
  }

  async listFolders(): Promise<void> {
    await SQLFolder.readAllHierarchy(this);

    // listTree() doesn't return the message count and is not well-implemented
    let folders = await this._connection.list({
      statusQuery: {
        messages: true, // Total msg count
        recent: true, // \Recent msg count
        unseen: true, // Unseen msg count
      },
    });
    // console.log("folders", foldersFlat);
    this.readFolders(folders, null, this.rootFolders as ArrayColl<IMAPFolder>);

    for (let folder of this.getAllFolders()) {
      if (!folder.dbID) {
        await SQLFolder.save(folder);
      } else {
        await SQLFolder.saveProperties(folder);
      }
    }
  }

  readFolders(allFoldersInfo: any[], parent: IMAPFolder, subFolders: Collection<IMAPFolder>): void {
    let subFoldersInfo = allFoldersInfo.filter(folderInfo => folderInfo.parentPath == (parent?.path ?? ""));
    for (let folderInfo of subFoldersInfo) {
      let subFolder = subFolders.find(folder => folder.path == folderInfo.path);
      if (subFolder) {
        if (folderInfo.status) {
          subFolder.fromFlow(folderInfo); // update with new info
        }
      } else {
        subFolder = new IMAPFolder(this);
        subFolder.fromFlow(folderInfo);
        subFolders.add(subFolder);
        subFolder.parent = parent;
      }
      this.readFolders(allFoldersInfo, subFolder, subFolder.subFolders as ArrayColl<IMAPFolder>);
    }
  }

  getFolderByPath(path: string): IMAPFolder {
    // only for casting the type
    return super.getFolderByPath(path) as IMAPFolder;
  }

  async logout(): Promise<void> {
    await this._connection.logout();
  }

  newFolder(): IMAPFolder {
    return new IMAPFolder(this);
  }
}

const useragent = {
  name: "Mustang",
  version: "0.1",
  'support-url': "https://mustang.im",
};
