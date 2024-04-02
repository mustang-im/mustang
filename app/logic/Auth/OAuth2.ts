import { assert, NotImplemented } from "../util/util";
import axios from "axios";

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
  oauth2BaseURL: string;
  scope: string;
  clientID: string;
  accessToken?: string;
  protected refreshToken?: string;
  idToken: string;

  protected username: string;
  protected password: string;

  expiresAt: Date | null = null;
  protected expiryTimout: NodeJS.Timeout;
  refreshErrorCallback = (ex: Error) => console.error(ex);
  protected axios: any;

  constructor(oauth2BaseURL: string, scope: string, clientID: string) {
    assert(oauth2BaseURL.startsWith("https://") || oauth2BaseURL.startsWith("http://"), "Need OAuth2 URL");
    assert(scope, "Need OAuth2 scope");
    this.oauth2BaseURL = oauth2BaseURL;
    this.scope = scope;
    this.clientID = clientID;
    this.axios = axios.create({
      baseURL: `${this.oauth2BaseURL}/token`,
      timeout: 3000,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'text/json',
      }
    });
  }

  /**
   * @returns the value for the 'Authentication' HTTP header
   */
  get authorizationHeader(): string {
    return `Bearer ${this.accessToken}`;
  }

  /**
   * @returns accessToken
   * @throws OAuth2Error
   */
  async login(): Promise<string> {
    if (this.accessToken) {
      return this.accessToken;
    }
    if (this.accessToken) {
      return this.accessToken;
    }
    if (this.password) {
      await this.loginWithPassword(this.username, this.password);
    }
    throw new NotImplemented();
  }
  /**
   * @returns accessToken
   * @throws OAuth2Error
   */
  async loginWithPassword(username: string, password: string): Promise<string> {
    assert(username && password, "Need username and password");
    //const basicAuth = Buffer.from(`${username}:${password}`).toString("base64");
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
    let response = await this.axios.post('', new URLSearchParams(params), {
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
  /**
   * @returns accessToken
   */
  async loginWithUI(): Promise<string> {
    throw new NotImplemented();
  }

  async logout(): Promise<void> {
    this.stop();
    this.accessToken = undefined;
    this.refreshToken = undefined;
    this.deleteRefreshTokenFromStorage();
  }

  refreshInSeconds(seconds: number) {
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
    let host = this.oauth2BaseURL.replace(/.*:\/\//, "");
    return `oauth2.refreshToken.${this.username}.${host}`;
  }
}

export class OAuth2Error extends Error {
  details: any;
  constructor(json: any) {
    let msg = json.error_description
      ?? json.error?.replace("_", " ")
      ?? "Login failed. Unknown OAuth2 error.";
    super(msg);
    this.details = json;
  }
}
