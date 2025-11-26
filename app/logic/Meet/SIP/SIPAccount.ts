import { MeetAccount } from "../MeetAccount";
import { SIPMeeting } from "./SIPMeeting";
import { assert } from "../../util/util";
import { UserAgent, Registerer, type Invitation } from "sip.js";
import { appGlobal } from "../../app";

export class SIPAccount extends MeetAccount {
  readonly protocol: string = "sip";
  domain: string;
  mySIPID: string; /** e.g. "sip:fred@tele.com" */
  userAgent: UserAgent;
  registerer: Registerer;

  canVideo = true;
  canAudio = true;
  canScreenShare = false;
  canMultipleParticipants = false;
  canCreateURL = false;

  async login(interactive: boolean, relogin = false): Promise<void> {
    let urlParsed = new URL(this.url);
    assert(urlParsed.protocol == "wss:", "Need WebSocket URL");
    this.domain = urlParsed.hostname;
    this.mySIPID = "sip:" + this.username + "@" + this.domain;

    this.userAgent = new UserAgent({
      authorizationUsername: this.username,
      authorizationPassword: this.password,
      transportOptions: {
        server: this.url,
      },
      uri: UserAgent.makeURI(this.mySIPID),
      delegate: {
        onInvite: (invitation) => this.onIncomingCall(invitation),
      },
    });
    await this.userAgent.start();
    this.registerer = new Registerer(this.userAgent);
    let request = await this.registerer.register();
  }

  async logout(): Promise<void> {
    await this.userAgent.stop();
  }

  get isLoggedIn(): boolean {
    return true;
  }

  protected onIncomingCall(invitation: Invitation) {
    let call = new SIPMeeting(this);
    call.onIncomingCall(invitation);
    appGlobal.meetings.add(call);
  }

  newMeeting(): SIPMeeting {
    return new SIPMeeting(this);
  }

  isMeetingURL(url: URL): boolean {
    return url.protocol == "tel:" && url.pathname?.[1] == "+";
  }
}
