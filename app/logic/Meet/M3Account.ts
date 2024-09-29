import { MeetAccount } from "./MeetAccount";
import { OAuth2 } from "../Auth/OAuth2";
import { assert } from "../util/util";
import { OAuth2URLs } from "../Auth/OAuth2URLs";

export class M3Account extends MeetAccount {
  readonly protocol: string = "m3";
  /* Authentication */
  oauth2: OAuth2;
  /** M3 controller server */
  controllerBaseURL: string = "https://controller.mustang.im";
  controllerWebSocketURL: string = "wss://controller.mustang.im/signaling";
  /** Where guests would go to join the meeting without Mustang app */
  webFrontendBaseURL: string = "https://meet.mustang.im";

  /**
   * Login using OAuth2
   * If already logged in, does nothing.
   * @param relogin if true: Force a new login in any case.
   * @throws OAuth2Error
   */
  async login(relogin = false): Promise<void> {
    if (this.oauth2?.accessToken && !relogin) {
      return;
    }
    assert(this.username, `Please configure the M3 account ${this.name}`);

    if (this.oauth2) {
      this.oauth2.stop();
    }
    let controllerHostname = new URL(this.controllerBaseURL).hostname;
    let urls = OAuth2URLs.find(urls => urls.hostnames.includes(controllerHostname));
    assert(urls, "Need OAuth2 config for Mustang video conference");
    this.oauth2 = new OAuth2(this, urls.tokenURL, urls.authURL, urls.authDoneURL, urls.scope, urls.clientID);
    this.oauth2.setTokenURLPasswordAuth(urls.tokenURLPasswordAuth);
    this.oauth2.subscribe(() => this.notifyObservers());
    await this.oauth2.login(true);
  }

  get isLoggedIn(): boolean {
    return this.oauth2?.isLoggedIn;
  }
}
