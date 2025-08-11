import { WebAuth } from "../WebAuth";
import { assert, AbstractFunction } from "../../util/util";
import { Observable } from "../../util/Observable";

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
export class OAuth2UI extends Observable {
  oAuth2: WebAuth;

  constructor(oAuth2: WebAuth) {
    super();
    assert(oAuth2 instanceof WebAuth, "Need OAuth2 object");
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

  abort() {
  }
}
