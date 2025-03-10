import { Workspace, randomAccountColor } from "./Workspace";
import { appGlobal } from "../app";
import { Observable, notifyChangedProperty } from "../util/Observable";
import { SpecificError, AbstractFunction, assert } from "../util/util";
import { sanitize } from "../../../lib/util/sanitizeDatatypes";
import { ArrayColl, Collection } from "svelte-collections";
import type { ComponentType } from "svelte";

export class Account extends Observable {
  id: string;
  dbID: number | string | null = null;
  @notifyChangedProperty
  name: string;
  @notifyChangedProperty
  icon: ComponentType | string | null = null;
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
  password: string | null = null;
  @notifyChangedProperty
  workspace: Workspace | null = null;
  @notifyChangedProperty
  userRealname: string = appGlobal.me?.name;
  @notifyChangedProperty
  acceptBrokenTLSCerts = false;
  @notifyChangedProperty
  loginOnStartup = true;
  /** Error that broke the server connection, unrecoverable, including login failures. */
  fatalError: Error = null;
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


  /** Saves the config in this account to disk.
   * Does not save the contents, e.g. messages. */
  async save(): Promise<void> {
    throw new AbstractFunction();
  }

  /** Deletes this account from the configuration,
   * and likely deletes all local information from this account.
   * Does not delete the account on the server. */
  async deleteIt(): Promise<void> {
    throw new AbstractFunction();
  }

  fromConfigJSON(config: any) {
    console.log("account config json reading", config);
    assert(typeof (config) == "object", "Config must be a JSON object");
    this.acceptBrokenTLSCerts = sanitize.boolean(config.acceptBrokenTLSCerts, false);
    this.loginOnStartup = sanitize.boolean(config.loginOnStartup, this.loginOnStartup);
    this.color = sanitize.nonemptystring(config.color, this.color);
  }
  toConfigJSON(): any {
    let json: any = {};
    json.acceptBrokenTLSCerts = this.acceptBrokenTLSCerts;
    json.loginOnStartup = this.loginOnStartup;
    json.color = this.color;
    console.log("account config json saving", json);
    return json;
  }

  toString(): string {
    return `${this.protocol.toUpperCase()} account: ${this.name}, username ${this.username}, username ${this.username}, URL ${this.url}`;
  }
}

let lastID = 0;
function findFreeAccountID(): string {
  let allAccounts = getAllAccounts();

  for (let i = ++lastID; true; i++) {
    let id = "account" + i;
    if (allAccounts.contents.some(acc => acc.id == id)) {
      continue;
    }
    return id;
  }
}

function getAllAccounts(): Collection<Account> {
  let allAccounts = new ArrayColl<Account>();
  allAccounts.addAll(appGlobal.emailAccounts);
  allAccounts.addAll(appGlobal.emailAccounts.map(acc => acc.outgoing).filter(o => !!o));
  allAccounts.addAll(appGlobal.chatAccounts);
  allAccounts.addAll(appGlobal.addressbooks);
  allAccounts.addAll(appGlobal.calendars);
  allAccounts.addAll(appGlobal.meetAccounts);
  return allAccounts;
}

export class ConnectError extends SpecificError {
}

export class LoginError extends SpecificError {
  authFail = true;
  isUserError = true;
}
