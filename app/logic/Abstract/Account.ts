import { Workspace } from "./Workspace";
import { appGlobal } from "../app";
import { Observable, notifyChangedProperty } from "../util/Observable";
import { AbstractFunction, assert } from "../util/util";
import { ArrayColl, Collection } from "svelte-collections";
import type { ComponentType } from "svelte";

export class Account extends Observable {
  id: string;
  dbID: number | null = null;
  @notifyChangedProperty
  name: string;
  @notifyChangedProperty
  icon: ComponentType | string | null = null;
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

  /** Will be called, when there are errors on the connection
   * which cannot be attributed directly to an API function called,
   * e.g. errors while processing server messages. */
  errorCallback = (ex) => console.error(ex);

  constructor() {
    super();
    this.id = findFreeAccountID();
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
    assert(typeof (config) == "object", "Config must be a JSON object");
  }
  toConfigJSON(): any {
    return {};
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
  allAccounts.addAll(appGlobal.addressbooks);
  allAccounts.addAll(appGlobal.emailAccounts);
  allAccounts.addAll(appGlobal.chatAccounts);
  return allAccounts;
}
