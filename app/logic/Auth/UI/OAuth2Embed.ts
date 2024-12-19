import { OAuth2UI } from "./OAuth2UI";
import { assert, type URLString } from "../../util/util";

/**
 * Opens the OAuth2 login webpage in a dialog within the app main window,
 * monitors the URL changes, and returns the `authCode`.
 */
export class OAuth2Embed extends OAuth2UI {
  startURL: URLString;
  protected doneFunc: (authCode: string) => void;
  protected failFunc: (ex: Error) => void;
  /** The caller needs to set this to the <webview> element
   * where he wants the login webpage to appear. */
  webviewE: HTMLIFrameElement;

  /**
   * Does an interactive login
   * @returns authCode
   * @throws OAuth2Error
   */
  async login(): Promise<string> {
    this.startURL = await this.oAuth2.getAuthURL();
    console.log("OAuth2 start url", this.startURL);
    this.webviewE.hidden = false;
    this.webviewE.setAttribute("url", this.startURL);
    return new Promise((resolve, reject) => {
      this.doneFunc = resolve;
      this.failFunc = reject;
    });
  }
  urlChange(url: URLString) {
    console.log("OAuth2 page change to", url);
    if (this.oAuth2.isAuthDoneURL(url)) {
      this.success(url);
    }
  }
  close() {
    this.webviewE.hidden = true;
    this.webviewE.setAttribute("url", "");
  }
  success(finalURL: URLString) {
    this.close();
    assert(this.doneFunc, "Need doneFunc");
    try {
      this.doneFunc(this.oAuth2.getAuthCodeFromDoneURL(finalURL));
    } catch (ex) {
      this.failed(ex);
    }
  }
  failed(ex: Error) {
    this.close();
    assert(this.failFunc, "Need failFunc");
    this.failFunc(ex);
    this.failFunc = null;
    this.doneFunc = null;
  }
}
