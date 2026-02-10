import { SIPMeeting } from "./SIPMeeting";
import { MeetAccount } from "../MeetAccount";
import { appGlobal } from "../../app";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assert } from "../../util/util";
import type { UserAgent, Registerer, Invitation } from "sip.js";

export class SIPAccount extends MeetAccount {
  readonly protocol: string = "sip";
  domain: string;
  hostname: string; /** during setup only. Part of `this.url` */
  port: number; /** ditto */
  mySIPID: string; /** e.g. "sip:fred@tele.com". Constructed from username + domain. */
  userAgent: UserAgent;
  registerer: Registerer;
  /** Country phone prefix, e.g. 1 for USA+Kanada, 49 for Germany, 33 for France etc.
   * Used to complete phone numbers in national notation.
   * User setting.
   * TODO add UI for the user setting */
  countryCode = 49;

  canVideo = true;
  canAudio = true;
  canScreenShare = false;
  canMultipleParticipants = false;
  canCreateURL = false;

  async login(interactive: boolean, relogin = false): Promise<void> {
    const { UserAgent, Registerer } = await import("sip.js");
    let urlParsed = new URL(this.url);
    assert(urlParsed.protocol == "wss:", "Need WebSocket URL");
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
    return this.userAgent?.isConnected();
  }

  protected onIncomingCall(invitation: Invitation) {
    console.log("incoming call", invitation);
    if (appGlobal.meetings.find(meet => meet instanceof SIPMeeting &&
          meet.inviter?._contact.replace(/;.*/, "") == invitation._contact.replace(/;.*/, ""))) {
      /* Work around a bug where we get an incoming call (Invitation)
        when we make an outgoing call (Invite) */
      return;
    }

    let call = new SIPMeeting(this);
    call.onIncomingCall(invitation);
    appGlobal.meetings.add(call);
  }

  makeCalleeSIPID(phoneNumber: string): string {
    return "sip:" + phoneNumber + "@" + this.domain;
  }

  newMeeting(): SIPMeeting {
    return new SIPMeeting(this);
  }

  isMeetingURL(url: URL): boolean {
    return url.protocol == "tel:";
  }

  fromConfigJSON(json: any) {
    super.fromConfigJSON(json);
    this.url = sanitize.url(json.url, null, ["wss", "ws", "sips", "sip-tcp", "sip-udp"]);
    this.countryCode = sanitize.integerRange(json.countryCode, 1, 999, 1);
    this.domain = sanitize.hostname(json.domain);
  }
  toConfigJSON(): any {
    let json = super.toConfigJSON();
    json.domain = this.domain;
    json.countryCode = this.countryCode;
    return json;
  }
}
