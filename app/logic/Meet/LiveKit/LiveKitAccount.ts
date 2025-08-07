import { MeetAccount } from "../MeetAccount";
import { LiveKitConf } from "./LiveKitConf";
import type { OAuth2 } from "../../Auth/OAuth2";
import type { URLString } from "../../util/util";

export class LiveKitAccount extends MeetAccount {
  readonly protocol: string = "livekit";
  /* Authentication */
  oauth2: OAuth2;

  canVideo = true;
  canAudio = true;
  canScreenShare = true;
  canMultipleParticipants = true;
  canCreateURL = true;

  /** Meeting URL, and meeting link for invitees */
  get webFrontendBaseURL(): URLString {
    return this.url;
  }

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

  newMeeting(): LiveKitConf {
    return new LiveKitConf(this);
  }

  isMeetingURL(url: URL): boolean {
    return url.origin == this.webFrontendBaseURL &&
      url.pathname.startsWith("/rooms/");
  }
}
