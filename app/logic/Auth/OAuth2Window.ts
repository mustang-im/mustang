import { OAuth2UI } from "./OAuth2UI";
import { UserCancelled, type URLString, assert } from "../util/util";

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
    return await new Promise((resolve, reject) => {
      let ipcRenderer = (window as any).electron.ipcRenderer; // TODO use JPC, or remove window
      let weClosed = false;
      let handleNavigation = (event, url: URLString) => {
        try {
          if (this.oAuth2.isDoneURL(url)) {
            ipcRenderer.removeListener('oauth2-navigate', handleNavigation);
            ipcRenderer.removeListener('oauth2-close', handleClose);
            weClosed = true;
            popup.close();
            resolve(this.oAuth2.getAuthCodeFromDoneURL(url));
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
          reject(new UserCancelled("Authentication window was closed by user"));
        }
      }
      ipcRenderer.on('oauth2-navigate', handleNavigation);
      ipcRenderer.on('oauth2-close', handleClose);
    });
  }
}
