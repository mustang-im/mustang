import { MeetAccount } from "../MeetAccount";
import { LiveKitConf } from "./LiveKitConf";
import type { OAuth2 } from "../../Auth/OAuth2";
import { UserError, assert } from "../../util/util";
import { OAuth2URLs } from "../../Auth/OAuth2URLs";
import { gt } from "../../../l10n/l10n";

export class LiveKitAccount extends MeetAccount {
  readonly protocol: string = "livekit";
  /* Authentication */
  oauth2: OAuth2;
  /** To create a new meeting */
  controllerBaseURL = "https://cloud-api.livekit.io/api/sandbox/";

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
  }

  get isLoggedIn(): boolean {
    return true;
  }

  async createMeeting(): Promise<LiveKitConf> {
    let meet = new LiveKitConf(this);
    await meet.createNewConference();
    return meet;
  }
}
