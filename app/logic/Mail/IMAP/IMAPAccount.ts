import { MailAccount, TLSSocketType } from "../MailAccount";
import { IMAPFolder } from "./IMAPFolder";
import { appGlobal } from "../../app";
import { ArrayColl } from "svelte-collections";
import { assert } from "../../util/util";
import type { ImapFlow } from "../../../../e2/node_modules/imapflow";

export class IMAPAccount extends MailAccount {
  _connection: ImapFlow;
  acceptOldTLS = false;
  acceptBrokenTLSCerts = false;

  constructor() {
    super();
    console.log("remoteApp", appGlobal.remoteApp, appGlobal.remoteApp.createIMAPFlowConnection);
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
      connectionTimeout: 5 * 1000, // 5 s connection timeout
      greetingTimeout: 5 * 1000, // 5 s greeting timeout
      socketTimeout: 30 * 60 * 1000, // 30 min of inactivity
      logger: false,
    }
    this._connection = await appGlobal.remoteApp.createIMAPFlowConnection(options);
    return this._connection;
  }

  async listFolders(): Promise<void> {
    /* let folders = await this.connection().list({
      messages: true, // Total msg count
      recent: true, // \Recent msg count
      unseen: true // Unseen msg count
    }); */
    let root = await this._connection.listTree();
    assert(root.root, "Not root");
    this.rootFolders.clear(); // TODO add and remove selectively
    this.rootFolders.addAll(this.readFolders(root.folders));
  }

  readFolders(foldersInfo: any[]): ArrayColl<IMAPFolder> {
    let folders = new ArrayColl<IMAPFolder>();
    for (let folderInfo of foldersInfo) {
      let folder = new IMAPFolder(this);
      folder.fromFlow(folderInfo);
      folders.add(folder);
      if (folderInfo.folders?.length) {
        folder.subFolders.addAll(this.readFolders(folderInfo.folders));
      }
    }
    return folders;
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
