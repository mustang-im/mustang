/** A Signal 1:1 voice/video call.
 *
 * This reuses the app's standard WebRTC machinery (RTCPeerConnection, ICE,
 * local/remote VideoStreams) like the SIP/LiveKit/WhatsApp calls, and drives the
 * Signal calling wire protocol: a `CallMessage` (offer/answer/iceUpdate/hangup/
 * busy) rides inside `Content.callMessage` over the SignalAccount's connection.
 * The offer/answer payloads are RingRTC `ConnectionParametersV4` protobufs in the
 * `opaque` field (NOT raw SDP); SRTP keys are derived from an X25519 DH bound to
 * the two parties' identity keys (Docs/07 §C.2, callSRTP.ts).
 *
 * SIGNALING is complete and round-trip tested. The MEDIA plane is GATED: Signal
 * disables DTLS and installs raw SRTP keys, which a stock browser
 * RTCPeerConnection cannot do — see the MEDIA GATE header in callSRTP.ts. So the
 * RTCPeerConnection wiring here exercises the signaling envelope and the UI, but
 * real media needs a WebRTC engine with external SRTP keying (desktop/Electron
 * native path). Honest status: a real Signal peer cannot complete media with this
 * yet; the wire signaling it sees is correct. */
import { VideoConfMeeting, MeetingState } from "../VideoConfMeeting";
import { MeetingParticipant, ParticipantRole } from "../Participant";
import { VideoStream } from "../VideoStream";
import { LocalMediaDeviceStreams } from "../LocalMediaDeviceStreams";
import type { SignalMeetAccount } from "./SignalMeetAccount";
import {
  type CallMessage, OfferType, HangupType,
  buildOffer, buildAnswer, buildIceUpdate, buildHangup, buildBusy,
  parseOfferParams, parseAnswerParams, parseIceCandidates,
} from "./signalingProto";
import {
  deriveSRTPKeys, newCallKeyPair, sdpToV4, offerSdpFromV4, answerSdpFromV4, type SRTPKeys,
} from "./callSRTP";
import type { ConnectionParametersV4 } from "./signalingProto";
import { ServiceId } from "../../Chat/Signal/ServiceId";
import { KeyPair } from "../../Chat/Signal/Crypto/KeyPair";
import { randomBytes } from "../../Chat/Signal/Crypto/primitives";
import { bytesToNumberBE } from "@noble/curves/utils.js";
import { appGlobal } from "../../app";
import { assert, sleep } from "../../util/util";
import { getDateTimeLocale, gt } from "../../../l10n/l10n";
import type { Person } from "../../Abstract/Person";

/** Default max send bitrate requested from the peer (Docs/07 §B.2). */
const kMaxBitrateBps = 2_000_000n;

export class SignalCall extends VideoConfMeeting {
  declare account: SignalMeetAccount;
  /** The CallId — random uint64, identical across offer/answer/ICE/hangup. */
  callID: bigint;
  /** The other party. */
  peer: ServiceId;
  /** The peer's device that we negotiate with (offer device for answers). */
  peerDeviceID = 0;
  hasVideo = true;
  /** True if we placed the call (we own the "offer" SRTP role). */
  protected isCaller = false;

  protected peerConnection: RTCPeerConnection | null = null;
  /** Our fresh X25519 keypair for this call's DH → SRTP. */
  protected callKeyPair: KeyPair | null = null;
  /** The derived directional SRTP keys, once both V4 params are exchanged. */
  protected srtpKeys: SRTPKeys | null = null;
  /** The peer's V4 params from a received offer/answer. */
  protected remoteParams: ConnectionParametersV4 | null = null;
  protected pendingRemoteICE: string[] = [];

  constructor(account: SignalMeetAccount) {
    super();
    this.account = account;
    this.id = crypto.randomUUID();
    this.mediaDeviceStreams = new LocalMediaDeviceStreams();
    this.listenStreamChanges();
  }

  // --- outgoing ---

  prepareOutgoing(peer: ServiceId, video: boolean) {
    this.peer = peer;
    this.hasVideo = video;
    this.isCaller = true;
    this.callID = randomCallID();
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
    this.callKeyPair = newCallKeyPair();
    let offer = await this.peerConnection!.createOffer();
    await this.peerConnection!.setLocalDescription(offer);
    let v4 = sdpToV4(offer.sdp!, this.callKeyPair.publicKey, kMaxBitrateBps);
    let type = this.hasVideo ? OfferType.VideoCall : OfferType.AudioCall;
    // Offer is broadcast (no destinationDeviceId) so all the peer's devices ring.
    await this.account.sendCallMessage([this.peer], buildOffer(this.callID, type, v4));
  }

  // --- incoming ---

  async onIncomingOffer(callMessage: CallMessage, from: ServiceId, fromDeviceID: number): Promise<void> {
    let offer = callMessage.offer!;
    this.callID = offer.id!;
    this.peer = from;
    this.peerDeviceID = fromDeviceID;
    this.isCaller = false;
    this.hasVideo = offer.type == OfferType.VideoCall;
    this.remoteParams = parseOfferParams(offer) ?? null;
    this.title = this.callTitle(gt`Incoming call from`);
    this.setRemoteParticipant();
    this.state = MeetingState.IncomingCall;
  }

  async answer() {
    assert(this.state == MeetingState.IncomingCall, "No incoming call to answer");
    assert(this.remoteParams, "No offer params to answer");
    this.createMyParticipant();
    this.createPeerConnection();
    this.callKeyPair = newCallKeyPair();
    let remoteSDP = offerSdpFromV4(this.remoteParams!);
    await this.peerConnection!.setRemoteDescription({ type: "offer", sdp: remoteSDP });
    await this.attachLocalDevices();
    this.flushRemoteICE();
    let answer = await this.peerConnection!.createAnswer();
    await this.peerConnection!.setLocalDescription(answer);
    let v4 = sdpToV4(answer.sdp!, this.callKeyPair.publicKey, kMaxBitrateBps);
    this.deriveKeys();
    // Answer is targeted at the caller's device that sent the offer.
    await this.account.sendCallMessage([this.peer], buildAnswer(this.callID, v4, this.peerDeviceID));
    this.startNow();
    this.state = MeetingState.Ongoing;
  }

  /** Decline an incoming call (Hangup DECLINED). */
  async decline() {
    if (this.callID != null && this.peer) {
      await this.account.sendCallMessage([this.peer], buildHangup(this.callID, HangupType.Declined))
        .catch(ex => this.errorCallback(ex as Error));
    }
    await this.endCall();
  }

  // --- inbound CallMessages for an existing call ---

  async onCallMessage(callMessage: CallMessage, fromDeviceID: number): Promise<void> {
    if (callMessage.answer && this.isCaller) {
      await this.onAnswer(callMessage, fromDeviceID);
    } else if (callMessage.iceUpdate?.length) {
      await this.onIceUpdate(callMessage);
    } else if (callMessage.hangup || callMessage.busy) {
      await this.endCall();
    }
  }

  protected async onAnswer(callMessage: CallMessage, fromDeviceID: number): Promise<void> {
    if (this.state == MeetingState.Ongoing) {
      return; // ignore a duplicate answer (would throw InvalidStateError)
    }
    this.peerDeviceID = fromDeviceID;
    this.remoteParams = parseAnswerParams(callMessage.answer!) ?? null;
    assert(this.remoteParams, "Answer has no V4 params");
    let remoteSDP = answerSdpFromV4(this.remoteParams!);
    await this.peerConnection?.setRemoteDescription({ type: "answer", sdp: remoteSDP });
    this.flushRemoteICE();
    this.deriveKeys();
    this.startNow();
    this.state = MeetingState.Ongoing;
  }

  protected async onIceUpdate(callMessage: CallMessage): Promise<void> {
    for (let candidate of parseIceCandidates(callMessage)) {
      await this.addRemoteICE(candidate);
    }
  }

  async hangup() {
    if (this.callID != null && this.peer && this.state != MeetingState.Ended) {
      try {
        await this.account.sendCallMessage([this.peer], buildHangup(this.callID, HangupType.Normal));
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

  // --- crypto ---

  /** Once both peers' V4 params are known, derive the AES-256-GCM SRTP keys from
   * the X25519 DH, bound to caller+callee identity keys (Docs/07 §C.2). */
  protected deriveKeys() {
    if (!this.callKeyPair || !this.remoteParams?.publicKey) {
      return;
    }
    let callerIdentity = this.isCaller ? this.account.ownIdentityKey() : this.peerIdentityKey();
    let calleeIdentity = this.isCaller ? this.peerIdentityKey() : this.account.ownIdentityKey();
    this.srtpKeys = deriveSRTPKeys(
      this.callKeyPair.privateKey, this.remoteParams.publicKey, callerIdentity, calleeIdentity);
    // MEDIA GATE: the keys are ready; installing them into the media transport
    // needs an engine that allows raw SRTP keying (callSRTP.ts header).
  }

  protected peerIdentityKey(): Uint8Array {
    return this.account.peerIdentityKey(this.peer) ?? new Uint8Array(33);
  }

  // --- WebRTC plumbing (same approach as the SIP/LiveKit/WhatsApp calls) ---

  protected createPeerConnection() {
    this.peerConnection = new RTCPeerConnection({
      iceServers: this.account.iceServers(),
    } as RTCConfiguration);
    this.peerConnection.onicecandidate = event => {
      if (event.candidate) {
        // Caller broadcasts ICE; callee targets the caller's device.
        let target = this.isCaller ? {} : { deviceId: this.peerDeviceID };
        this.account.sendCallMessage(
          [this.peer], buildIceUpdate(this.callID, [event.candidate.candidate], target))
          .catch(ex => this.errorCallback(ex as Error));
      }
    };
    this.peerConnection.ontrack = event => {
      this.addRemoteTrack(event.track);
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
    if (this.mediaDeviceStreams.cameraMicStream?.getTracks().includes(track)) {
      return; // don't mistake our own looped-back local tracks for remote media
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
      participant.person = person;
      participant.name = person.name;
    }
    this.participants.add(participant);
    return participant;
  }

  protected findPerson(): Person | undefined {
    return appGlobal.persons.find(p =>
      p.chatAccounts.some(e => e.protocol == "signal" && e.value == this.peer.toString()));
  }

  protected peerName(): string {
    return this.findPerson()?.name ?? this.peer.uuidString();
  }

  protected callTitle(prefix: string): string {
    let time = new Date().toLocaleString(getDateTimeLocale(), { hour: "numeric", minute: "numeric" });
    return `${prefix} ${this.peerName()} ${time}`;
  }
}

/** A random uint64 CallId, kept as a bigint so it stays exact (Docs/07 §A.1). */
export function randomCallID(): bigint {
  return bytesToNumberBE(randomBytes(8));
}
