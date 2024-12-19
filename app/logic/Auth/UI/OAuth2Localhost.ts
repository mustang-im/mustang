import { OAuth2UI } from "./OAuth2UI";
import { appGlobal } from "../../app";
import { assert, type URLString } from "../../util/util";

/**
 * Starts a local web server on http://localhost with a random port,
 * returns the login start URL, which you need to load in any browser,
 * and waits for the login page to redirect to the localhost end URL.
 * Extracts and returns the `authCode`.
 */
export class OAuth2Localhost extends OAuth2UI {
  /** Will be called when a login URL is ready.
   * Load this URL into the browser. */
  loginURLCallback: (url: URLString) => Promise<void>;

  async login(): Promise<string> {
    assert(this.loginURLCallback, "Need URL callback");
    // Maybe re-use the running server for multiple logins at the same time?
    // Would need to use a URL param to distinguish between the results.
    // Use random port. Do all OAuth2 providers support http://localhost:* ?
    let port = 1024 + Math.ceil(Math.random() * 64000);
    let server = await appGlobal.remoteApp.newHTTPServer();
    await server.start(port);
    // Close after 15 mins no result
    let killTimeout = setTimeout(() => {
      server.close();
    }, 15 * 60 * 1000);
    let doneURL = `http://localhost:${port}/login-success`;
    let url = await this.oAuth2.getAuthURL(doneURL);
    // console.log("OAuth2: Localhost: Load URL", url, "and done URL", doneURL);
    await this.loginURLCallback(url);
    return new Promise((resolve, reject) => {
      server.get("/login-success", (urlPath: URLString) => {
        try {
          // console.log("OAuth2: Login finished", url);
          clearTimeout(killTimeout);
          server.close();
          let url = "http://dummy" + urlPath;
          resolve(this.oAuth2.getAuthCodeFromDoneURL(url));
        } catch (ex) {
          reject(ex);
        }
      });
    });
  }
}
