import { Workspace, getWorkspaceByID, randomAccountColor } from "./Workspace";
import type { WebBasedAuth } from "../Auth/WebBasedAuth";
import { appGlobal } from "../app";
import { Observable, notifyChangedProperty } from "../util/Observable";
import { SpecificError, AbstractFunction, assert } from "../util/util";
import { sanitize } from "../../../lib/util/sanitizeDatatypes";
import { ArrayColl, Collection } from "svelte-collections";

export class Account extends Observable {
  id: string;
  /** The primary ID in the type-specific database (not in accounts DB) */
  dbID: number | string | null = null;
  @notifyChangedProperty
  name: string;
  /** A `data:` URL to an image that represents this account.
   * E.g. the company logo. */
  @notifyChangedProperty
  icon: string | any | null = null;
  @notifyChangedProperty
  color: string = "#FFFFFF";
  /** Class ID. Must be overwritten by subclasses. Written to account prefs. */
  readonly protocol: string = null;
  /** Protocol-specific address for the sync server. Only only for some types of accounts. */
  @notifyChangedProperty
  url: string | null = null;
  @notifyChangedProperty
  username: string | null = null;
  @notifyChangedProperty
  authMethod = AuthMethod.Unknown;
  @notifyChangedProperty
  oAuth2: WebBasedAuth = null;
  @notifyChangedProperty
  password: string | null = null;
  @notifyChangedProperty
  workspace: Workspace | null = null;
  @notifyChangedProperty
  realname: string = appGlobal.me?.name;
  /** @see `mainAccount` */
  _mainAccount: Account | null = null;
  /** Internal. Used only during load. */
  _mainAccountID: string | null = null;
  @notifyChangedProperty
  acceptBrokenTLSCerts = false;
  @notifyChangedProperty
  loginOnStartup = true;
  /** Error that broke the server connection, unrecoverable, including login failures. */
  fatalError: Error | null = null;
  /** Non-fatal errors, including when processing a single email */
  readonly errors = new ArrayColl<Error>();
  /** Will be called, when there are errors on the connection
   * which cannot be attributed directly to an API function called,
   * e.g. errors while processing server messages. */
  errorCallback = (ex) => console.error(ex);

  constructor() {
    super();
    this.id = findFreeAccountID();
    this.color = randomAccountColor();
  }

  get isLoggedIn(): boolean {
    return false;
  }

  /**
   * @param interactive
   *   true: If needed, open UI to ask user to log in manually,
   *     e.g. using password, MFA, or passkey
   *   false: Log in with stored credentials, e.g. stored
   *     password, stored OAuth2 refreshToken or similar.
   * @throws
   *   NeedInteraction We don't have stored credentials,
   *     or they expired normally.
   *   LoginFailed We have stored credentials, and we tried them,
   *     but the server refused to accept them.
   *     (Typically for reasons other than expiry.)
   */
  async login(interactive: boolean): Promise<void> {
    this.errors.clear();
  }

  /** For setup only. Test that the login works. */
  async verifyLogin(): Promise<void> {
    await this.login(true);
  }

  async logout(): Promise<void> {
  }

  /**
   * If the main account is loaded, this child account should be loaded automatically after.
   * If the main account is deleted, then this account should be deleted as well.
   * Child accounts share the OAuth2 login with their main accounts.
   * If this is e.g. a calendar that belongs to an email account,
   * this property references the email account.
   * Also used for SMTP accounts to reference the IMAP or POP3 account.
   */
  get mainAccount(): Account {
    return this._mainAccount;
  }
  set mainAccount(val: Account) {
    this._mainAccount = val;
  }
  get isDependentAccount(): boolean {
    return !!this._mainAccount;
  }
  dependentAccounts(): Collection<Account> {
    return getAllAccounts().filter(acc => acc.mainAccount == this);
  }
  initFromMainAccount(main: Account) {
    this.mainAccount = main;
    this.name = main.name;
    this.url = main.url;
    this.color = main.color;
    this.icon = main.icon;
    this.workspace = main.workspace;
    this.username = main.username;
  }

  /** The cookie store to use when loading this account. For `<webview partition="persist:...">` */
  get webSessionID(): string | null {
    return this.id;
  }

  /** User needs a software license to use this account */
  needsLicense(): boolean {
    return false;
  }

  /** Saves the config in this account to disk.
   * Does not save the contents, e.g. messages. */
  async save(): Promise<void> {
    throw new AbstractFunction();
  }

  /** Saves the config in this account and its dependent accounts to disk. */
  async saveAll(): Promise<void> {
    await this.save(); // must be first, because of foreign key constraint
    for (let dependent of this.dependentAccounts()) {
      await dependent.save();
    }
  }

  /** Deletes this account from the configuration,
   * and likely deletes all local information from this account.
   * Does not delete the account on the server. */
  async deleteIt(): Promise<void> {
    for (let dependent of this.dependentAccounts()) {
      await dependent.deleteIt();
    }
  }

  fromConfigJSON(json: any) {
    assert(typeof (json) == "object", "Config must be a JSON object");
    (this.id as any) = sanitize.alphanumdash(json.id);
    assert(this.protocol == sanitize.alphanumdash(json.protocol), `Account object of wrong type passed in: data ${json.protocol} != class ${this.protocol}`);
    this.username = sanitize.string(json.username, null);
    this.authMethod = sanitize.integerRange(json.authMethod, 0, 20);
    this.url = sanitize.url(json.url, null);
    this.realname = sanitize.label(json.realname, appGlobal.me.name ?? "");
    this.name = sanitize.label(json.name, this.username);
    this.acceptBrokenTLSCerts = sanitize.boolean(json.acceptBrokenTLSCerts, false);
    this.loginOnStartup = sanitize.boolean(json.loginOnStartup, this.loginOnStartup);
    this.color = sanitize.nonemptystring(json.color, this.color);
    this.icon = sanitize.url(json.icon, null, ["data"]);
    this.workspace = getWorkspaceByID(sanitize.string(json.workspaceID, null));
  }
  toConfigJSON(): any {
    assert(this.id, "Need account ID to save");
    let json: any = {};
    json.id = this.id;
    json.protocol = this.protocol;
    json.name = this.name;
    json.realname = this.realname;
    json.username = this.username;
    json.authMethod = this.authMethod;
    json.url = this.url;
    json.workspaceID = this.workspace?.id;
    json.acceptBrokenTLSCerts = this.acceptBrokenTLSCerts;
    json.loginOnStartup = this.loginOnStartup;
    json.color = this.color;
    json.icon = this.icon;
    return json;
  }

  toString(): string {
    return `${this.protocol.toUpperCase()} account: ${this.name}, username ${this.username}, username ${this.username}, URL ${this.url}`;
  }
}

export enum AuthMethod {
  Unknown = 0,
  Password = 1,
  OAuth2 = 2,
  GSSAPI = 3,
  CRAMMD5 = 5,
  NTLM = 6,
  None = 7, // No authentication at all. E.g. SMTP
}

let lastID = 0;
let usedIDs = new Set<string>();
function findFreeAccountID(): string {
  let allAccounts = getAllAccounts();

  for (let i = ++lastID; true; i++) {
    let id = "account" + i;
    if (allAccounts.find(acc => acc.id == id) || usedIDs.has(id)) {
      continue;
    }
    usedIDs.add(id);
    return id;
  }
}

export function getAllAccounts(): Collection<Account> {
  let allAccounts = new ArrayColl<Account>();
  allAccounts.addAll(appGlobal.emailAccounts);
  allAccounts.addAll(appGlobal.emailAccounts.map(acc => acc.outgoing).filter(o => !!o));
  allAccounts.addAll(appGlobal.chatAccounts);
  allAccounts.addAll(appGlobal.addressbooks);
  allAccounts.addAll(appGlobal.calendars);
  allAccounts.addAll(appGlobal.meetAccounts);
  return allAccounts;
}

/**
 * Sets Account.mainAccount, for all accounts.
 * Called after all the account objects have been created.
 */
export function setMainAccounts(): void {
  let accounts = getAllAccounts();
  for (let account of accounts) {
    let mainID = account._mainAccountID;
    if (mainID && !account.mainAccount) {
      account.mainAccount = accounts.find(acc => acc.id == mainID);
    }
  }
}

export class ConnectError extends SpecificError {
}

export class LoginError extends SpecificError {
  authFail = true;
  isUserError = true;
}
