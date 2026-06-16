/** The Signal calling wire protocol, ported to our codec DSL (no protobufjs).
 *
 * Two layers, both clean-room from the public protobuf definitions and Docs/07:
 *
 *  1. The Signal-service `CallMessage` (rides inside `Content.callMessage`,
 *     field 3) — the offer/answer/ICE/hangup/busy/opaque envelope.
 *     Source: Signal-Android SignalService.proto `CallMessage`.
 *
 *  2. The RingRTC `signaling.proto` payloads that go *inside* the `opaque`
 *     fields of the CallMessage (the actual negotiated parameters):
 *     `Offer`/`Answer` (→ `ConnectionParametersV4`), `IceCandidate`, and the
 *     group/ring `CallMessage` carried in `Opaque.data`.
 *     Source: ringrtc signaling.proto + group_call.proto.
 *
 * Field numbers are authoritative (proto2). The `id` (CallId) is a random
 * uint64 — decoded as `bigint` (`int64`) so it stays exact past 2^53. */
import { message, string, bytes, int, int64, fixed64, sub, repeated, encode, decode, type TypeOf } from "../../Chat/Signal/Proto/codec";

// ---------------------------------------------------------------------------
// Enums (values are authoritative; the int() fields below carry them).
// ---------------------------------------------------------------------------

/** CallMessage.Offer.Type. */
export enum OfferType {
  AudioCall = 0,
  VideoCall = 1,
}

/** CallMessage.Hangup.Type (also mirrored by rtp_data.Hangup.Type). */
export enum HangupType {
  Normal = 0,
  Accepted = 1,
  Declined = 2,
  Busy = 3,
  NeedPermission = 4,
}

/** CallMessage.Opaque.Urgency (missing => Droppable). */
export enum OpaqueUrgency {
  Droppable = 0,
  HandleImmediately = 1,
}

/** signaling.VideoCodecType — the codecs a peer can receive. */
export enum VideoCodecType {
  VP8 = 8,
  VP9 = 9,
  H264ConstrainedBaseline = 40,
  H264ConstrainedHigh = 46,
}

/** signaling.CallMessage.RingIntention.Type. */
export enum RingIntentionType {
  Ring = 0,
  Cancelled = 1,
}

/** signaling.CallMessage.RingResponse.Type. */
export enum RingResponseType {
  Ringing = 0,
  Accepted = 1,
  Declined = 2,
  Busy = 3,
}

// ===========================================================================
// Layer 2: RingRTC signaling.proto — the `opaque` payloads.
// ===========================================================================

/** signaling.VideoCodec — `reserved 2` (old H264 level) is intentionally absent. */
export const VideoCodec = message({
  type: int(1),               // VideoCodecType
});
export type VideoCodec = TypeOf<typeof VideoCodec>;

/** signaling.ConnectionParametersV4 — the *entire* negotiated state. Everything
 * else WebRTC normally negotiates via SDP is reconstructed locally (see Docs/07
 * §B.2 and callSRTP.ts for the media gate). */
export const ConnectionParametersV4 = message({
  publicKey: bytes(1),                          // 32-byte X25519 public key (DH → SRTP)
  iceUfrag: string(2),
  icePwd: string(3),
  receiveVideoCodecs: repeated(sub(4, () => VideoCodec)),
  maxBitrateBps: int64(5),                      // requested send bitrate from the peer
});
export type ConnectionParametersV4 = TypeOf<typeof ConnectionParametersV4>;

/** signaling.Offer — a thin version slot (only `v4` is accepted today). */
export const SignalingOffer = message({
  v4: sub(4, () => ConnectionParametersV4),
});
export type SignalingOffer = TypeOf<typeof SignalingOffer>;

/** signaling.Answer — same shape as the Offer. */
export const SignalingAnswer = message({
  v4: sub(4, () => ConnectionParametersV4),
});
export type SignalingAnswer = TypeOf<typeof SignalingAnswer>;

/** signaling.IceCandidateV3 — one SDP candidate line. ICE candidates are still
 * V3 (an SDP string) even inside a V4 offer. */
export const IceCandidateV3 = message({
  sdp: string(1),             // e.g. "candidate:… 1 udp … typ host"
});
export type IceCandidateV3 = TypeOf<typeof IceCandidateV3>;

/** signaling.SocketAddr — identifies a *removed* candidate (component/udp assumed). */
export const SocketAddr = message({
  ip: bytes(1),               // 4 bytes (IPv4) or 16 bytes (IPv6)
  port: int(2),
});
export type SocketAddr = TypeOf<typeof SocketAddr>;

/** signaling.IceCandidate — an added candidate (`addedV3`) or a removal (`removed`).
 * Field tag 2 for `addedV3` is intentional (V2/V3/V4 wire compat). */
export const SignalingIceCandidate = message({
  addedV3: sub(2, () => IceCandidateV3),
  removed: sub(3, () => SocketAddr),
});
export type SignalingIceCandidate = TypeOf<typeof SignalingIceCandidate>;

// --- group / ring carrier (goes in CallMessage.Opaque.data) ---

/** group_call.DeviceToDevice.MediaKey — per-sender frame-crypto secret, sent over
 * signaling (E2E-encrypted). See callFrameCrypto.ts. */
export const MediaKey = message({
  ratchetCounter: int(1),
  secret: bytes(2),           // 32-byte frame-crypto secret
  demuxId: int(3),
});
export type MediaKey = TypeOf<typeof MediaKey>;

/** group_call.DeviceToDevice — only the signaling-carried members are typed here
 * (`media_key`, `leaving`); the RTP-data-only members are out of scope. */
export const DeviceToDevice = message({
  groupId: bytes(1),
  mediaKey: sub(2, () => MediaKey),
  // heartbeat=3, reaction=5, remoteMuteRequest=6 ride RTP data, not signaling.
});
export type DeviceToDevice = TypeOf<typeof DeviceToDevice>;

/** signaling.CallMessage.RingIntention — "start/stop ringing the group". */
export const RingIntention = message({
  groupId: bytes(1),
  type: int(2),               // RingIntentionType
  // signaling.proto: `optional sfixed64 ring_id = 3` — fixed 8-byte LE (wire-type 1),
  // NOT a varint. Carried as a bigint id (signaling.proto:86).
  ringId: fixed64(3),
});
export type RingIntention = TypeOf<typeof RingIntention>;

/** signaling.CallMessage.RingResponse — "I'm ringing / accepted / declined / busy". */
export const RingResponse = message({
  groupId: bytes(1),
  type: int(2),               // RingResponseType
  // signaling.proto: `optional sfixed64 ring_id = 3` — fixed 8-byte LE (wire-type 1),
  // NOT a varint (signaling.proto:100).
  ringId: fixed64(3),
});
export type RingResponse = TypeOf<typeof RingResponse>;

/** signaling.CallMessage — the group/ring carrier serialized into
 * CallMessage.Opaque.data (NOT used for 1:1 offer/answer/ICE). */
export const SignalingCallMessage = message({
  groupCallMessage: sub(1, () => DeviceToDevice),
  ringIntention: sub(2, () => RingIntention),
  ringResponse: sub(3, () => RingResponse),
});
export type SignalingCallMessage = TypeOf<typeof SignalingCallMessage>;

// ===========================================================================
// Layer 1: Signal-service CallMessage — inside Content.callMessage (field 3).
// ===========================================================================

/** CallMessage.Offer. `opaque` = serialized signaling.Offer (above). */
export const CallOffer = message({
  id: int64(1),               // the CallId (random uint64), identical across the call
  type: int(3),               // OfferType
  opaque: bytes(4),           // serialized SignalingOffer
});
export type CallOffer = TypeOf<typeof CallOffer>;

/** CallMessage.Answer. `opaque` = serialized signaling.Answer. */
export const CallAnswer = message({
  id: int64(1),
  opaque: bytes(3),           // serialized SignalingAnswer
});
export type CallAnswer = TypeOf<typeof CallAnswer>;

/** CallMessage.IceUpdate — `repeated` in CallMessage, one candidate each.
 * `opaque` = serialized signaling.IceCandidate. */
export const CallIceUpdate = message({
  id: int64(1),
  opaque: bytes(5),           // serialized SignalingIceCandidate
});
export type CallIceUpdate = TypeOf<typeof CallIceUpdate>;

/** CallMessage.Busy — "I'm already in a call." Carries only the call id. */
export const CallBusy = message({
  id: int64(1),
});
export type CallBusy = TypeOf<typeof CallBusy>;

/** CallMessage.Hangup — end / decline; `type` + `deviceId` encode *where*. */
export const CallHangup = message({
  id: int64(1),
  type: int(2),               // HangupType
  deviceId: int(3),           // the *other* device for ...OnAnotherDevice
});
export type CallHangup = TypeOf<typeof CallHangup>;

/** CallMessage.Opaque — carrier for group-call / ring messages. */
export const CallOpaque = message({
  data: bytes(1),             // serialized SignalingCallMessage
  urgency: int(2),            // OpaqueUrgency (missing => Droppable)
});
export type CallOpaque = TypeOf<typeof CallOpaque>;

/** The Signal-service CallMessage (Content.callMessage, field 3 of Content). */
export const CallMessage = message({
  offer: sub(1, () => CallOffer),
  answer: sub(2, () => CallAnswer),
  iceUpdate: repeated(sub(3, () => CallIceUpdate)),  // repeated — many candidates per message
  busy: sub(5, () => CallBusy),
  hangup: sub(7, () => CallHangup),
  destinationDeviceId: int(9),   // set => one device only; absent => ring all devices
  opaque: sub(10, () => CallOpaque),
});
export type CallMessage = TypeOf<typeof CallMessage>;

// ===========================================================================
// High-level builders / parsers — assemble the nested CallMessage in one call
// (V4 params ⇄ opaque ⇄ CallMessage), mirroring whatsAppCallSignaling.ts.
// ===========================================================================

/** Whether to ring all the recipient's devices, or just one. Encoded by the
 * presence of `destinationDeviceId` (Docs/07 §A.3). */
export interface CallTarget {
  /** Set => deliver to only this device. Absent => ring all the peer's devices. */
  deviceId?: number;
}

/** Build the CallMessage for an outgoing offer. `opaque` wraps the V4 params in a
 * signaling.Offer. Offers are broadcast (no destinationDeviceId) and urgent. */
export function buildOffer(callID: bigint, type: OfferType, v4: ConnectionParametersV4): CallMessage {
  let opaque = encode(SignalingOffer, { v4 });
  return { offer: { id: callID, type, opaque } };
}

/** Build the CallMessage for an answer. Answers are targeted at the caller's
 * device that sent the offer. */
export function buildAnswer(callID: bigint, v4: ConnectionParametersV4, callerDeviceId: number): CallMessage {
  let opaque = encode(SignalingAnswer, { v4 });
  return { answer: { id: callID, opaque }, destinationDeviceId: callerDeviceId };
}

/** Build the CallMessage carrying ICE candidates (added candidate SDP lines).
 * `iceUpdate` is repeated, so many candidates ride in one message. The callee
 * targets the caller's device; the caller broadcasts (omit `target.deviceId`). */
export function buildIceUpdate(callID: bigint, candidates: string[], target: CallTarget = {}): CallMessage {
  let iceUpdate = candidates.map(sdp => ({
    id: callID,
    opaque: encode(SignalingIceCandidate, { addedV3: { sdp } }),
  }));
  return { iceUpdate, destinationDeviceId: target.deviceId };
}

/** Build a Hangup CallMessage. Broadcast to all the peer's devices (urgent). */
export function buildHangup(callID: bigint, type = HangupType.Normal, deviceId = 0): CallMessage {
  return { hangup: { id: callID, type, deviceId } };
}

/** Build a Busy CallMessage ("I'm already in a call"). */
export function buildBusy(callID: bigint): CallMessage {
  return { busy: { id: callID } };
}

// --- inbound: pull the V4 params / candidates back out ---

/** The signaling.Offer V4 params from a received CallMessage.Offer.opaque. */
export function parseOfferParams(offer: CallOffer): ConnectionParametersV4 | undefined {
  return offer.opaque ? decode(SignalingOffer, offer.opaque).v4 : undefined;
}

/** The signaling.Answer V4 params from a received CallMessage.Answer.opaque. */
export function parseAnswerParams(answer: CallAnswer): ConnectionParametersV4 | undefined {
  return answer.opaque ? decode(SignalingAnswer, answer.opaque).v4 : undefined;
}

/** The candidate SDP lines from a received CallMessage's iceUpdate[] (added only;
 * removals carry only an ip/port and are surfaced via parseIceRemovals). */
export function parseIceCandidates(callMessage: CallMessage): string[] {
  let out: string[] = [];
  for (let update of callMessage.iceUpdate ?? []) {
    if (!update.opaque) {
      continue;
    }
    let candidate = decode(SignalingIceCandidate, update.opaque);
    if (candidate.addedV3?.sdp) {
      out.push(candidate.addedV3.sdp);
    }
  }
  return out;
}
