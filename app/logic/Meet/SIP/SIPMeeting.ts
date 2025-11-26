import { VideoConfMeeting, MeetingState } from "../VideoConfMeeting";
import { MeetingParticipant, ParticipantRole } from "../Participant";
import type { SIPAccount } from "./SIPAccount";
import { LocalMediaDeviceStreams } from "../LocalMediaDeviceStreams";
import { ensureLicensed, getSavedTicket } from "../../util/LicenseClient";
import { appGlobal } from "../../app";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { catchErrors } from "../../../frontend/Util/error";
import { assert, type URLString } from "../../util/util";
import { getDateTimeFormatPref, gt } from "../../../l10n/l10n";

export class SIPMeeting extends VideoConfMeeting {
  /* Authentication */
  account: SIPAccount;

  constructor(account: SIPAccount) {
    super();
    this.mediaDeviceStreams = new LocalMediaDeviceStreams();
    this.listenStreamChanges();
    this.account = account;
    this.id = crypto.randomUUID(); // dummy, will be replaced
  }

  /**
   * Login using OAuth2
   * If already logged in, does nothing.
   * @param relogin if true: Force a new login in any case.
   * @throws OAuth2Error
   */
  async login(interactive: boolean, relogin = false): Promise<void> {
  }

  async createNewConference() {
    await this.login(true);
    await ensureLicensed();
    let time = new Date().toLocaleString(getDateTimeFormatPref(), { hour: "numeric", minute: "numeric" });
    this.title = `Meeting ${time}`;
    this.state = MeetingState.Init;
  }

  /**
   * URL form: e.g. `tel:+49-611-000000`
   */
  async join(url: URLString) {
    let urlParsed = new URL(url);
    assert(urlParsed.protocol == "tel:", gt`Only tel: URLs are supported`);
    // Data comes from user. All error messages in this function are user visible. TODO Translate error messages.
    let phoneNumber = sanitize.string(urlParsed.pathname);
    assert(phoneNumber, gt`Need phone number in tel: URL`);
    await this.callNumber(phoneNumber);
  }

  protected async callNumber(phoneNumber: URLString) {
    /// ...
    await this.joinAfterStart();
  }

  /** @returns participant token */
  protected async createMyParticipant(): Promise<string> {
  }

  async start() {
    assert(this.id, "Need to create the conference first");
    await super.start();
    await this.joinAfterStart(await this.createMyParticipant());
  }

  protected async joinAfterStart(participantToken: string) {
    this.myParticipant = new MeetingParticipant();
    this.myParticipant.id = this.room.localParticipant.sid;
    this.myParticipant.name = this.room.localParticipant.name || appGlobal.me.name;
    this.myParticipant.role = ParticipantRole.User;
    this.myParticipant.subscribe((_obj, propName) => this.myUserChanged(propName));
    this.state = MeetingState.Ongoing;
  }

  async answer() {
    await super.answer();
  }

  async hangup() {
    await super.hangup();
    if (this.room) {
      await this.room.disconnect();
    }
  }
}
