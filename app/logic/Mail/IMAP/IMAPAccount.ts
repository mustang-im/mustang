import { MailAccount, DeleteStrategy } from "../MailAccount";
import { AuthMethod } from "../../Abstract/Account";
import { TLSSocketType } from "../../Abstract/TCPAccount";
import { IMAPFolder } from "./IMAPFolder";
import { appGlobal } from "../../app";
import type { EMail } from "../EMail";
import { ConnectError, LoginError } from "../../Abstract/Account";
import { SpecialFolder, MailShareCombinedPermissions, MailShareIndividualPermissions } from "../Folder";
import { assert, NotReached, SpecificError } from "../../util/util";
import { Lock } from "../../util/Lock";
import { Throttle } from "../../util/Throttle";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { appName, appVersion, siteRoot } from "../../build";
import { ArrayColl, MapColl, type Collection } from "svelte-collections";
import type { ImapFlow } from "../../../../backend/node_modules/imapflow";
import type { PersonUID } from "../../Abstract/PersonUID";
import { gt } from "../../../l10n/l10n";

export class IMAPAccount extends MailAccount {
  readonly protocol: string = "imap";
  acceptOldTLS = false;
  pathDelimiter: string; /** Separator in folder path. E.g. '.' or '/', depending on server */
  deleteStrategy: DeleteStrategy = DeleteStrategy.MoveToTrash;
  /**
   * An object representing the IMAP namespaces on this server.
   * See @IMAPNamespace, @IMAPNamespaceRecord
   */
  namespaces = kDefaultNamespaces;
  /** if polling is enabled, how often to poll.
   * In minutes. 0 or null = polling disabled */
  pollIntervalMinutes = 10;
  protected connections = new MapColl<ConnectionPurpose, ImapFlow>();
  protected connectLock = new MapColl<ConnectionPurpose, Lock>();
  connectionLock = new MapColl<ImapFlow, Lock>();
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
    if (await this.hasCapability('NAMESPACE')) {
      this.namespaces = await this.getNamespaces();
    }
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
        AuthMethod.CRAMMD5,
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
          loginMethod: this.authMethod == AuthMethod.CRAMMD5 ? "AUTH=CRAM-MD5" : undefined,
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
      this.attachListeners(connection);

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
      this.connectionLock.set(connection, new Lock());
      if (purpose == ConnectionPurpose.Main) {
        this.notifyObservers();
      }
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

    assert(connection, "Reconnect: Connection unknown");
    try {
      await connection.close();
    } catch (ex) {
      // Sometimes gives "Connection not available". Do nothing.
    }
    this.connectionLock.delete(connection);

    let purpose = this.connections.getKeyForValue(connection);
    assert(purpose, "Connection purpose unknown");
    this.connections.set(purpose, null);
    this.notifyObservers();

    if (this.authMethod == AuthMethod.OAuth2 && this.oAuth2 &&
        !this.oAuth2?.isLoggedIn) {
      await this.oAuth2.login(false);
    }
    if (!(this.password || this.oAuth2?.isLoggedIn)) {
      throw new LoginError(new Error(), "Reconnect failed due to missing login");
    }

    return await this.connection(false, purpose);
  }

  async hasCapability(capa: string): Promise<boolean> {
    let conn = await this.connection();
    // conn.capabilities doesn't work; it's an object property,
    // and JPC doesn't notice direct changes to properties.
    // Fortunately `conn.run("CAPABILITY")` has its own cache,
    // and only makes a network request if absolutely necessary.
    let capabilities = await conn.run("CAPABILITY");
    return await capabilities.has(capa);
  }

  /**
   * If the connection supports it, this will return the server's namespaces.
   * @see this.namespaces
   */
  async getNamespaces(): Promise<Record<IMAPNamespace, {prefix: string, delimiter: string}[]>> {
    let conn = await this.connection();
    // This should be `return await conn.run("NAMESPACE");`...
    type ImapFlowAttribute = { type: string, value: string };
    type ImapFlowNamespace = [prefix: ImapFlowAttribute, delimiter: ImapFlowAttribute];
    type ImapFlowNamespaceList = ImapFlowNamespace[] | null;
    type ImapFlowNamespaces = [personal: ImapFlowNamespaceList, other: ImapFlowNamespaceList, shared: ImapFlowNamespaceList];
    let namespaces = Object.assign({}, kDefaultNamespaces);
    let response = await conn.exec("NAMESPACE", false, {
      untagged: {
        NAMESPACE: async (untagged: { attributes?: ImapFlowNamespaces }) => {
          if (Array.isArray(untagged.attributes)) {
            let entries = untagged.attributes.map(list => Array.isArray(list)
              ? list.map(entry => ({
                prefix: sanitize.string(entry[0].value),
                delimiter: sanitize.nonemptystring(entry[1].value),
              }))
              : null);
            if (entries[0]) {
              namespaces.personal = entries[0];
            }
            if (entries[1]) {
              namespaces.other = entries[1];
            }
            if (entries[2]) {
              namespaces.shared = entries[2];
            }
          }
        }
      }
    });
    await response.next();
    return namespaces;
  }

  async listFolders(): Promise<void> {
    await this.storage.readFolderHierarchy(this);

    // listTree() doesn't return the message count and is not well-implemented
    let conn = await this.connection();
    let lock = await this.connectionLock.get(conn).lock();
    let foldersInfo;
    try {
      foldersInfo = await conn.list({
        statusQuery: {
          messages: true, // Total msg count
          recent: true, // \Recent msg count
          unseen: true, // Unseen msg count
        },
      });
    } finally {
      lock?.release();
    }
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
      let conn = await this.connections.get(purpose);
      if (!conn) {
        continue;
      }
      conn.logout();
      this.connections.delete(purpose);
      this.connectionLock.delete(conn);
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
    await this.outgoing.send(email);
    await this.saveSent(email);
  };

  protected async saveSent(email: EMail): Promise<void> {
    let sentFolder = email.folder ?? this.getSpecialFolder(SpecialFolder.Sent);
    email.isRead = true;
    await sentFolder.addMessage(email);
  }

  async getSharedPersons(): Promise<ArrayColl<PersonUID> | undefined> {
    // well, some of them at least...
    return await (this.inbox as IMAPFolder).getSharedPersons();
  }

  async deleteSharedPerson(otherPerson: PersonUID) {
    for (let folder of this.getAllFolders() as ArrayColl<IMAPFolder>) {
      await folder.removePermission(otherPerson);
    }
  }

  async addSharedPerson(otherPerson: PersonUID, mailFolder: IMAPFolder | null, includeSubfolders: boolean, access: MailShareCombinedPermissions, ...permissions: MailShareIndividualPermissions[]) {
    let foldersToShare = (!mailFolder ? this.getAllFolders() : includeSubfolders ? mailFolder.getInclusiveDescendants() : new ArrayColl<IMAPFolder>([mailFolder])) as ArrayColl<IMAPFolder>;
    let rights = "";
    switch (access) {
    case MailShareCombinedPermissions.Read:
      rights = "lr";
      break;
    case MailShareCombinedPermissions.FlagChange:
      rights = "lrsw";
      break;
    case MailShareCombinedPermissions.Modify:
      rights = "lrswikxte";
      break;
    case MailShareCombinedPermissions.Custom:
      if (permissions.includes(MailShareIndividualPermissions.Read)) {
        rights += "r";
      }
      if (permissions.includes(MailShareIndividualPermissions.FlagChange)) {
        rights += "sw";
      }
      if (permissions.includes(MailShareIndividualPermissions.Delete)) {
        rights += "te";
      }
      if (permissions.includes(MailShareIndividualPermissions.Create)) {
        rights += "i";
      }
      if (permissions.includes(MailShareIndividualPermissions.DeleteFolder)) {
        rights += "x";
      }
      if (permissions.includes(MailShareIndividualPermissions.CreateSubfolders)) {
        rights += "k";
      }
      break;
    default:
      throw new NotReached();
    }
    for (let folder of foldersToShare) {
      await folder.addPermission(otherPerson, rights);
    }
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

/**
 * The three categories of IMAP namespace.
 * personal = user's own folders
 * other = other users' folders
 * shared = company public folders
 * Each category has an array of namespace records.
 */
type IMAPNamespace = "personal" | "other" | "shared";
/**
 * An object representing an IMAP namespace record.
 * The prefix allows you to determine whether a path is in this namespace.
 * The delimiter tells you how you should construct subfolder paths,
 * because it can be different for each namespace for some reason...
 */
interface IMAPNamespaceRecord { prefix: string; delimiter: string };
/** The effective namespaces for servers that don't support namespaces. */
const kDefaultNamespaces: Record<IMAPNamespace, IMAPNamespaceRecord[]> = { personal: [{ prefix: "", delimiter: "." }], other: [], shared: [] };

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
