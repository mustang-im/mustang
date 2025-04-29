import { MeetAccount } from "../MeetAccount";
import { M3Conf } from "./M3Conf";
import { OAuth2 } from "../../Auth/OAuth2";
import { UserError, assert } from "../../util/util";
import { OAuth2URLs } from "../../Auth/OAuth2URLs";
import { gt } from "../../../l10n/l10n";

export class M3Account extends MeetAccount {
  readonly protocol: string = "m3";
  /* Authentication */
  oauth2: OAuth2;
  /** M3 controller server */
  controllerBaseURL: string = "https://controller.mustang.im";
  controllerWebSocketURL: string = "wss://controller.mustang.im/signaling";
  /** Where guests would go to join the meeting without Mustang app */
  webFrontendBaseURL: string = "https://meet.mustang.im";

  canVideo = true;
  canAudio = true;
  canScreenShare = true;
  canMultipleParticipants = true;
  canCreateURL = true;

  /**
   * Login using OAuth2
   * If already logged in, does nothing.
   * @param relogin if true: Force a new login in any case.
   * @throws OAuth2Error
   */
  async login(interactive: boolean, relogin = false): Promise<void> {
    await super.login(interactive);
    if (this.oauth2?.accessToken && !relogin) {
      return;
    }
    if (!this.username) {
      throw new UserError(gt`Please configure a matching meeting account first`);
    }
    this.oauth2?.stop();
    let controllerHostname = new URL(this.controllerBaseURL).hostname;
    let urls = OAuth2URLs.find(urls => urls.hostnames.includes(controllerHostname));
    assert(urls, "Need OAuth2 config for Mustang video conference");
    this.oauth2 = new OAuth2(this, urls.tokenURL, urls.authURL, urls.authDoneURL, urls.scope, urls.clientID);
    this.oauth2.setTokenURLPasswordAuth(urls.tokenURLPasswordAuth);
    this.oauth2.subscribe(() => this.notifyObservers());
    await this.oauth2.login(true);
  }

  get isLoggedIn(): boolean {
    return this.oauth2?.isLoggedIn ?? false;
  }

  async createMeeting(): Promise<M3Conf> {
    let meet = new M3Conf(this);
    await meet.createNewConference();
    return meet;
  }
}
