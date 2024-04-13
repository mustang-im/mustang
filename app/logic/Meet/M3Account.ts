import { MeetAccount } from "./MeetAccount";
import { OAuth2 } from "../Auth/OAuth2";
import { assert } from "../util/util";

export class M3Account extends MeetAccount {
  readonly protocol: string = "m3";
  /* Authentication */
  oauth2: OAuth2;
  oauthBaseURL: string = "https://accounts.mustang.im/realms/mustang/protocol/openid-connect";
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
    assert(this.username && this.password, `Please configure the M3 account ${this.name}`);

    if (this.oauth2) {
      this.oauth2.stop();
    }
    const kScope = "openid phone profile email";
    const kClientID = "mustang"; // Configured in KeyCloak <https://accounts.mustang.im/auth/admin/master/console/#/mustang/clients/>
    this.oauth2 = new OAuth2(this.oauthBaseURL, kScope, kClientID);
    await this.oauth2.loginWithPassword(this.username, this.password);
  }
}
