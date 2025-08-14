import { WebBasedAuth } from "./WebBasedAuth";
import type { OAuth2UIMethod } from "./UI/OAuth2UIMethod";
import type { OAuth2 } from "./OAuth2";
import { OAuth2LoginNeeded } from "./OAuth2Error";
import { OAuth2Tab } from "./UI/OAuth2Tab";
import type { OWAAccount } from "../Mail/OWA/OWAAccount";
import { owaFindFoldersRequest } from "../Mail/OWA/Request/OWAFolderRequests";
import { appGlobal } from "../app";
import { assert, NotReached, type URLString } from "../util/util";

/** Log into OWA web interface via browser. Mimics the `OAuth2` API. */
export class OWAAuth extends WebBasedAuth {
  declare account: OWAAccount;
  ui: OAuth2Tab | null = null;
  isLoggedIn = false;

  constructor(account: OWAAccount) {
    super(account);
  }

  // Called from `TBProfile.readMailAccount()`
  setTokenURLPasswordAuth(url: string | null | undefined) {
  }

  // Unused
  get authorizationHeader(): never {
    throw new NotReached();
  }

  // Called from `OWAAccount.loginCommon()`
  async login(interactive: boolean): Promise<string> {
    assert(this.account, "Need to set account first");
    if (this.isLoggedIn) {
      return;
    }
    if (!interactive) {
      throw new OAuth2LoginNeeded();
    }
    return this.loginWithUI();
  }

  // Called from above to match behaviour of OAuth2 class
  async loginWithUI(): Promise<string> {
    this.ui = new OAuth2Tab(this);
    await this.ui.login();
    this.ui = null;
    return "";
  }

  // Called from `prepareLogin()` during account setup
  // ui is probably not actually set at this point, but whatever
  abort() {
    this.ui?.abort();
  }

  // Called from `OWAAccount.logout()`
  async logout() {
    this.isLoggedIn = false;
    return appGlobal.remoteApp.OWA.clearStorageData(this.account.partition);
  }

  // Unused
  async reset(): Promise<never> {
    throw new NotReached();
  }

  // Called from `startLogin()` during account setup
  async getAccessTokenFromAuthCode(authCode: string): Promise<string> {
    if (!await this.account.testLoggedIn()) {
      throw new OAuth2LoginNeeded();
    }
    return "";
  }

  // Called from `OAuth2Embed.login()` and `OAuth2Tab.login()`
  async getAuthURL(): Promise<URLString> {
    return this.account.url;
  }

  // Called from `OAuth2Embed.urlChanged()` and `OAuth2Tab.urlChanged()`
  async isAuthDoneURL(url: URLString): Promise<boolean> {
    return this.isLoggedIn = await this.account.testLoggedIn();
  }

  // Called from `OAuth2Embed.success()` and `OAuth2Tab.success()`
  getAuthCodeFromDoneURL(url: URLString): string {
    return "";
  }

  // Called from `MailAccount.toConfigJSON()`
  toConfigJSON() {
  }
}
