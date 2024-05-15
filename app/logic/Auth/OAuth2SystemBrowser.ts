import { OAuth2UI } from "./OAuth2UI";
import { type URLString } from "../util/util";
import { appGlobal } from "../app";

/**
 * Opens the OS default browser with the OAuth2 login page,
 * starts a local web server on http://localhost:*,
 * and waits for the redirect of the browser login page sequence
 * to that localhost URL. Extracts and returns the `authCode`.
 */
export class OAuth2SystemBrowser extends OAuth2UI {
  async login(url: URLString): Promise<string> {
    console.log("OAuth2: Starting system browser with URL", url);
    await appGlobal.remoteApp.shell.openExternal(url);
    // Maybe re-use the running server for multiple logins at the same time?
    // Would need to use a URL param to distinguish between the results.
    // Use random port. Do all OAuth2 providers support http://localhost:* ?
    let port = 1024 + Math.ceil(Math.random() * 64000);
    return await new Promise(async (resolve, reject) => {
      let app = await appGlobal.remoteApp.newExpressHTTPServer();
      console.log("app", app);
      let server;
      let killTimeout: NodeJS.Timeout;
      app.get("/login-finished", (req, res) => {
        console.log("OAuth2: Login finished", req?.url);
        clearTimeout(killTimeout);
        let url = req?.url;
        server.close();
        let urlParams = new URLSearchParams(url.search);
        let authCode = urlParams.get('authCode');
        resolve(authCode);
      });
      // TODO error page and parse error
      server = app.listen(port, () => {
        console.log(`OAuth2: Listening on HTTP port ${port} for OAuth2 login finish`)
      });
      // Close after 15 mins no result
      killTimeout = setTimeout(() => {
        server.close();
      }, 15 * 60 * 1000);
    });
  }
}
