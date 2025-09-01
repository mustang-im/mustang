import { OAuth2Localhost } from "./OAuth2Localhost";
import { openExternalURL } from "../../util/backend-wrapper";
import type { URLString } from "../../util/util";

/**
 * Opens the OS default browser with the OAuth2 login page.
 */
export class OAuth2SystemBrowser extends OAuth2Localhost {
  loginURLCallback = async (url: URLString) => {
    await openExternalURL(url);
  }
}
