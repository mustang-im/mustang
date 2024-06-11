import { OAuth2UI } from "./OAuth2UI";
import { OAuth2ServerError } from "./OAuth2Error";
import { assert, type URLString } from "../util/util";

/**
 * Opens a new window for OAuth2 login,
 * monitors the URL changes, and returns the `authCode`.
 */
export class OAuth2Window extends OAuth2UI {
  /**
   * Does an interactive login
   * @returns authCode
   * @throws OAuth2Error
   */
  async login(): Promise<string> {
    let doneURL = `http://localhost/login-success`;
    let url = this.oAuth2.getAuthURL(doneURL);
    let popup = window.open(url, "_blank", "center,oauth2popup") as Window;
    assert(popup, "Failed to open OAuth2 window");
    let state = new URL(url).searchParams.get("state");
    return await new Promise((resolve, reject) => {
      let ipcRenderer = (window as any).electron.ipcRenderer; // TODO use JPC, or remove window
      let weClosed = false;
      let handleNavigation = (event, urlStr: URLString) => {
        try {
          console.log("OAuth2 window new page is Done URL", urlStr.startsWith(doneURL), urlStr);
          let url = new URL(urlStr);
          let urlParams = Object.fromEntries(url.searchParams);
          url.hash = url.search = "";
          if (url.href.startsWith(doneURL) && urlParams.state == state) {
            console.log("  is Done");
            ipcRenderer.removeListener('oauth2-navigate', handleNavigation);
            ipcRenderer.removeListener('oauth2-close', handleClose);
            weClosed = true;
            popup.close();
            this.oAuth2.scope = urlParams.scope || this.oAuth2.scope;
            let authCode = urlParams.code;
            if (authCode) {
              resolve(authCode);
            } else {
              reject(new OAuth2ServerError(urlParams));
            }
          }
        } catch (ex) {
          reject(ex);
          weClosed = true;
          popup.close();
        }
      }
      let handleClose = (event, value) => {
        if (!popup.closed) {
          return;
        }
        ipcRenderer.removeListener('oauth2-navigate', handleNavigation);
        ipcRenderer.removeListener('oauth2-close', handleClose);
        if (!weClosed) {
          reject(new Error("Authentication window was closed by user"));
        }
      }
      ipcRenderer.on('oauth2-navigate', handleNavigation);
      ipcRenderer.on('oauth2-close', handleClose);
    });
  }
}
