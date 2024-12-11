// SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>
//
// SPDX-License-Identifier: EUPL-1.2

import { OAuth2 } from "./OAuth2";
import { assert, AbstractFunction, type URLString } from "../util/util";

/**
 * Shows a login page for OAuth2,
 * monitors the process, and returns the `authCode`.
 *
 * This can be implemented in various ways:
 * - Opening a dialog within the app, with the login website
 * - Opening a new window, with the login website
 * - Opening the system browser, with the login website
 * These mechanisms are implemented as subclasses.
 */
export class OAuth2UI {
  oAuth2: OAuth2;

  constructor(oAuth2: OAuth2) {
    assert(oAuth2 instanceof OAuth2, "Need OAuth2 object");
    this.oAuth2 = oAuth2;
  }

  /**
   * Does an interactive login
   * @returns authCode
   * @throws OAuth2Error
   */
  async login(): Promise<string> {
    throw new AbstractFunction();
  }
}
