import { newOAuth2UI, OAuth2UIMethod, mapBackOAuth2UIMethod } from "./UI/OAuth2UIMethod";
import { OAuth2Error, OAuth2LoginNeeded, OAuth2ServerError } from "./OAuth2Error";
import { basicAuth } from "./httpAuth";
import type { Account } from "../Abstract/Account";
import { getPassword, setPassword, deletePassword } from "./passwordLocalStorage";
import { appGlobal } from "../app";
import { Observable, notifyChangedProperty } from "../util/Observable";
import { sanitize } from "../../../lib/util/sanitizeDatatypes";
import { assert, type URLString } from "../util/util";
import pkceChallenge from "pkce-challenge";
import { production } from "../build";

/**
 * Implements login via OAuth2
 *
 * - Returns an access token to caller.
 * - Saves the refresh token and uses that to get new access tokens, if possible.
 * - Honors expiry time and automatically refreshes the access token before expiry.
 *   The newest access token is available as `.accessToken` property.
 *
 * Callers should keep this object, and use `.accessToken` whenever making calls,
 * instead of storing the access token themselves, because the access token here
 * will be automatically refreshed before expiry.
 *
 * Before dropping (disposing of) this object, please call stop(). Otherwise,
 * the token will continue to be refreshed.
 */
export class OAuth2 extends Observable {
  account: Account;
  /** OAuth2 base URL */
  tokenURL: URLString;
  tokenURLPasswordAuth?: URLString;
  authURL: URLString;
  authDoneURL: URLString = `http://localhost:${production ? 5455 : 5453}/login-success`;
  scope: string;
  clientID = "open";
  clientSecret: string | null = null;
  doPKCE = false;
  codeVerifierPKCE?: string;
  @notifyChangedProperty
  accessToken?: string;
  @notifyChangedProperty
  protected refreshToken?: string;
  @notifyChangedProperty
  idToken: string;
  verificationToken: string; /** `state` URL param of authURL/doneURL */
  uiMethod: OAuth2UIMethod = OAuth2UIMethod.Window;

  expiresAt: Date | null = null;
  protected expiryTimout: NodeJS.Timeout;
  refreshErrorCallback = (ex: Error) => console.error(ex);
  idTokenCallback: (idToken: string, oAuth2: OAuth2) => void;

  constructor(account: Account, tokenURL: string, authURL: string, authDoneURL: string | null | undefined, scope: string, clientID: string, clientSecret?: string | null, doPKCE = false) {
    super();
    assert(tokenURL?.startsWith("https://") || tokenURL?.startsWith("http://"), "Need OAuth2 server token URL");
    assert(authURL?.startsWith("https://") || authURL?.startsWith("http://"), "Need OAuth2 login page URL");
    assert(!authDoneURL || authDoneURL?.startsWith("https://") || authDoneURL?.startsWith("http://"), "Need OAuth2 login finish URL");
    assert(scope, "Need OAuth2 scope");
    this.account = account;
    this.tokenURL = tokenURL;
    this.authURL = authURL;
    this.authDoneURL = authDoneURL ?? this.authDoneURL;
    this.scope = scope;
    this.clientID = clientID;
    this.clientSecret = clientSecret ?? null;
    this.doPKCE = doPKCE;
  }

  setTokenURLPasswordAuth(url: string | null | undefined) {
    assert(!url || url?.startsWith("https://") || url?.startsWith("http://"), "Malformed OAuth2 server token URL for password: " + url);
    this.tokenURLPasswordAuth = url || null;
  }

  /**
   * @returns the value for the 'Authentication' HTTP header
   */
  get authorizationHeader(): string {
    return `Bearer ${this.accessToken}`;
  }

  /**
   * @param interactive
   *   true = May open a login window for the user to complete, but only if needed.
   *     If possible, returns accessToken without UI.
   *     (If you want to force login UI, use `loginWithUI()`.)
   *   false = Only background login, e.g. using refreshToken.
   *     If an interactive login would be needed, it will fail with `OAuth2LoginNeeded`.
   * @returns accessToken
   * @throws OAuth2LoginNeeded, OAuth2Error
   */
  async login(interactive: boolean): Promise<string> {
    assert(this.account, "Need to set account first");
    if (this.accessToken) {
      return this.accessToken;
    }
    let refreshToken = this.refreshToken ?? await this.getRefreshTokenFromStorage();
    if (refreshToken) {
      try {
        return await this.getAccessTokenFromRefreshToken(refreshToken);
      } catch (ex) {
        console.error(ex);
        this.refreshToken = null;
        await this.deleteRefreshTokenFromStorage();
      }
    }
    if (this.account.password && this.tokenURLPasswordAuth) {
      try {
        return await this.loginWithPassword(this.account.username, this.account.password);
      } catch (ex) {
        console.error(ex);
      }
    }
    if (!interactive) {
      throw new OAuth2LoginNeeded();
    }
    return await this.loginWithUI();
  }

  /**
   * @returns accessToken
   */
  async loginWithUI(): Promise<string> {
    let ui = newOAuth2UI(this.uiMethod, this);
    let authCode = await ui.login();
    return await this.getAccessTokenFromAuthCode(authCode);
  }

  /**
   * @returns accessToken
   * @throws OAuth2Error
   */
  async loginWithPassword(username: string, password: string): Promise<string> {
    assert(username && password, "Need username and password");
    assert(this.tokenURLPasswordAuth, "oAuth2 password login is not supported by this provider");
    let accessToken = this.getAccessTokenFromParams({
      grant_type: "password",
      username: username,
      password: password,
    }, {
      Authentication: basicAuth(username, password),
    }, this.tokenURLPasswordAuth);
    return accessToken;
  }

  /** clearLogin(), and also actively log out from the server.
   * The latter is currently not implemented */
  async logout(): Promise<void> {
    this.reset();
  }

  /** Forgets the current login and deletes the refresh token */
  async reset(): Promise<void> {
    this.stop();
    this.accessToken = undefined;
    this.refreshToken = undefined;
    this.deleteRefreshTokenFromStorage();
  }

  get isLoggedIn(): boolean {
    return !!this.accessToken;
  }

  /**
   * @returns accessToken
   * @throws OAuth2Error
   */
  async getAccessTokenFromAuthCode(authCode: string): Promise<string> {
    return await this.getAccessTokenFromParams({
      grant_type: "authorization_code",
      code: authCode,
      // Microsoft: This *has* to be the same redirect URL that was used for the login page
      redirect_uri: this.authDoneURL,
    });
  }

  /**
   * @returns accessToken
   * @throws OAuth2Error
   */
  async getAccessTokenFromRefreshToken(refreshToken: string): Promise<string> {
    return await this.getAccessTokenFromParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    });
  }

  /**
   * @returns accessToken
   * @throws OAuth2Error
   */
  protected async getAccessTokenFromParams(params: any, additionalHeaders?: any, tokenURL: string = this.tokenURL): Promise<string> {
    params.scope = this.scope;
    params.client_id = this.clientID;
    if (this.clientSecret) {
      params.client_secret = this.clientSecret;
    }
    if (this.doPKCE && params.grant_type == "authorization_code") {
      assert(!!this.codeVerifierPKCE, "Missing code verifier");
      params.code_verifier = this.codeVerifierPKCE;
    }

    let response = await appGlobal.remoteApp.postHTTP(tokenURL, params, "json", {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        ...additionalHeaders,
      },
      timeout: 3000,
      throwHttpErrors: false,
    });
    let data = response.data;
    if (data.error) {
      throw new OAuth2ServerError(data);
    }
    if (!data.access_token) {
      throw new OAuth2Error(data);
    }
    this.accessToken = data.access_token;
    if (data.id_token) {
      this.idToken = data.id_token;
      if (this.idTokenCallback) {
        // Allows to set `this.account.username`, needed by `storeRefreshToken()`
        this.idTokenCallback(this.idToken, this);
      }
    }
    if (data.refresh_token) {
      this.refreshToken = data.refresh_token;
      await this.storeRefreshToken(this.refreshToken);
    }
    if (data.expires_in) {
      let seconds = parseInt(data.expires_in);
      if (seconds) {
        this.refreshInSeconds(seconds - 5);
        let expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + seconds);
        this.expiresAt = expiresAt;
      }
    }
    return this.accessToken;
  }

  async getAuthURL(doneURL?: URLString): Promise<URLString> {
    this.verificationToken = Math.random().toString().slice(2);
    this.authDoneURL = doneURL ?? this.authDoneURL; // needed for getAccessTokenFromAuthCode()
    let params = new URLSearchParams({
      client_id: this.clientID,
      response_type: "code",
      redirect_uri: doneURL ?? this.authDoneURL,
      response_mode: "query",
      scope: this.scope,
      state: this.verificationToken,
      login_hint: this.account.username,
    });

    try {
      if (this.doPKCE) {
        const pkce = await pkceChallenge();
        this.codeVerifierPKCE = pkce.code_verifier;
        params.append("code_challenge", pkce.code_challenge);
        params.append("code_challenge_method", "S256");
      }
    } catch (ex) {
      this.account.errorCallback(ex);
    }
    return this.authURL + "?" + params;
  }

  /** Helper for auth Done URL */
  isAuthDoneURL(url: URLString): boolean {
    let urlParams = Object.fromEntries(new URL(url).searchParams);
    console.log("OAuth2 page change to", url, "doneURL is", this.authDoneURL, "matches", this.authDoneURL == url,
      "is auth done", url.startsWith(this.authDoneURL) && this.verificationToken && urlParams.state == this.verificationToken);
    return url.startsWith(this.authDoneURL) &&
      this.verificationToken && urlParams.state == this.verificationToken;
  }

  /**
   * Helper for auth Done URL
   * @param url The done URL @see isAuthDoneURL()
   * @returns authCode
   * @throws OAuth2ServerError
   */
  getAuthCodeFromDoneURL(url: URLString): string {
    let urlParams = Object.fromEntries(new URL(url).searchParams);
    this.scope = urlParams.scope || this.scope;
    let authCode = urlParams.code;
    if (authCode) {
      return authCode;
    } else {
      throw new OAuth2ServerError(urlParams);
    }
  }

  refreshInSeconds(seconds: number): void {
    if (this.expiryTimout) {
      clearTimeout(this.expiryTimout);
    }
    this.expiryTimout = setTimeout(async () => {
      try {
        if (this.refreshToken) {
          await this.getAccessTokenFromRefreshToken(this.refreshToken);
        }
      } catch (ex) {
        this.refreshErrorCallback(ex);
      }
    }, seconds * 1000);
  }

  /**
   * Stop refreshing the access token.
   * You must call `stop()` or `logout()` before dropping this `OAuth2Login` object.
   */
  stop() {
    if (this.expiryTimout) {
      clearTimeout(this.expiryTimout);
    }
    this.expiresAt = null;
  }

  static fromConfigJSON(json: any, account: Account): OAuth2 {
    let o = new OAuth2(
      account,
      sanitize.url(json.tokenURL),
      sanitize.url(json.authURL),
      sanitize.url(json.authDoneURL, null),
      sanitize.nonemptystring(json.scope),
      sanitize.nonemptystring(json.clientID, "mail"),
      sanitize.nonemptystring(json.clientSecret, null),
      sanitize.boolean(json.doPKCE, false),
    );
    o.uiMethod = sanitize.translate(json.uiMethod,
        mapBackOAuth2UIMethod, o.uiMethod);
    // You have to set username and password in caller
    return o;
  }
  toConfigJSON(): any {
    return {
      tokenURL: this.tokenURL,
      authURL: this.authURL,
      authDoneURL: this.authDoneURL,
      scope: this.scope,
      clientID: this.clientID,
      clientSecret: this.clientSecret,
      doPKCE: this.doPKCE,
      uiMethod: this.uiMethod,
    };
  }

  /**
   * @returns refreshToken (or null, if not available)
   */
  protected async getRefreshTokenFromStorage(): Promise<string | null> {
    return await getPassword(this.storageKey);
  }
  protected async deleteRefreshTokenFromStorage(): Promise<void> {
    await deletePassword(this.storageKey);
  }
  protected async storeRefreshToken(refreshToken: string): Promise<void> {
    assert(refreshToken, "Nothing to store");
    await setPassword(this.storageKey, refreshToken);
  }
  protected get storageKey(): string {
    let host = new URL(this.tokenURL).host.replaceAll(".", "-");
    let username = this.account.username.replace(/@/, "-").replaceAll(".", "-");
    return `oauth2.refreshToken.${host}.${username}`;
  }
}
