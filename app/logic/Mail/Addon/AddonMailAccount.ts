import { MailAccount, DeleteStrategy } from "../MailAccount";
import { AddonFolder } from "./AddonFolder";
import type { EMail } from "../EMail";
import { CreateMIME } from "../SMTP/CreateMIME";
import { findOrCreatePersonUID, type PersonUID } from "../../Abstract/PersonUID";
import { AuthMethod } from "../../Abstract/Account";
import { AddonState, type Addon } from "../../Addons/Addon";
import { addonProtocols, AddonProtocol, type AddonAccountSetup, type AddonProtocolAccount } from "../../Addons/AddonProtocols";
import type { AccountData, JSONValue } from "../../Addons/Sandbox/MustangAPI";
import { appGlobal } from "../../app";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { notifyChangedProperty } from "../../util/Observable";
import { RunOnce } from "../../util/flow/RunOnce";
import { UserError } from "../../util/util";
import { gt } from "../../../l10n/l10n";
import { ArrayColl } from "svelte-collections";

/** A mail account whose protocol an addon implements.
 * The addon does only the server talk. Folders and messages are stored and shown like those of other protocols.
 * Everything that the addon returns is checked here, in `AddonFolder` and in `AddonEMail`. */
export class AddonMailAccount extends MailAccount implements AddonProtocolAccount {
  readonly protocol: string;
  /** The protocol of the running addon, while logged in */
  @notifyChangedProperty
  connection: AddonProtocol | null = null;
  /** For the error message, when the addon is not installed */
  addonName = "";
  /** What the `setup` UI of the protocol gave for this account */
  extra: JSONValue | null = null;
  deleteStrategy = DeleteStrategy.MoveToTrash;
  protected loginRunOnce = new RunOnce<void>();
  protected startupRunOnce = new RunOnce<void>();
  /** Collections hold their observers weakly */
  protected protocolsObserver = {
    added: (protocols: AddonProtocol[]) => this.protocolsAdded(protocols),
    removed: (protocols: AddonProtocol[]) => this.protocolsRemoved(protocols),
  };

  /** @param protocol `AddonProtocol.accountProtocol()` */
  constructor(protocol: string) {
    super();
    this.protocol = protocol;
    this.authMethod = AuthMethod.Password;
    addonProtocols.registerObserver(this.protocolsObserver);
  }

  /** The protocol, while its addon runs */
  get registeredProtocol(): AddonProtocol | undefined {
    return addonProtocols.find(protocol => protocol.protocol == this.protocol);
  }

  /** The installed addon with this protocol, running or not */
  get addon(): Addon | undefined {
    return appGlobal.addons.installed.find(addon => addon.manifest.protocols.some(contribution =>
      AddonProtocol.accountProtocol(addon.id, contribution.id) == this.protocol));
  }

  get isLoggedIn(): boolean {
    return !!this.connection;
  }

  async login(interactive: boolean): Promise<void> {
    await this.loginRunOnce.runOnce(async () => {
      await super.login(interactive);
      if (!this.dbID) {
        await this.storage.saveAccount(this);
      }
      await this.storage.readFolderHierarchy(this);
      let protocol = await this.waitForProtocol();
      this.addonName = protocol.addon.name;
      await protocol.call("login", [this.accountData(), this.password]);
      if (!addonProtocols.includes(protocol)) {
        throw this.fatalError = this.notAvailableError();
      }
      this.fatalError = null;
      protocol.accounts.set(this.id, this);
      this.connection = protocol;
    });
  }

  /** For setup: Checks the login, without storing anything */
  async verifyLogin(): Promise<void> {
    let protocol = await this.waitForProtocol();
    await protocol.call("login", [this.accountData(), this.password]);
  }

  /** @throws UserError, if the addon is not installed, not enabled, or didn't register the protocol */
  protected async waitForProtocol(): Promise<AddonProtocol> {
    const kStartTimeoutMS = 30000;
    let protocol = this.registeredProtocol;
    let addon = this.addon;
    if (!protocol && addon?.isEnabled && addon.state != AddonState.Error) {
      // It's starting, e.g. at app start
      protocol = await this.protocolRegistered(kStartTimeoutMS);
    }
    if (!protocol) {
      throw this.fatalError = this.notAvailableError();
    }
    return protocol;
  }

  protected async protocolRegistered(timeoutMS: number): Promise<AddonProtocol | undefined> {
    let observer: { added(protocols: AddonProtocol[]): void, removed(): void };
    let timeout: ReturnType<typeof setTimeout>;
    try {
      return await new Promise(resolve => {
        observer = {
          added: protocols => {
            let protocol = protocols.find(protocol => protocol.protocol == this.protocol);
            if (protocol) {
              resolve(protocol);
            }
          },
          removed() {},
        };
        addonProtocols.registerObserver(observer);
        timeout = setTimeout(() => resolve(undefined), timeoutMS);
      });
    } finally {
      clearTimeout(timeout);
      addonProtocols.unregisterObserver(observer);
    }
  }

  protected notAvailableError(): UserError {
    return new UserError(gt`The addon ${this.addon?.name ?? this.addonName} is not available`);
  }

  /** The addon was enabled or installed: Connect, like at app start */
  protected protocolsAdded(protocols: AddonProtocol[]): void {
    if (protocols.some(protocol => protocol.protocol == this.protocol) &&
        !this.isLoggedIn && this.loginOnStartup && appGlobal.emailAccounts.contains(this)) {
      this.loginAndStartup(false)
        .catch(this.errorCallback);
    }
  }

  /** The addon was disabled or removed: Offline, with the local data */
  protected protocolsRemoved(protocols: AddonProtocol[]): void {
    if (protocols.includes(this.connection)) {
      this.connection = null;
      this.fatalError = this.notAvailableError();
    }
  }

  async syncOnStartup(): Promise<void> {
    await this.startupRunOnce.runOnce(async () => {
      await super.syncOnStartup();
    });
  }

  async disconnect(): Promise<void> {
    if (this.connection?.accounts.get(this.id) == this) {
      this.connection.accounts.delete(this.id);
    }
    this.connection = null;
  }

  /**
   * Runs an operation of the protocol in the addon, for this account
   * @param args after the account
   * @returns Untrusted data from the addon
   */
  async call(operation: string, ...args: unknown[]): Promise<unknown> {
    if (!this.connection) {
      await this.login(false);
    }
    let protocol = this.connection;
    if (!protocol) {
      throw this.notAvailableError();
    }
    return await protocol.call(operation, [this.accountData(), ...args]);
  }

  /** What the addon gets as `account` */
  protected accountData(): AccountData {
    return {
      id: this.id,
      name: this.name,
      emailAddress: this.emailAddress,
      username: this.username,
      serverURL: this.url,
      extra: this.extra,
    };
  }

  /** Takes what the user entered in the `setup` UI of the protocol */
  fromAddonSetup(setup: AddonAccountSetup): void {
    this.name = setup.name;
    this.username = setup.username;
    this.password = setup.password ?? this.password;
    this.authMethod = AuthMethod.Password;
    this.url = setup.serverURL;
    this.extra = setup.extra;
    this.addonName = this.registeredProtocol?.addon.name ?? this.addonName;
  }

  async listFolders(): Promise<void> {
    const kMaxFolders = 10000;
    let list = this.checkList(await this.call("listFolders"), kMaxFolders, "folders");
    await this.storage.readFolderHierarchy(this);
    let oldFolders = this.getAllFolders();
    let currentFolders = new Map<string, AddonFolder>();
    let parentIDs = new Map<string, string | null>();
    for (let json of list) {
      try {
        let id = this.checkID(json?.id);
        if (currentFolders.has(id)) {
          continue;
        }
        let folder = this.findFolder(folder => folder.id == id) as AddonFolder ?? this.newFolder();
        folder.fromAddon(json);
        currentFolders.set(id, folder);
        parentIDs.set(id, json.parentID == null ? null : this.checkID(json.parentID));
      } catch (ex) {
        this.dataError(ex);
      }
    }
    // Only now, because the addon may list a folder before its parent
    for (let [id, folder] of currentFolders) {
      let parent = currentFolders.get(parentIDs.get(id)) ?? null;
      let ancestorID = parentIDs.get(id);
      for (let i = 0; ancestorID && ancestorID != id && i < parentIDs.size; i++) {
        ancestorID = parentIDs.get(ancestorID);
      }
      if (ancestorID == id) {
        this.dataError(new Error(`Folder ${folder.name}: The addon made the folder a subfolder of itself. Showing it at the top level.`));
        parent = null;
      }
      let parentFolders = parent ? parent.subFolders : this.rootFolders;
      if (parentFolders.contains(folder)) {
        continue;
      }
      (folder.parent?.subFolders ?? this.rootFolders).remove(folder);
      folder.parent = parent;
      parentFolders.add(folder);
    }
    for (let folder of oldFolders) {
      if (!currentFolders.has(folder.id)) {
        await folder.deleteItLocally();
      }
    }
    for (let folder of currentFolders.values()) {
      if (folder.dbID) {
        await this.storage.saveFolderProperties(folder);
      } else {
        await this.storage.saveFolder(folder);
      }
    }
  }

  async createToplevelFolder(name: string): Promise<AddonFolder> {
    let json = this.checkObject(await this.call("createFolder", null, name), "folder");
    let folder = await super.createToplevelFolder(name) as AddonFolder;
    folder.fromAddon(json);
    await folder.save();
    return folder;
  }

  async send(email: EMail): Promise<void> {
    let mime = await CreateMIME.getMIME(email);
    let recipients = new ArrayColl<PersonUID>();
    recipients.addAll(email.to);
    recipients.addAll(email.cc);
    recipients.addAll(email.bcc);
    await this.call("send", mime, email.from.emailAddress, recipients.contents.map(person => person.emailAddress));
  }

  /** The addon says that the server has new messages in this folder */
  onNewMessages(folderID: string): void {
    let folder = this.findFolder(folder => folder.id == folderID) as AddonFolder;
    folder?.newMessagesOnServer();
  }

  // Checks of the data from the addon

  /** @returns An ID of the server */
  checkID(value: unknown): string {
    const kMaxLength = 1000;
    if (typeof value != "string" || !value || value.length > kMaxLength) {
      throw new Error(`${this.name}: The addon gave an invalid ID`);
    }
    return value;
  }

  /** @returns Text for the user, without control characters, cut to `maxLength` */
  checkText(value: unknown, maxLength: number, fallback: string | null): string | null {
    if (typeof value != "string") {
      return fallback;
    }
    // Control characters, and bidi controls, which can make a text look like another
    let text = value.substring(0, maxLength).replace(/[\u0000-\u001F\u007F-\u009F؜‎‏‪-‮⁦-⁩]+/gu, " ").trim();
    return text || fallback;
  }

  /** @returns A number of messages or bytes */
  checkCount(value: unknown, fallback: number | null): number | null {
    const kMax = 1e12;
    return Number.isSafeInteger(value) && (value as number) >= 0 && (value as number) <= kMax ? value as number : fallback;
  }

  checkList(value: unknown, maxLength: number, what: string): any[] {
    if (!Array.isArray(value)) {
      throw new Error(`${this.name}: The addon gave no list of ${what}`);
    }
    if (value.length > maxLength) {
      throw new Error(`${this.name}: The addon gave more than ${maxLength} ${what}`);
    }
    return value;
  }

  checkObject(value: unknown, what: string): any {
    if (!value || typeof value != "object" || Array.isArray(value)) {
      throw new Error(`${this.name}: The addon gave no ${what}`);
    }
    return value;
  }

  checkPerson(value: any): PersonUID {
    const kMaxLength = 1000;
    let emailAddress = typeof value?.emailAddress == "string" && value.emailAddress.length <= kMaxLength
      ? sanitize.emailAddress(value.emailAddress, null)
      : null;
    return findOrCreatePersonUID(emailAddress, this.checkText(value?.name, kMaxLength, null));
  }

  fromConfigJSON(json: any) {
    super.fromConfigJSON(json);
    this.addonName = sanitize.label(json.addonName, "");
    this.extra = json.extra ?? null;
  }
  toConfigJSON(): any {
    let json = super.toConfigJSON();
    json.addonName = this.addonName;
    json.extra = this.extra;
    return json;
  }

  newFolder(): AddonFolder {
    return new AddonFolder(this);
  }
}
