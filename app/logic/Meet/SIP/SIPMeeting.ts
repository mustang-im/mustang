import type { SIPAccount } from "./SIPAccount";
import { VideoConfMeeting, MeetingState } from "../VideoConfMeeting";
import { MeetingParticipant, ParticipantRole } from "../Participant";
import { VideoStream } from "../VideoStream";
import { LocalMediaDeviceStreams } from "../LocalMediaDeviceStreams";
import { ensureLicensed } from "../../util/LicenseClient";
import { appGlobal } from "../../app";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { getDateTimeFormatPref, gt } from "../../../l10n/l10n";
import { assert, sleep, type URLString } from "../../util/util";
import type { Session, Inviter, Invitation } from "sip.js";

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
    phoneNumber = phoneNumber.replaceAll(/[^0-9\+]/g, ""); // Leave only numbers and leading +
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
    const { UserAgent, Inviter, SessionState } = await import("sip.js");
    assert(this.id, "Need to create the call first");
    this.state = MeetingState.OutgoingCall;
    await this.login(true);
    assert(this.account.userAgent, "Need userAgent");
    await super.start();
    this.createMyParticipant();
    let target = UserAgent.makeURI(this.account.makeCalleeSIPID(this.remotePhoneNumber));
    console.log("Calling", target.toString());
    this.inviter = new Inviter(this.account.userAgent, target);
    this.waitForState(SessionState.Terminated, () => this.callEnded());
    this.waitForState(SessionState.Established, () => this.onEstablished());
    let request = await this.inviter.invite(this.sessionOptions);
  }

  protected async onEstablished() {
    if (this.state == MeetingState.Ongoing) {
      return;
    }
    this.state = MeetingState.Ongoing;
    await this.attachLocalDevices();
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
    let addTrack = (track: MediaStreamTrack) => {
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
    for (let receiver of peerConnection.getReceivers()) {
      addTrack(receiver.track);
    }
    peerConnection.ontrack = (event) => addTrack(event.track);
  }

  protected async attachLocalDevices() {
    let peerConnection = (this.session.sessionDescriptionHandler as any).peerConnection as RTCPeerConnection;

    // HACK Ensure that mic has time to open, esp. for incoming calls TODO Not working correctly, either
    const maxWaitMS = 2000;
    let start = Date.now();
    while (!this.mediaDeviceStreams.cameraMicStream) {
      await sleep(0.1);
      if (Date.now() - start > maxWaitMS) {
        break;
      }
    }
    assert(this.mediaDeviceStreams.cameraMicStream, "Local microphone is not ready");

    for (let track of this.mediaDeviceStreams.cameraMicStream.getTracks()) {
      console.log("Add local track", track);
      peerConnection.addTrack(track);
    }
  }

  async onIncomingCall(invitation: Invitation) {
    this.invitation = invitation;
    let time = new Date().toLocaleString(getDateTimeFormatPref(), { hour: "numeric", minute: "numeric" });
    this.title = `Called by ${invitation.remoteIdentity.displayName} at ${time}`;
    this.state = MeetingState.IncomingCall;
    this.waitForState(SessionState.Terminated, () => this.callEnded());
  }

  async answer() {
    await super.answer();
    console.log("accept - invitation state", this.invitation.state);
    assert(this.invitation.state == SessionState.Initial, "Invitation in wrong state " + this.invitation.state);
    this.createMyParticipant();
    await this.invitation.accept(this.sessionOptions);
    await this.onEstablished();
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

  waitForState(desiredState: SessionState, onChangedToState: () => Promise<void>) {
    let listener = async (newState: SessionState) => {
      try {
        console.log("SIP call changed state to", newState);
        if (newState == desiredState) {
          await onChangedToState();
          this.session.stateChange.removeListener(listener);
        }
      } catch (ex) {
        this.account.errorCallback(ex);
      }
    }
    this.session.stateChange.addListener(listener);
  }
}

enum SessionState {
  Initial = "Initial",
  Establishing = "Establishing",
  Established = "Established",
  Terminating = "Terminating",
  Terminated = "Terminated"
}
