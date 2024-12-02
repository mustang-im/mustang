import { MailAccount, TLSSocketType, AuthMethod, DeleteStrategy } from "../MailAccount";
import { IMAPFolder } from "./IMAPFolder";
import { appGlobal } from "../../app";
import type { EMail } from "../EMail";
import { ConnectError, LoginError } from "../../Abstract/Account";
import { SpecialFolder } from "../Folder";
import { assert, SpecificError } from "../../util/util";
import { notifyChangedProperty } from "../../util/Observable";
import { Lock, type Locked } from "../../util/Lock";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { appName, appVersion, siteRoot } from "../../build";
import { ArrayColl, type Collection } from "svelte-collections";
import type { ImapFlow } from "../../../../backend/node_modules/imapflow";
import { gt } from "../../../l10n/l10n";

export class IMAPAccount extends MailAccount {
  readonly protocol: string = "imap";
  acceptOldTLS = false;
  pathDelimiter: string; /** Separator in folder path. E.g. '.' or '/', depending on server */
  deleteStrategy: DeleteStrategy = DeleteStrategy.MoveToTrash;
  /** if polling is enabled, how often to poll.
   * In minutes. 0 or null = polling disabled */
  pollIntervalMinutes = 10;
  @notifyChangedProperty
  protected connectionMain: ImapFlow;
  protected connectionFetch: ImapFlow;
  protected connectMainLock = new Lock();
  protected connectFetchLock = new Lock();

  constructor() {
    super();
    assert(appGlobal.remoteApp.createIMAPFlowConnection, "IMAP: Need backend");
  }

  get isLoggedIn(): boolean {
    // return !!this.connectionMain?.authenticated; TODO authenticated is always false
    return !!this.connectionMain || this.oAuth2?.isLoggedIn;
  }

  async login(interactive: boolean): Promise<void> {
    if (!this.dbID) {
      await this.storage.saveAccount(this);
    }
    await this.storage.readFolderHierarchy(this);

    await this.connection(interactive);
    await this.listFolders();
    (this.inbox as IMAPFolder).startPolling();
  }

  async verifyLogin(): Promise<void> {
    await this.connection(true);
    this.logout(false);
  }

  async connection(interactive = false, isMain = true): Promise<ImapFlow> {
    if (isMain && this.connectionMain) {
      return this.connectionMain;
    }
    if (!isMain && this.connectionFetch) {
      return this.connectionFetch;
    }
    let lock: Locked;
    if (isMain) {
      lock = await this.connectMainLock.lock();
    } else {
      lock = await this.connectFetchLock.lock();
    }
    try {

      this.fatalError = null;

      // Auth method
      let usePassword = [
        AuthMethod.Password,
        AuthMethod.GSSAPI,
        AuthMethod.NTLM,
        AuthMethod.Unknown,
      ].includes(this.authMethod);
      let useOAuth2 = [
        AuthMethod.OAuth2,
      ].includes(this.authMethod);
      if (useOAuth2) {
        assert(this.oAuth2, this.name + `: ` + gt`Need OAuth2 configuration`);
        if (!this.oAuth2.isLoggedIn) {
          await this.oAuth2.login(interactive);
        }
        assert(this.oAuth2.accessToken, this.name + `: ` + gt`OAuth2: Login failed`);
      }

      // <https://imapflow.com/module-imapflow-ImapFlow.html>
      let options = {
        host: this.hostname,
        port: this.port,
        secure: this.tls == TLSSocketType.TLS,
        auth: {
          user: this.username,
          pass: usePassword ? this.password : undefined,
          accessToken: useOAuth2 ? this.oAuth2.accessToken : undefined,
        },
        clientInfo: useragent,
        tls: {
          minVersion: this.acceptOldTLS ? 'TLSv1' : undefined,
          rejectUnauthorized: !this.acceptBrokenTLSCerts,
        },
        disableAutoIdle: !isMain,
        maxIdleTime: 30 * 1000, // 30 s, refresh IDLE
        connectionTimeout: 5 * 1000, // 5 s connection timeout
        greetingTimeout: 5 * 1000, // 5 s greeting timeout
        socketTimeout: 30 * 60 * 1000, // 30 min of inactivity
        logger: false,
      }
      // console.log("IMAP connection", options);

      let connection = await appGlobal.remoteApp.createIMAPFlowConnection(options);
      assert(connection, `Connection is null\n${this.hostname} IMAP server`);

      try {
        await connection.connect();
      } catch (ex) {
        let msg = ex?.responseText ?? ex?.message ?? ex + "";
        if (ex.authenticationFailed) {
          throw this.fatalError = new LoginError(ex,
            "Check your login, username, and password.\n" + msg);
        } else if (ex.code == "EAUTH" || ex.code == "ClosedAfterConnectTLS") {
          throw this.fatalError = new LoginError(ex,
            "Check your login, username, and password.\n" + msg);
        } else if (ex.code == "NoConn" || msg == "Command failed.") {
          throw this.fatalError = new ConnectError(ex,
            "Failed to connect to server " + this.hostname + " for account " + this.name);
        } else {
          throw this.fatalError = new ConnectError(ex, msg);
        }
      }
      if (isMain) {
        this.connectionMain = connection;
      } else {
        this.connectionFetch = connection;
      }
      this.attachListeners(connection);
      return connection;
    } finally {
      lock.release();
    }
  }

  attachListeners(connection: ImapFlow): void {
    connection.on("close", async () => {
      try {
        console.log(`${new Date().toISOString()} IMAP connection to ${this.hostname} was closed by server, network or OS. Reconnecting...`);
        await this.reconnect(connection);
      } catch (ex) {
        this.fatalError = new ConnectError(ex,
          `Reconnection failed after connection closed:\n${ex.message}\n${this.hostname} IMAP server`);
      }
    });
    connection.on("error", async (ex) => {
      try {
        console.log(`${new Date().toISOString()} Connection to server for ${this.name} failed:\n${ex.message}`);
        await this.reconnect(connection);
      } catch (ex) {
        this.fatalError = new ConnectError(ex,
          `Reconnect failed after connection error:\n${ex.message}\n${this.hostname} IMAP server`);
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
        this.errorCallback(new IMAPCommandError(ex, `Server event about folder ${info.path} failed:\n${ex.message}\n${this.hostname} IMAP server`));
      }
    });
    connection.on("flags", async (info) => {
      try {
        // console.log("flag change", info);
        let folder = this.getFolderByPath(info.path);
        assert(folder, `We don't know about this folder`);
        assert(!info.uid || typeof (info.uid) == "number", "Expected optional number for UID");
        assert(typeof (info.seq) == "number", "Expected number for seq");
        assert(!info.modseq || typeof (info.modseq) == "number", "Expected number for modseq");
        assert(info.flags instanceof Set, "Expected Set for flags");
        await folder.messageFlagsChanged(info.uid ?? null, info.seq, info.flags, info.modseq, connection);
      } catch (ex) {
        console.log("Error", ex, "in processing server event", info);
        this.errorCallback(new IMAPCommandError(ex, `Server event about message seq ${info.seq} = UID ${info.uid} in folder ${info.path} failed:\n${ex.message}\n${this.hostname} IMAP server`));
      }
    });
    connection.on("expunge", async (info) => {
      try {
        let folder = this.getFolderByPath(info.path);
        assert(folder, `We don't know about this folder`);
        assert(typeof (info.seq) == "number", "seq must be a number");
        await folder.messageDeletedNotification(info.seq, connection);
      } catch (ex) {
        console.log("Server event", info);
        this.errorCallback(new IMAPCommandError(ex, `Server event about folder ${info.path} failed:\n${ex.message}\n${this.hostname} IMAP server`));
      }
    });
  }

  async reconnect(connection: ImapFlow): Promise<ImapFlow> {
    // Note: Do not stop polling
    try {
      connection?.close();
    } catch (ex) {
      // Sometimes gives "Connection not available". Do nothing.
    }

    let isMain = this.connectionMain == connection;
    if (isMain) {
      this.connectionMain = null;
    } else if (this.connectionFetch == connection) {
      this.connectionFetch = null;
    }

    if (!(this.password || this.oAuth2?.isLoggedIn)) {
      return;
    }

    return await this.connection(isMain);
  }

  async hasCapability(capa: string): Promise<boolean> {
    let conn = await this.connection();
    let capabilities = await conn.capabilities;
    return await capabilities.has(capa);
  }

  async listFolders(): Promise<void> {
    await this.storage.readFolderHierarchy(this);

    // listTree() doesn't return the message count and is not well-implemented
    let foldersInfo = await (await this.connection()).list({
      statusQuery: {
        messages: true, // Total msg count
        recent: true, // \Recent msg count
        unseen: true, // Unseen msg count
      },
    });
    // console.log("folders", foldersFlat);
    let currentFolders = new ArrayColl<IMAPFolder>();
    this.readFolders(foldersInfo, null, this.rootFolders as ArrayColl<IMAPFolder>, currentFolders);

    for (let folder of this.getAllFolders()) {
      if (!currentFolders.includes(folder as IMAPFolder)) {
        await folder.deleteItLocally();
        continue;
      }
      if (!folder.dbID) {
        await this.storage.saveFolder(folder);
      } else {
        await this.storage.saveFolderProperties(folder);
      }
    }
  }

  readFolders(allFoldersInfo: any[], parent: IMAPFolder, subFolders: Collection<IMAPFolder>, resultAllFolders: Collection<IMAPFolder>): void {
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
      resultAllFolders.add(subFolder);
      if (!this.pathDelimiter && folderInfo.delimiter) {
        this.pathDelimiter = folderInfo.delimiter;
      }
      this.readFolders(allFoldersInfo, subFolder, subFolder.subFolders as ArrayColl<IMAPFolder>, resultAllFolders);
    }
  }

  getFolderByPath(path: string): IMAPFolder | null {
    // only for casting the type
    return super.getFolderByPath(path) as IMAPFolder | null;
  }

  protected stopPolling() {
    for (let folder of this.getAllFolders()) {
      (folder as IMAPFolder).stopPolling();
    }
  }

  async logout(alsoOAuth2 = true): Promise<void> {
    this.stopPolling();
    await this.connectionMain?.logout();
    await this.connectionFetch?.logout();
    if (this.oAuth2 && alsoOAuth2) {
      await this.oAuth2.logout();
    }
  }

  async send(email: EMail): Promise<void> {
    assert(this.outgoing, "SMTP server is not set up for IMAP account " + this.name);
    if (!this.isLoggedIn) {
      await this.login(true);
    }
    // Assume that SMTP and IMAP server have the same oAuth2 login
    this.outgoing.oAuth2 = this.oAuth2;

    await this.outgoing.send(email);
    await this.saveSent(email);
  };

  protected async saveSent(email: EMail): Promise<void> {
    let sentFolder = this.getSpecialFolder(SpecialFolder.Sent);
    await sentFolder.addMessage(email);
  }

  fromConfigJSON(config: any) {
    super.fromConfigJSON(config);
    this.pollIntervalMinutes = sanitize.integer(config.pollIntervalMinutes, this.pollIntervalMinutes);
  }
  toConfigJSON(): any {
    let json = super.toConfigJSON();
    json.pollIntervalMinutes = this.pollIntervalMinutes;
    return json;
  }

  newFolder(): IMAPFolder {
    return new IMAPFolder(this);
  }
}

export class IMAPCommandError extends SpecificError {
}

const useragent = {
  name: appName,
  version: appVersion,
  'support-url': siteRoot,
};
