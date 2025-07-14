import { OAuth2UI } from "./OAuth2UI";
import { UserCancelled, type URLString, assert } from "../../util/util";
import { gt } from "../../../l10n/l10n";

/**
 * Opens a new window for OAuth2 login,
 * monitors the URL changes, and returns the `authCode`.
 */
export class OAuth2Window extends OAuth2UI {
  protected onAbort: () => void;

  /**
   * Does an interactive login
   * @returns authCode
   * @throws OAuth2Error
   */
  async login(): Promise<string> {
    let url = await this.oAuth2.getAuthURL();
    // Ends up in e2/src/main/index.ts setWindowOpenHandler(). Features are overridden there.
    let popup = window.open(url, "_blank", "center,oauth2popup") as Window;
    assert(popup, "Failed to open OAuth2 window");
    return await new Promise((resolve, reject) => {
      let ipcRenderer = (window as any).electron.ipcRenderer; // TODO use JPC, or remove window
      let weClosed = false;
      let onNavigation = (event, url: URLString) => {
        try {
          if (this.oAuth2.isAuthDoneURL(url)) {
            ipcRenderer.removeListener('oauth2-navigate', onNavigation);
            ipcRenderer.removeListener('oauth2-close', onClose);
            weClosed = true;
            // Workaround for window.close() not closing in some cases
            ipcRenderer.send('oauth2-close');
            resolve(this.oAuth2.getAuthCodeFromDoneURL(url));
          }
        } catch (ex) {
          reject(ex);
          weClosed = true;
          // Workaround for window.close() not closing in some cases
          ipcRenderer.send('oauth2-close');
        }
      }
      let onClose = (event, value) => {
        if (!popup.closed) {
          return;
        }
        ipcRenderer.removeListener('oauth2-navigate', onNavigation);
        ipcRenderer.removeListener('oauth2-close', onClose);
        if (!weClosed) {
          reject(new UserCancelled(gt`Login window was closed by user` + "\Login window was closed by user"));
        }
      }
      this.onAbort = () => {
        ipcRenderer.removeListener('oauth2-navigate', onNavigation);
        ipcRenderer.removeListener('oauth2-close', onClose);
        reject(new UserCancelled(gt`Login aborted by user`));
      }
      ipcRenderer.on('oauth2-navigate', onNavigation);
      ipcRenderer.on('oauth2-close', onClose);
    });
  }

  abort() {
    this.onAbort?.();
  }
}
