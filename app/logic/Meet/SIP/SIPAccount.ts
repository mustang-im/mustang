import { MeetAccount } from "../MeetAccount";
import { SIPMeeting } from "./SIPMeeting";

export class SIPAccount extends MeetAccount {
  readonly protocol: string = "sip";
  hostname: string;

  canVideo = true;
  canAudio = true;
  canScreenShare = false;
  canMultipleParticipants = false;
  canCreateURL = false;

  async login(interactive: boolean, relogin = false): Promise<void> {
  }

  get isLoggedIn(): boolean {
    return true;
  }

  newMeeting(): SIPMeeting {
    return new SIPMeeting(this);
  }

  isMeetingURL(url: URL): boolean {
    return url.protocol == "tel:" && !!url.pathname;
  }
}
