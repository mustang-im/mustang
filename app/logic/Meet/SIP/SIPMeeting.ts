import type { SIPAccount } from "./SIPAccount";
import { VideoConfMeeting, MeetingState } from "../VideoConfMeeting";
import { MeetingParticipant, ParticipantRole } from "../Participant";
import { VideoStream } from "../VideoStream";
import { LocalMediaDeviceStreams } from "../LocalMediaDeviceStreams";
import { ensureLicensed } from "../../util/LicenseClient";
import { appGlobal } from "../../app";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { getDateTimeFormatPref, gt } from "../../../l10n/l10n";
import { assert, type URLString } from "../../util/util";
import { UserAgent, type Session, Inviter, type Invitation, SessionState } from "sip.js";

export class SIPMeeting extends VideoConfMeeting {
  /* Authentication */
  account: SIPAccount;
  inviter: Inviter; /** For outgoing calls */
  invitation: Invitation; /** For incoming calls */
  remotePhoneNumber: string;

  get session(): Session | null {
    return this.inviter ?? this.invitation ?? null;
  }

  constructor(account: SIPAccount) {
    super();
    this.mediaDeviceStreams = new LocalMediaDeviceStreams();
    this.listenStreamChanges();
    this.account = account;
    this.id = crypto.randomUUID();
  }

  /**
   * Login using OAuth2
   * If already logged in, does nothing.
   * @param relogin if true: Force a new login in any case.
   * @throws OAuth2Error
   */
  async login(interactive: boolean, relogin = false): Promise<void> {
    if (this.account.isLoggedIn) {
      return;
    }
    await this.account.login(interactive, relogin);
  }

  /**
   * URL form: e.g. `tel:+49-611-000000`
   */
  async join(url: URLString) {
    await ensureLicensed();
    await this.login(true);
    let urlParsed = new URL(url);
    assert(urlParsed.protocol == "tel:", gt`Only tel: URLs are supported`);
    // Data comes from user. All error messages in this function are user visible. TODO Translate error messages.
    let phoneNumber = sanitize.string(urlParsed.pathname);
    assert(phoneNumber, gt`Need phone number in tel: URL`);
    assert(phoneNumber[0] == "+", gt`Phone number needs to be in international number format, e.g. tel:+49-611-000000 or tel:+1-650-555-0000`);
    this.remotePhoneNumber = phoneNumber;

    let time = new Date().toLocaleString(getDateTimeFormatPref(), { hour: "numeric", minute: "numeric" });
    this.title = `Call ${phoneNumber} at ${time}`;
    this.state = MeetingState.OutgoingCallConfirm;
  }

  protected createMyParticipant(): void {
    this.myParticipant = new MeetingParticipant();
    this.myParticipant.id = this.account.mySIPID;
    this.myParticipant.name = appGlobal.me.name;
    this.myParticipant.role = ParticipantRole.User;
  }

  protected sessionOptions = {
    sessionDescriptionHandlerOptions: {
      constraints: {
        audio: true,  // false, because we will attach our own stream
        video: false,
      },
    },
  };

  async call() {
    assert(this.id, "Need to create the call first");
    await this.login(true);
    assert(this.account.userAgent, "Need userAgent");
    await super.start();
    this.createMyParticipant();
    let target = UserAgent.makeURI(this.account.makeCalleeSIPID(this.remotePhoneNumber));
    console.log("Calling", target.toString());
    this.inviter = new Inviter(this.account.userAgent, target);
    let request = await this.inviter.invite(this.sessionOptions);
    this.waitForState(SessionState.Established, () => this.onEstablished());
  }

  waitForState(desiredState: SessionState, onChangedToState: () => void) {
    this.session.stateChange.addListener(newState => {
      if (newState == desiredState) {
        onChangedToState();
      }
    });
  }

  protected onEstablished() {
    this.state = MeetingState.Ongoing;
    this.waitForState(SessionState.Terminating, () => this.callEnded());
    this.attachLocalDevices();
    this.attachRemoteDevices();
  }

  protected attachRemoteDevices() {
    let p = new MeetingParticipant();
    p.name = this.remotePhoneNumber;
    this.participants.add(p);

    let mediaStream = new MediaStream();
    let v = new VideoStream(mediaStream, p);
    this.videos.add(v);

    let peerConnection = (this.session.sessionDescriptionHandler as any).peerConnection as RTCPeerConnection;
    peerConnection.ontrack = (event) => {
      let track = event.track;
      // Avoid adding local tracks
      for (let localTrack of this.mediaDeviceStreams.cameraMicStream.getTracks()) {
        if (track == localTrack) {
          console.log("Won't re-add local track");
          return;
        }
      }
      console.log("Add remote track", track);
      mediaStream.addTrack(track);
    };
  }

  protected attachLocalDevices() {
    let peerConnection = (this.session.sessionDescriptionHandler as any).peerConnection as RTCPeerConnection;
    for (let track of this.mediaDeviceStreams.cameraMicStream.getTracks()) {
      console.log("Add local track", track);
      peerConnection.addTrack(track);
    }
  }

  onIncomingCall(invitation: Invitation) {
    let time = new Date().toLocaleString(getDateTimeFormatPref(), { hour: "numeric", minute: "numeric" });
    this.title = `Called by ... at ${time}`;
    this.state = MeetingState.IncomingCall;
  }

  async answer() {
    await super.answer();
    console.log("accept - invitation state", this.invitation.state);
    assert(this.invitation.state == SessionState.Establishing, "Invitation in wrong state " + this.invitation.state);
    await this.invitation.accept(this.sessionOptions);
    this.onEstablished();
  }

  async hangup() {
    console.log("hangup");
    if (this.session) {
      console.log("session state", this.session.state);
      if (this.session.state == SessionState.Established) {
        await this.session.bye();
      } else if (this.session.state == SessionState.Establishing ||
          this.session.state == SessionState.Initial) {
        if (this.invitation) {
          console.log("invitation reject");
          await this.invitation.reject();
        } else if (this.inviter) {
          console.log("inviter cancel");
          this.inviter.cancel();
        }
      }
      this.session.dispose();
    }
    console.log("hanging up");
    await super.hangup();
  }

  /** Called when the remove end has hung up */
  protected async callEnded() {
    if (this.state == MeetingState.Ended) {
      // Avoid that we're called again when the session terminates after `this.hangup()`
      return;
    }
    console.log("Remote end has hung up");
    await super.hangup();
  }
}
