import { OAuth2UI } from "./OAuth2UI";
import { NotImplemented, type URLString } from "../util/util";

/**
 * Opens the OAuth2 login webpage in a dialog within the app main window,
 * monitors the URL changes, and returns the `authCode`.
 */
export class OAuth2Dialog extends OAuth2UI {
  /**
   * Does an interactive login
   * @returns authCode
   * @throws OAuth2Error
   */
  async login(url: URLString): Promise<string> {
    throw new NotImplemented();
  }
}
