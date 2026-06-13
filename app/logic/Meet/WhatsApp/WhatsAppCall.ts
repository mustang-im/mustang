/** A WhatsApp 1:1 voice/video call.
 *
 * This reuses the app's standard WebRTC machinery (RTCPeerConnection, offer/
 * answer SDP, ICE, local/remote VideoStreams) like the SIP/LiveKit calls, with
 * an extra per-frame encryption layer for SFU group calls keyed off the
 * Signal-shared call key (see WhatsAppCallE2E).
 *
 * GATED, and NOT yet interoperable: WhatsApp's real call media plane is
 * proprietary (SDES-keyed SRTP over WhatsApp relays, with the SRTP secret
 * Signal-encrypted in the offer), NOT browser WebRTC — this holds for
 * web.whatsapp.com too (its in-browser client drives a WASM media engine, not
 * the standard SDP/DTLS/ICE path). So the RTCPeerConnection wiring here is a
 * structurally-faithful stand-in that exercises the signaling envelope and the
 * UI, but a real WhatsApp peer cannot answer it; the proprietary media plane is
 * the remaining work. See the MEDIA-PLANE NOTE in WhatsAppMeetAccount. */
import { VideoConfMeeting, MeetingState } from "../VideoConfMeeting";
import { MeetingParticipant, ParticipantRole } from "../Participant";
import { VideoStream } from "../VideoStream";
import { LocalMediaDeviceStreams } from "../LocalMediaDeviceStreams";
import type { WhatsAppMeetAccount } from "./WhatsAppMeetAccount";
import {
  type CallSignal, CallAction, buildOffer, buildAccept, buildICE, buildTerminate,
} from "./whatsAppCallSignaling";
import { setupEncodedTransforms } from "./whatsAppCallE2E";
import { JID } from "../../Chat/WhatsApp/Binary/JID";
import { randomBytes } from "../../Chat/WhatsApp/Crypto/primitives";
import { bytesToHex } from "@noble/curves/utils.js";
import { appGlobal } from "../../app";
import { assert, sleep } from "../../util/util";
import { getDateTimeLocale, gt } from "../../../l10n/l10n";
import type { Person } from "../../Abstract/Person";

export class WhatsAppCall extends VideoConfMeeting {
  declare account: WhatsAppMeetAccount;
  callID: string;
  /** The other party (a phone-number JID). */
  peer: JID;
  hasVideo = true;

  protected peerConnection: RTCPeerConnection | null = null;
  /** The E2E media key, shared via Signal. Placeholder until live keying. */
  protected callKey: Uint8Array | null = null;
  protected remoteOfferSDP: string | null = null;
  protected pendingRemoteICE: string[] = [];

  constructor(account: WhatsAppMeetAccount) {
    super();
    this.account = account;
    this.id = crypto.randomUUID();
    this.mediaDeviceStreams = new LocalMediaDeviceStreams();
    this.listenStreamChanges();
  }

  // --- outgoing ---

  prepareOutgoing(peer: JID, video: boolean) {
    this.peer = peer;
    this.hasVideo = video;
    this.callID = bytesToHex(randomBytes(8)).toUpperCase();
    this.title = this.callTitle(gt`Calling`);
    this.setRemoteParticipant();
    this.state = MeetingState.OutgoingCallConfirm;
  }

  async call() {
    assert(this.state == MeetingState.OutgoingCallConfirm, "Must be an outgoing call");
    this.state = MeetingState.OutgoingCall;
    this.createMyParticipant();
    this.createPeerConnection();
    await this.attachLocalDevices();
    let offer = await this.peerConnection!.createOffer();
    await this.peerConnection!.setLocalDescription(offer);
    this.callKey = randomBytes(32); // would be Signal-encrypted to the peer
    this.applyE2E();
    await this.account.sendCallStanza(
      buildOffer(this.peer, this.account.ownJID, this.callID, offer.sdp!, this.callKey, this.hasVideo));
  }

  // --- incoming ---

  onIncomingOffer(signal: CallSignal) {
    this.callID = signal.callID;
    this.peer = signal.peer;
    this.hasVideo = signal.isVideo;
    this.remoteOfferSDP = signal.sdp ?? null;
    this.callKey = signal.encKey ?? null; // would be Signal-decrypted from the peer
    this.title = this.callTitle(gt`Incoming call from`);
    this.setRemoteParticipant();
    this.state = MeetingState.IncomingCall;
  }

  async answer() {
    assert(this.state == MeetingState.IncomingCall, "No incoming call to answer");
    assert(this.remoteOfferSDP, "No offer to answer");
    this.createMyParticipant();
    this.createPeerConnection();
    await this.peerConnection!.setRemoteDescription({ type: "offer", sdp: this.remoteOfferSDP });
    await this.attachLocalDevices();
    this.flushRemoteICE();
    let answer = await this.peerConnection!.createAnswer();
    await this.peerConnection!.setLocalDescription(answer);
    this.applyE2E();
    await this.account.sendCallStanza(buildAccept(this.toSignal(), this.account.ownJID, answer.sdp!));
    this.startNow();
    this.state = MeetingState.Ongoing;
  }

  // --- signaling updates from the peer ---

  async onSignal(signal: CallSignal): Promise<void> {
    if (signal.action == CallAction.Accept && signal.sdp) {
      if (this.state == MeetingState.Ongoing) {
        return; // ignore duplicate accepts (would throw InvalidStateError)
      }
      await this.peerConnection?.setRemoteDescription({ type: "answer", sdp: signal.sdp });
      this.flushRemoteICE();
      this.applyE2E();
      this.startNow();
      this.state = MeetingState.Ongoing;
    } else if (signal.action == CallAction.Transport && signal.iceCandidate) {
      await this.addRemoteICE(signal.iceCandidate);
    } else if (signal.action == CallAction.Terminate || signal.action == CallAction.Reject) {
      await this.endCall();
    }
  }

  async hangup() {
    if (this.callID && this.peer && this.state != MeetingState.Ended) {
      try {
        await this.account.sendCallStanza(buildTerminate(this.peer, this.account.ownJID, this.callID));
      } catch (ex) {
        this.errorCallback(ex as Error);
      }
    }
    await this.endCall();
  }

  protected async endCall() {
    if (this.state == MeetingState.Ended) {
      return;
    }
    this.peerConnection?.close();
    this.peerConnection = null;
    await super.hangup();
  }

  // --- WebRTC plumbing (same approach as the SIP/LiveKit calls) ---

  protected createPeerConnection() {
    this.peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      encodedInsertableStreams: true, // for the E2E frame layer, where supported
    } as RTCConfiguration);
    this.peerConnection.onicecandidate = event => {
      if (event.candidate) {
        this.account.sendCallStanza(
          buildICE(this.peer, this.account.ownJID, this.callID, event.candidate.candidate))
          .catch(ex => this.errorCallback(ex as Error));
      }
    };
    this.peerConnection.ontrack = event => {
      this.addRemoteTrack(event.track);
      this.applyE2E();
    };
    this.peerConnection.onconnectionstatechange = () => {
      let state = this.peerConnection?.connectionState;
      if (state == "failed" || state == "disconnected" || state == "closed") {
        this.endCall().catch(ex => this.errorCallback(ex as Error));
      }
    };
  }

  protected async attachLocalDevices() {
    await this.mediaDeviceStreams.setCameraMicOn(this.hasVideo, true);
    let start = Date.now();
    while (!this.mediaDeviceStreams.cameraMicStream && Date.now() - start < 2000) {
      await sleep(0.1);
    }
    let stream = this.mediaDeviceStreams.cameraMicStream;
    assert(stream, gt`Unable to start your camera/mic`);
    for (let track of stream.getTracks()) {
      this.peerConnection!.addTrack(track, stream);
    }
  }

  protected addRemoteTrack(track: MediaStreamTrack) {
    // Don't mistake our own looped-back local tracks for remote media.
    if (this.mediaDeviceStreams.cameraMicStream?.getTracks().includes(track)) {
      return;
    }
    let participant = this.participants.first ?? this.addRemoteParticipant();
    let video = this.videos.find(v => !v.isMe && v.participant == participant);
    if (!video) {
      video = new VideoStream(new MediaStream(), participant);
      this.videos.add(video);
    }
    video.stream.addTrack(track);
    video.hasVideo = video.stream.getVideoTracks().length > 0;
    participant.micOn = true;
  }

  protected applyE2E() {
    if (this.callKey && this.peerConnection) {
      setupEncodedTransforms(this.peerConnection, this.callKey);
    }
  }

  protected async addRemoteICE(candidate: string) {
    if (this.peerConnection?.remoteDescription) {
      await this.peerConnection.addIceCandidate({ candidate });
    } else {
      this.pendingRemoteICE.push(candidate);
    }
  }

  protected flushRemoteICE() {
    for (let candidate of this.pendingRemoteICE) {
      this.peerConnection?.addIceCandidate({ candidate }).catch(ex => this.errorCallback(ex as Error));
    }
    this.pendingRemoteICE = [];
  }

  // --- participants ---

  protected createMyParticipant() {
    this.myParticipant = new MeetingParticipant();
    this.myParticipant.name = appGlobal.me?.name;
    this.myParticipant.role = ParticipantRole.User;
  }

  protected setRemoteParticipant() {
    if (this.participants.isEmpty) {
      this.addRemoteParticipant();
    }
  }

  protected addRemoteParticipant(): MeetingParticipant {
    let participant = new MeetingParticipant(this.peer.toString(), this.peerName());
    let person = this.findPerson();
    if (person) {
      participant.person = person; // picture etc. come from the linked Person
      participant.name = person.name;
    }
    this.participants.add(participant);
    return participant;
  }

  protected findPerson(): Person | undefined {
    return appGlobal.persons.find(p =>
      p.chatAccounts.some(e => e.protocol == "whatsapp" && JID.parse(e.value).user == this.peer.user));
  }

  protected peerName(): string {
    return this.findPerson()?.name ?? "+" + this.peer.user;
  }

  protected callTitle(prefix: string): string {
    let time = new Date().toLocaleString(getDateTimeLocale(), { hour: "numeric", minute: "numeric" });
    return `${prefix} ${this.peerName()} ${time}`;
  }

  protected toSignal(): CallSignal {
    return {
      action: CallAction.Offer, callID: this.callID, peer: this.peer,
      callCreator: this.peer.toString(), isVideo: this.hasVideo, isGroup: false,
    };
  }
}
