import { MailAccount, TLSSocketType } from "../MailAccount";
import { IMAPFolder } from "./IMAPFolder";
import { appGlobal } from "../../app";
import type { ArrayColl, Collection } from "svelte-collections";
import { assert } from "../../util/util";
import type { ImapFlow } from "../../../../e2/node_modules/imapflow";

export class IMAPAccount extends MailAccount {
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
    let conn = await this.connection();
    await conn.connect();
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
    /*this._connection.on("close", () => {
      if (!(this.password || this.accessToken)) {
        return;
      }
      this.connection();
    });*/
    return this._connection;
  }

  async listFolders(): Promise<void> {
    // listTree() doesn't return the message count and is not well-implemented
    let folders = await this._connection.list({
      statusQuery: {
        messages: true, // Total msg count
        recent: true, // \Recent msg count
        unseen: true, // Unseen msg count
      },
    });
    // console.log("folders", foldersFlat);
    this.readFolders(folders, "", this.rootFolders as ArrayColl<IMAPFolder>);
  }

  readFolders(allFoldersInfo: any[], parentPath: string, subFolders: Collection<IMAPFolder>): void {
    let subFoldersInfo = allFoldersInfo.filter(folderInfo => folderInfo.parentPath == parentPath);
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
      }
      this.readFolders(allFoldersInfo, subFolder.path, subFolder.subFolders as ArrayColl<IMAPFolder>);
    }
  }

  async logout(): Promise<void> {
    await this._connection.logout();
  }
}

const useragent = {
  name: "Mustang",
  version: "0.1",
  'support-url': "https://mustang.im",
};
