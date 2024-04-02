import { appGlobal } from "../app";
import type { EWSAccount } from "../Mail/EWS/EWSAccount";

const kAuthClientId = "5cf03223-8b81-4558-ae82-a8e31e66a889";
const kAuthScope = "offline_access https://outlook.office365.com/.default";
const kAuthDone = "https://login.microsoftonline.com/common/oauth2/nativeclient";
const kAuthPage = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize";
const kTokenURL = "https://login.microsoftonline.com/common/oauth2/v2.0/token";
const kTokenURLPasswordAuth = "https://login.microsoftonline.com/organizations/oauth2/v2.0/token";
const kLogoutURL = "https://login.microsoftonline.com/common/oauth2/logout";

export class OAuth2MS {
  _accessToken: string | null = null;
  _promiseAccessToken: Promise<string> | null = null;
  readonly account: EWSAccount;
  readonly interactive: boolean;

  constructor(account: EWSAccount, interactive: boolean) {
    this.account = account;
    this.interactive = interactive;
  }

  async getAccessToken(): Promise<string> {
    if (this._accessToken) {
      return this._accessToken;
    }

    if (!this._promiseAccessToken) {
      this._promiseAccessToken = (async () => {
        try {
          this._accessToken = await this.getNewAccessToken();
          return this._accessToken;
        } finally {
          this._promiseAccessToken = null;
        }
      })();
    }
    return this._promiseAccessToken;
  }

  clearAccessToken() {
    this._accessToken = null;
  }

  async logout() {
    await fetch(kLogoutURL, {
      credentials: "include",
    });
  }

  async getNewAccessToken(): Promise<string> {
    let accessToken: string | null = null;
    let refreshToken: string | null = await this.getRefreshTokenFromStorage();
    if (refreshToken) {
      try {
        ({ accessToken, refreshToken } = await this.getAccessTokenFromRefreshToken(refreshToken));
      } catch (ex) {
        // This refresh token is probably invalid, so clear it.
        this.deleteRefreshTokenFromStorage();
      }
    }
    if (!accessToken && this.account.password) {
      try {
        ({ accessToken, refreshToken } = await this.getAccessTokenFromPassword());
      } catch (ex) {
        if (!ex.consentRequired) {
          // Password auth didn't work; don't bother trying it again.
          this.account.password = null;
          localStorage.removeItem(this.account.prefBranch + "password");
        }
      }
    }
    if (!accessToken && this.interactive) {
      let authCode = await this.openLoginWindow();
      ({ accessToken, refreshToken } = await this.getAccessTokenFromAuthCode(authCode));
    }
    if (!accessToken) {
      throw new Error("Need interactive login");
    }
    if (refreshToken) {
      this.storeRefreshToken(refreshToken);
    }
    return accessToken;
  }

  async getAccessTokenFromRefreshToken(aRefreshToken: string): Promise<{ accessToken: string, refreshToken: string | null }> {
    return await this._getAccessTokenFromParams({
      grant_type: "refresh_token",
      refresh_token: aRefreshToken,
    });
  }

  async getAccessTokenFromAuthCode(aAuthCode: string): Promise<{ accessToken: string, refreshToken: string | null }> {
    return await this._getAccessTokenFromParams({
      grant_type: "authorization_code",
      code: aAuthCode,
      redirect_uri: kAuthDone,
    });
  }

  async getAccessTokenFromPassword(): Promise<{ accessToken: string, refreshToken: string | null }> {
    return await this._getAccessTokenFromParams({
      grant_type: "password",
      username: this.account.username,
      password: this.account.password,
    });
  }

  async _getAccessTokenFromParams(aParams: { [key: string]: string; }): Promise<{ accessToken: string, refreshToken: string | null }> {
    aParams.client_id = kAuthClientId;
    aParams.scope = kAuthScope;
    let response = await appGlobal.remoteApp.postHTTP(aParams.grant_type == "password" ? kTokenURLPasswordAuth : kTokenURL, aParams, { validateStatus: null, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
    if (!response.data.access_token) {
      throw new OAuth2ErrorEWS(response);
    }
    return { accessToken: response.data.access_token, refreshToken: response.data.refresh_token };
  }

  async getRefreshTokenFromStorage(): Promise<string> {
    return localStorage.getItem(this.account.prefBranch + "refreshToken");
  }

  async deleteRefreshTokenFromStorage() {
    localStorage.removeItem(this.account.prefBranch + "refreshToken");
  }

  async storeRefreshToken(refreshToken: string) {
    return localStorage.setItem(this.account.prefBranch + "refreshToken", refreshToken);
  }

  getAuthURL(aState: string): string {
    return kAuthPage + "?" + new URLSearchParams({
      client_id: kAuthClientId,
      response_type: "code",
      redirect_uri: kAuthDone,
      response_mode: "query",
      scope: kAuthScope,
      state: aState,
      login_hint: this.account.username,
    });
  }

  async openLoginWindow(): Promise<string> {
    // XXX how to log out?
    let state = Math.random().toString().slice(2);
    let url = this.getAuthURL(state);
    let popup = window.open(url, "_blank", "center,oauth2popup");
    return await new Promise((resolve, reject) => {
      let ipcRenderer = (window as any).electron.ipcRenderer; // TODO use JPC, or remove window
      let handleNavigation = (event, value) => {
        let url = new URL(value);
        let parameters = Object.fromEntries(url.searchParams);
        url.hash = url.search = "";
        if (url.href == kAuthDone && parameters.state == state) {
          ipcRenderer.removeListener('oauth2-navigate', handleNavigation);
          ipcRenderer.removeListener('oauth2-close', handleClose);
          popup.close();
          if (parameters.code) {
            resolve(parameters.code);
          } else {
            reject(new OAuth2ErrorEWS(parameters));
          }
        }
      }
      let handleClose = (event, value) => {
        if (popup.closed) {
          ipcRenderer.removeListener('oauth2-navigate', handleNavigation);
          ipcRenderer.removeListener('oauth2-close', handleClose);
          reject(new Error("Authentication window was closed by user"));
        }
      }
      ipcRenderer.on('oauth2-navigate', handleNavigation);
      ipcRenderer.on('oauth2-close', handleClose);
    });
  }
}

const kErrorConsentRequiredEWS = 65001;

class OAuth2ErrorEWS extends Error {
  consentRequired = false;
  constructor(aResponse) {
    let message = `OAuth error (${aResponse.status} ${aResponse.statusText})`;
    if (aResponse.data.error_description) {
      message = aResponse.data.error_description.split(/[\r\n]/)[0].replace(/^\w+: /, "");
    }
    super(message);
    if (aResponse.data.error_codes && aResponse.data.error_codes.includes(kErrorConsentRequiredEWS)) {
      this.consentRequired = true;
    }
  }
}
