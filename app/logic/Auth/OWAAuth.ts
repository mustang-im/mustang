import type { OAuth2UIMethod } from "./UI/OAuth2UIMethod";
import type { OAuth2 } from "./OAuth2";
import { OAuth2LoginNeeded } from "./OAuth2Error";
import { OAuth2Tab } from "./UI/OAuth2Tab";
import type { OWAAccount} from "../Mail/OWA/OWAAccount";
import { appGlobal } from "../app";
import { Observable } from "../util/Observable";
import { assert, type URLString } from "../util/util";

/// Class to perform fake OAuth2 to log into OWA web interface via browser
export class OWAAuth extends Observable implements OAuth2 {
  ui: OAuth2Tab | null = null;
  isLoggedIn = false;

  constructor(public account: OWAAccount) {
    super();
  }

  // Called from `TBProfile.readMailAccount()`
  setTokenURLPasswordAuth(url: string | null | undefined) {
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

  // Called from `startLogin()` during account setup
  async getAccessTokenFromAuthCode(authCode: string): Promise<string> {
    await appGlobal.remoteApp.OWA.fetchSessionData(this.account.partition, this.account.url, false);
    return "";
  }

  // Called from `OAuth2Embed.login()` and `OAuth2Tab.login()`
  async getAuthURL(): Promise<URLString> {
    return this.account.url;
  }

  // Called from `OAuth2Embed.urlChanged()` and `OAuth2Tab.urlChanged()`
  async isAuthDoneURL(url: URLString): Promise<boolean> {
    try {
      await appGlobal.remoteApp.OWA.fetchSessionData(this.account.partition, this.account.url, false);
      this.isLoggedIn = true;
    } catch (ex) {
      this.isLoggedIn = false;
    }
    return this.isLoggedIn;
  }

  // Called from `OAuth2Embed.success()` and `OAuth2Tab.success()`
  getAuthCodeFromDoneURL(url: URLString): string {
    return "";
  }

  // Called from `MailAccount.toConfigJSON()`
  toConfigJSON() {
  }

  // Unused stuff but needed to fake out TypeScript for implements OAuth2
  // Can't actually derive from OAuth2 because all its assertions would fail
  // Note: This requires all of OAuth2's members to be public
  tokenURL: URLString;
  authURL: URLString;
  authDoneURL: URLString;
  scope: string;
  clientID: string;
  clientSecret: string | null;
  doPKCE: boolean;
  idToken: string;
  verificationToken: string;
  uiMethod: OAuth2UIMethod;
  expiresAt: Date | null;
  expiryTimout: NodeJS.Timeout; // sic
  refreshErrorCallback: (ex : Error) => void;
  idTokenCallback: (idToken: string, oAuth2: OAuth2) => void;
  authorizationHeader: string;
  loginWithPassword: (username: string, password: string) => Promise<string>;
  reset: () => Promise<void>;
  getAccessTokenFromRefreshToken: (refreshToken: string) => Promise<string>;
  getAccessTokenFromParams: (params: any, additionaHeaders?: any, tokenURL?: string) => Promise<string>;
  refreshInSeconds: (seconds: number) => void;
  stop: () => void;
  getRefreshTokenFromStorage: () => Promise<string | null>;
  deleteRefreshTokenFromStorage: () => Promise<void>;
  storeRefreshToken: (refreshToken: string) => Promise<void>;
  storageKey: string;
}
