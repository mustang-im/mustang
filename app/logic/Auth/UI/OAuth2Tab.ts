import { OAuth2UI } from "./OAuth2UI";
import type { LoginDialogMustangApp } from "../../../frontend/Mail/MailMustangApp";
import { assert, type URLString } from "../../util/util";
import { ArrayColl } from "svelte-collections";

/**
 * Opens the OAuth2 login webpage in a dialog within the app main window,
 * monitors the URL changes, and returns the `authCode`.
 */
export class OAuth2Tab extends OAuth2UI {
  startURL: URLString;
  protected doneFunc: (authCode: string) => void;
  protected failFunc: (ex: Error) => void;
  mustangApp: LoginDialogMustangApp;

  /**
   * Does an interactive login
   * @returns authCode
   * @throws OAuth2Error
   */
  async login(): Promise<string> {
    this.startURL = await this.oAuth2.getAuthURL();
    // console.log("OAuth2 start url", this.startURL);
    assert(oAuth2TabsOpen._observers.size, "OAuth2 tab: Observer got lost"); // mailMustangApp.tabsObserver is gone
    oAuth2TabsOpen.add(this);
    return new Promise((resolve, reject) => {
      this.doneFunc = resolve;
      this.failFunc = reject;
    });
  }
  urlChanged(url: URLString) {
    // console.log("OAuth2 page change to", url);
    if (this.oAuth2.isAuthDoneURL(url)) {
      this.success(url);
    }
  }
  close() {
    oAuth2TabsOpen.remove(this);
  }
  success(finalURL: URLString) {
    assert(this.doneFunc, "Need doneFunc");
    this.close();
    try {
      this.doneFunc(this.oAuth2.getAuthCodeFromDoneURL(finalURL));
    } catch (ex) {
      this.failed(ex);
    }
  }
  failed(ex: Error) {
    assert(this.failFunc, "Need failFunc");
    this.close();
    this.failFunc(ex);
    this.failFunc = null;
    this.doneFunc = null;
  }
}

export const oAuth2TabsOpen = new ArrayColl<OAuth2Tab>();
