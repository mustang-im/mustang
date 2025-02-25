import { MeetAccount } from "../MeetAccount";
import { OAuth2 } from "../../Auth/OAuth2";
import { assert } from "../../util/util";
import { OAuth2URLs } from "../../Auth/OAuth2URLs";

export class SipgateDialAccount extends MeetAccount {
  readonly protocol: string = "sipgate-dial";
  /* Authentication */
  oauth2: OAuth2;
  /** Sipgate REST server */
  apiURL: string = "https://controller.mustang.im";

  /**
   * Login using OAuth2
   * If already logged in, does nothing.
   * @throws OAuth2Error
   */
  async login(interactive: boolean): Promise<void> {
    super.login(interactive);
    if (this.oauth2?.accessToken) {
      return;
    }
    this.oauth2?.stop();
    let hostname = new URL(this.apiURL).hostname;
    // <https://en.sipgate.io/rest-api/authentication#oauth2>
    let urls = OAuth2URLs.find(urls => urls.hostnames.includes(hostname));
    assert(urls, "Need OAuth2 config");
    this.oauth2 = new OAuth2(this, urls.tokenURL, urls.authURL, urls.authDoneURL, urls.scope, urls.clientID);
    this.oauth2.subscribe(() => this.notifyObservers());
    await this.oauth2.login(true);
  }

  get isLoggedIn(): boolean {
    return this.oauth2?.isLoggedIn;
  }
}
