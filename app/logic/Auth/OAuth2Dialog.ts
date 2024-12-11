// SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>
//
// SPDX-License-Identifier: EUPL-1.2

import { OAuth2UI } from "./OAuth2UI";
import type { LoginDialogMustangApp } from "../../frontend/Mail/MailMustangApp";
import type { URLString } from "../util/util";
import { ArrayColl } from "svelte-collections";

/**
 * Opens the OAuth2 login webpage in a dialog within the app main window,
 * monitors the URL changes, and returns the `authCode`.
 */
export class OAuth2Dialog extends OAuth2UI {
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
    // console.log("OAuth2 start url", dialog.startURL);
    oAuth2DialogOpen.add(this);
    return new Promise((resolve, reject) => {
      this.doneFunc = resolve;
      this.failFunc = reject;
    });
  }
  urlChange(url: URLString) {
    // console.log("OAuth2 page change to", url);
    if (this.oAuth2.isAuthDoneURL(url) && this.doneFunc) {
      try {
        this.doneFunc(this.oAuth2.getAuthCodeFromDoneURL(url));
        oAuth2DialogOpen.remove(this);
      } catch (ex) {
        this.failed(ex);
      }
    }
  }
  failed(ex: Error) {
    if (!this.failFunc) {
      return;
    }
    oAuth2DialogOpen.remove(this);
    this.failFunc(ex);
    this.failFunc = null;
    this.doneFunc = null;
  }
}

export const oAuth2DialogOpen = new ArrayColl<OAuth2Dialog>();
