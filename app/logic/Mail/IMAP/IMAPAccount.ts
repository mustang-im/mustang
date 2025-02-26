import { MailAccount, TLSSocketType, AuthMethod, DeleteStrategy } from "../MailAccount";
import { IMAPFolder } from "./IMAPFolder";
import { appGlobal } from "../../app";
import type { EMail } from "../EMail";
import { ConnectError, LoginError } from "../../Abstract/Account";
import { SpecialFolder } from "../Folder";
import { assert, SpecificError } from "../../util/util";
import { Lock } from "../../util/Lock";
import { Throttle } from "../../util/Throttle";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { appName, appVersion, siteRoot } from "../../build";
import { ArrayColl, MapColl, type Collection } from "svelte-collections";
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
  protected connections = new MapColl<ConnectionPurpose, ImapFlow>();
  protected connectLock = new MapColl<ConnectionPurpose, Lock>();
  throttle = new Throttle(50, 1);

  constructor() {
    super();
    assert(appGlobal.remoteApp.createIMAPFlowConnection, "IMAP: Need backend");
    for (let purpose of connectionPurposes) {
      this.connectLock.set(purpose, new Lock());
    }
  }

  get isLoggedIn(): boolean {
    // return !!this.connectionMain?.authenticated; TODO authenticated is always false
    return !!this.connections.get(ConnectionPurpose.Main) || this.oAuth2?.isLoggedIn;
  }

  async login(interactive: boolean): Promise<void> {
    super.login(interactive);
    if (!this.dbID) {
      await this.storage.saveAccount(this);
    }
    await this.storage.readFolderHierarchy(this);

    await this.connection(interactive);
    await this.listFolders();
    this.notifyObservers();
    (this.inbox as IMAPFolder).startPolling();
  }

  async verifyLogin(): Promise<void> {
    await this.connection(true);
    this.logout(false);
  }

  async connection(interactive = false, purpose = ConnectionPurpose.Main): Promise<ImapFlow> {
    await this.throttle.throttle();
    let conn = this.connections.get(purpose);
    if (conn) {
      return conn;
    }
    let lock = await this.connectLock.get(purpose).lock();
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
        doSTARTTLS: this.tls == TLSSocketType.STARTTLS,
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
        disableAutoIdle: purpose != ConnectionPurpose.Main,
        maxIdleTime: 30 * 1000, // 30 s, refresh IDLE
        connectionTimeout: 5 * 1000, // 5 s connection timeout
        greetingTimeout: 5 * 1000, // 5 s greeting timeout
        socketTimeout: 30 * 60 * 1000, // 30 min of inactivity
        logger: false, // true, // Run backend using: `yarn run dev | npx pino-pretty -i time,msg`
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
      this.connections.set(purpose, connection);
      if (purpose == ConnectionPurpose.Main) {
        this.notifyObservers();
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

    let purpose = this.connections.getKeyForValue(connection);
    assert(purpose, "Connection purpose unknown");
    this.connections.set(purpose, null);
    this.notifyObservers();

    if (!this.oAuth2?.isLoggedIn) {
      await this.oAuth2.login(false);
    }
    if (!(this.password || this.oAuth2?.isLoggedIn)) {
      throw new LoginError(new Error(), "Reconnect failed due to missing login");
    }

    return await this.connection(false, purpose);
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
    let subFoldersInfo = foldersInfo.filter(folderInfo => folderInfo.parentPath == "");
    this.readFolders(null, this.rootFolders as ArrayColl<IMAPFolder>, subFoldersInfo, foldersInfo, currentFolders);

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

  /**
   * @param parent parent folder, to which to add the subfolders. null, if root.
   * @param addTo Array to add the subfolders to. Either `parent.subFolders` or `rootFolders`.
   * @param subFoldersInfo Source info of the subfolders that are to be created
   * @param allFoldersInfo Source info of all folders
   * @param resultAllFolders All result folders created so far
   */
  readFolders(parent: IMAPFolder, addTo: Collection<IMAPFolder>, subFoldersInfo: any[], allFoldersInfo: any[], resultAllFolders: Collection<IMAPFolder>): void {
    for (let folderInfo of subFoldersInfo) {
      let subFolder = addTo.find(folder => folder.path == folderInfo.path);
      if (subFolder) {
        if (folderInfo.status) {
          subFolder.fromFlow(folderInfo); // update with new info
        }
      } else if (folderInfo.path == "[Gmail]" || folderInfo.flags.has("\\NoSelect")) {
        let subFoldersInfo = allFoldersInfo.filter(f => f.parentPath == folderInfo.path);
        this.readFolders(parent, addTo, subFoldersInfo, allFoldersInfo, resultAllFolders);
        continue;
      } else {
        subFolder = new IMAPFolder(this);
        subFolder.fromFlow(folderInfo);
        addTo.add(subFolder);
        subFolder.parent = parent;
      }
      resultAllFolders.add(subFolder);
      if (!this.pathDelimiter && folderInfo.delimiter) {
        this.pathDelimiter = folderInfo.delimiter;
      }
      let subFoldersInfo = allFoldersInfo.filter(folderInfo => folderInfo.parentPath == subFolder.path);
      this.readFolders(subFolder, subFolder.subFolders as ArrayColl<IMAPFolder>, subFoldersInfo, allFoldersInfo, resultAllFolders);
    }
  }

  getFolderByPath(path: string): IMAPFolder | null {
    return this.findFolder(folder => folder.path == path) as IMAPFolder | null;
  }

  async createToplevelFolder(name: string): Promise<IMAPFolder> {
    let newFolder = await super.createToplevelFolder(name) as IMAPFolder;
    await (this.inbox as IMAPFolder).runCommand(async (conn) => {
      let created = await conn.mailboxCreate(name);
      newFolder.path = created.path;
    });
    console.log("IMAP folder created", name, newFolder.path);
    await newFolder.listMessages();
    return newFolder;
  }


  protected stopPolling() {
    for (let folder of this.getAllFolders()) {
      (folder as IMAPFolder).stopPolling();
    }
  }

  async logout(alsoOAuth2 = true): Promise<void> {
    this.stopPolling();
    for (let purpose of connectionPurposes) {
      await this.connections.get(purpose)?.logout();
    }
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
    let sentFolder = email.folder ?? this.getSpecialFolder(SpecialFolder.Sent);
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

export enum ConnectionPurpose {
  Main = "main",
  Fetch = "fetch",
  Display = "display",
}
const connectionPurposes = [ConnectionPurpose.Main, ConnectionPurpose.Fetch, ConnectionPurpose.Display];

export class IMAPCommandError extends SpecificError {
}

const useragent = {
  name: appName,
  version: appVersion,
  'support-url': siteRoot,
};
