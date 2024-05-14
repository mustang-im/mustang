import { OAuth2Window } from "./OAuth2Window";
import { assert, NotImplemented } from "../util/util";
import { appGlobal } from "../app";

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
export class OAuth2 {
  /** OAuth2 base URL */
  tokenURL: string;
  authURL: string;
  authDoneURL = "http://localhost/";
  scope: string;
  clientID: string;
  clientSecret: string | null = null;
  accessToken?: string;
  protected refreshToken?: string;
  idToken: string;

  protected username: string;
  protected password: string;

  expiresAt: Date | null = null;
  protected expiryTimout: NodeJS.Timeout;
  refreshErrorCallback = (ex: Error) => console.error(ex);

  constructor(tokenURL: string, authURL: string, scope: string, clientID: string, clientSecret?: string) {
    assert(tokenURL?.startsWith("https://") || tokenURL?.startsWith("http://"), "Need OAuth2 server token URL");
    assert(authURL?.startsWith("https://") || authURL?.startsWith("http://"), "Need OAuth2 login page URL");
    assert(scope, "Need OAuth2 scope");
    this.tokenURL = tokenURL;
    this.authURL = authURL;
    this.scope = scope;
    this.clientID = clientID;
    this.clientSecret = clientSecret ?? null;
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
    if (this.accessToken) {
      return this.accessToken;
    }
    if (this.accessToken) {
      return this.accessToken;
    }
    if (this.password) {
      await this.loginWithPassword(this.username, this.password);
    }
    if (!interactive) {
      throw new OAuth2LoginNeeded();
    }
    await this.loginWithUI();
  }

  /**
   * @returns accessToken
   */
  async loginWithUI(): Promise<string> {
    let ui = new OAuth2Window(this);
    let authCode = await ui.login();
    return await this.getAccessTokenFromAuthCode(authCode);
  }

  /**
   * @returns accessToken
   * @throws OAuth2Error
   */
  async loginWithPassword(username: string, password: string): Promise<string> {
    assert(username && password, "Need username and password");
    // node.js: const basicAuth = Buffer.from(`${username}:${password}`).toString("base64");
    const basicAuth = btoa(`${username}:${password}`);
    let accessToken = this.getAccessTokenFromParams({
      grant_type: "password",
      username: username,
      password: password,
    }, {
      Authentication: `Basic ${basicAuth}`,
    });
    this.username = username;
    this.password = password;
    return accessToken;
  }

  async logout(): Promise<void> {
    this.stop();
    this.accessToken = undefined;
    this.refreshToken = undefined;
    this.deleteRefreshTokenFromStorage();
  }

  /**
   * @returns accessToken
   * @throws OAuth2Error
   */
  async getAccessTokenFromAuthCode(authCode: string): Promise<string> {
    return await this.getAccessTokenFromParams({
      grant_type: "authorization_code",
      code: authCode,
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
  protected async getAccessTokenFromParams(params: any, additionalHeaders?: any): Promise<string> {
    params.scope = this.scope;
    params.client_id = this.clientID;
    let ky = await appGlobal.remoteApp.kyCreate({
      prefixUrl: `${this.tokenURL}/token`,
      timeout: 3000,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'text/json',
      }
    });
    let response = await ky.post('', new URLSearchParams(params), {
      headers: additionalHeaders,
    });
    let data = response.data;
    if (data.error || !data.access_token) {
      throw new OAuth2Error(data);
    }
    this.accessToken = data.access_token;
    if (data.refresh_token) {
      this.refreshToken = data.refresh_token;
    }
    if (data.id_token) {
      this.idToken = data.id_token;
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

  getAuthURL(aState: string): string {
    return this.authURL + "?" + new URLSearchParams({
      client_id: this.clientID,
      response_type: "code",
      redirect_uri: this.authDoneURL,
      response_mode: "query",
      scope: this.scope,
      state: aState,
      login_hint: this.username,
    });
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

  /**
   * @returns refreshToken (or null, if not available)
   */
  protected async getRefreshTokenFromStorage(): Promise<string | null> {
    return localStorage.getItem(this.storageKey) ?? null;
  }
  protected async deleteRefreshTokenFromStorage(): Promise<void> {
    localStorage.removeItem(this.storageKey);
  }
  protected async storeRefreshToken(refreshToken: string): Promise<void> {
    assert(refreshToken, "Nothing to store");
    localStorage.setItem(this.storageKey, refreshToken);
  }
  protected get storageKey(): string {
    let host = new URL(this.tokenURL).host;
    return `oauth2.refreshToken.${this.username}.${host}`;
  }
}

export class OAuth2Error extends Error {
}

export class OAuth2LoginNeeded extends Error {
  constructor() {
    super("Please login");
  }
}

export class OAuth2ServerError extends OAuth2Error {
  details: any;
  consentRequired = false;
  constructor(json: any) {
    let msg = json?.error_description?.split(/[\r\n]/)[0].replace(/^\w+: /, "")
      ?? json?.error?.replace("_", " ")
      ?? "Login failed. Unknown OAuth2 error.";
    super(msg);
    const kErrorConsentRequiredEWS = 65001;
    if (json.error_codes && json.error_codes.includes(kErrorConsentRequiredEWS)) {
      this.consentRequired = true;
    }
    this.details = json;
  }
}
