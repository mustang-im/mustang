/** Signal calling: the DH → SRTP key derivation, and the SDP ↔ V4 conversion.
 *
 * ───────────────────────────────────────────────────────────────────────────
 *  ⚠️  MEDIA GATE — read this before wiring real media.
 * ───────────────────────────────────────────────────────────────────────────
 * Signal calls do NOT use the normal WebRTC media plane. Two departures from a
 * stock `RTCPeerConnection` (Docs/07 §C.2, §F):
 *
 *  1. DTLS is DISABLED. There is no DTLS-SRTP handshake. Instead both peers run
 *     an X25519 Diffie-Hellman, run it through HKDF-SHA256 bound to the two
 *     parties' long-term identity keys, and install the resulting AES-256-GCM
 *     SRTP keys directly. `deriveSRTPKeys()` below reproduces exactly that.
 *
 *  2. SDP is not sent on the wire. RingRTC strips its WebRTC SDP down to
 *     `ConnectionParametersV4` (ice ufrag/pwd, receive codecs, a DH public key,
 *     a bitrate) and re-synthesizes a full SDP from those fields on the far end,
 *     using fixed conventions that live in RingRTC's C++ (not the .proto, not the
 *     Rust). `sdpToV4()` / `offerSdpFromV4()` / `answerSdpFromV4()` below do this
 *     conversion; the re-synthesis template is best-effort and marked TODO.
 *
 * The hard blocker is (1): a stock browser `RTCPeerConnection` exposes NO API to
 * disable DTLS or inject a raw SRTP key — it *requires* DTLS-SRTP. So the
 * signaling layer in this folder is complete and interoperable, but the MEDIA
 * plane needs a WebRTC engine that allows external SRTP keying. Target the
 * desktop/Electron native WebRTC path (or a native binding such as
 * node-datachannel / werift with SRTP key injection); the plain browser path
 * cannot carry Signal media. The crypto itself (X25519, HKDF, AES-256-GCM) is
 * pure TS and fully implemented here, so it is ready the moment such an engine
 * is available. SignalCall drives the signaling regardless of the media gate.
 *
 * Clean-room from Docs/07 and the public ringrtc protobufs (no RingRTC linked). */
import { sharedSecret } from "../../Chat/Signal/Crypto/curve";
import { hkdfSHA256, bytesEqual } from "../../Chat/Signal/Crypto/primitives";
import { KeyPair } from "../../Chat/Signal/Crypto/KeyPair";
import { VideoCodecType, type ConnectionParametersV4 } from "./signalingProto";

/** RingRTC's HKDF info prefix for the signalling-DH → SRTP key derivation
 * (`connection.rs`, `Signal_Calling_20200807_SignallingDH_SRTPKey_KDF`). The
 * caller and callee long-term identity keys are appended to bind the SRTP key to
 * the two identities. */
const kSRTPKeyKDFLabel = "Signal_Calling_20200807_SignallingDH_SRTPKey_KDF";

/** AEAD-AES-256-GCM: 32-byte key + 12-byte salt, per direction. */
const kGCMKeyLength = 32;
const kGCMSaltLength = 12;
/** Output = offerKey ‖ offerSalt ‖ answerKey ‖ answerSalt. */
const kSRTPKeyMaterialLength = (kGCMKeyLength + kGCMSaltLength) * 2;

/** The directional SRTP keys for one call. The *offer* keys protect media sent
 * by the caller; the *answer* keys protect media sent by the callee. Both sides
 * derive both and assign by role: you encrypt with your role's key and decrypt
 * with the peer's. */
export interface SRTPKeys {
  offerKey: Uint8Array;
  offerSalt: Uint8Array;
  answerKey: Uint8Array;
  answerSalt: Uint8Array;
}

/** Derive the AES-256-GCM SRTP keys from the call's X25519 DH, bound to the two
 * parties' identity keys. Symmetric: both peers reach the same SRTPKeys.
 *
 * @param localSecret our X25519 private key for this call (fresh per call)
 * @param remotePublic the peer's X25519 public key (from their V4 params)
 * @param callerIdentityKey caller's long-term identity public key (DJB form as sent)
 * @param calleeIdentityKey callee's long-term identity public key
 * Docs/07 §C.2. */
export function deriveSRTPKeys(
  localSecret: Uint8Array, remotePublic: Uint8Array,
  callerIdentityKey: Uint8Array, calleeIdentityKey: Uint8Array): SRTPKeys {
  let shared = sharedSecret(localSecret, remotePublic);
  // Reject a non-contributory (low-order) result: an all-zero shared secret.
  if (bytesEqual(shared, new Uint8Array(shared.length))) {
    throw new Error("Signal call: non-contributory DH key; rejecting");
  }
  let salt = new Uint8Array(32);   // 32 zero bytes
  let info = concat(textBytes(kSRTPKeyKDFLabel), callerIdentityKey, calleeIdentityKey);
  let material = hkdfSHA256(shared, salt, info, kSRTPKeyMaterialLength);
  let pos = 0;
  let next = (len: number) => material.subarray(pos, pos += len);
  return {
    offerKey: next(kGCMKeyLength),
    offerSalt: next(kGCMSaltLength),
    answerKey: next(kGCMKeyLength),
    answerSalt: next(kGCMSaltLength),
  };
}

/** A fresh X25519 keypair for one call's DH (no ratcheting in 1:1, Docs/07 §C.2). */
export function newCallKeyPair(): KeyPair {
  return KeyPair.generate();
}

// ---------------------------------------------------------------------------
// SDP ↔ ConnectionParametersV4
// ---------------------------------------------------------------------------

/** Extract the V4 parameters from a local WebRTC SDP. `publicKey` and
 * `maxBitrateBps` are supplied by the caller (they aren't in the SDP).
 * Mirrors RingRTC `SessionDescription::to_v4()`. */
export function sdpToV4(sdp: string, publicKey: Uint8Array, maxBitrateBps: bigint): ConnectionParametersV4 {
  return {
    publicKey,
    iceUfrag: firstMatch(sdp, /^a=ice-ufrag:(.+)$/m) ?? "",
    icePwd: firstMatch(sdp, /^a=ice-pwd:(.+)$/m) ?? "",
    receiveVideoCodecs: receiveVideoCodecsFromSdp(sdp),
    maxBitrateBps,
  };
}

/** The receive video codecs advertised in an SDP, as V4 VideoCodec entries. */
function receiveVideoCodecsFromSdp(sdp: string): { type: number }[] {
  let codecs: { type: number }[] = [];
  let seen = new Set<number>();
  for (let line of sdp.split(/\r?\n/)) {
    let m = line.match(/^a=rtpmap:\d+\s+([A-Za-z0-9]+)\//);
    if (!m) {
      continue;
    }
    let type = videoCodecType(m[1]);
    if (type != null && !seen.has(type)) {
      seen.add(type);
      codecs.push({ type });
    }
  }
  return codecs;
}

function videoCodecType(name: string): VideoCodecType | null {
  switch (name.toUpperCase()) {
    case "VP8": return VideoCodecType.VP8;
    case "VP9": return VideoCodecType.VP9;
    case "H264": return VideoCodecType.H264ConstrainedBaseline;
    default: return null;
  }
}

/** Re-synthesize a full offer SDP from received V4 params.
 *
 * ⚠️ The exact template (m-line layout, RTP header extensions, payload-type maps,
 * rtcp-mux, bundle, the RTP-data PT 101) lives in RingRTC's C++ and must match
 * byte-for-byte semantics or the peer's WebRTC rejects it. This is the §F.1
 * risk: a best-effort skeleton, to be completed against a live capture / the
 * RingRTC C++ `sdp.cc`. It is exercised by the round-trip tests but is NOT yet a
 * verified interop template. */
export function offerSdpFromV4(v4: ConnectionParametersV4): string {
  return sdpFromV4(v4, "actpass");
}

/** Re-synthesize a full answer SDP from received V4 params. See offerSdpFromV4. */
export function answerSdpFromV4(v4: ConnectionParametersV4): string {
  return sdpFromV4(v4, "active");
}

function sdpFromV4(v4: ConnectionParametersV4, _setup: string): string {
  // TODO: full RingRTC SDP template (Docs/07 §F.1). Skeleton only.
  let lines = [
    "v=0",
    "o=- 0 0 IN IP4 0.0.0.0",
    "s=-",
    "t=0 0",
    "a=ice-ufrag:" + (v4.iceUfrag ?? ""),
    "a=ice-pwd:" + (v4.icePwd ?? ""),
    // DTLS is disabled (Docs/07 §C.2) — keys come from deriveSRTPKeys(), not a
    // fingerprint. A real engine installs them directly; no a=fingerprint here.
  ];
  return lines.join("\r\n") + "\r\n";
}

// --- small helpers ---

function firstMatch(text: string, re: RegExp): string | null {
  let m = text.match(re);
  return m ? m[1].trim() : null;
}

function textBytes(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}

function concat(...arrays: Uint8Array[]): Uint8Array {
  let total = arrays.reduce((n, a) => n + a.length, 0);
  let out = new Uint8Array(total);
  let pos = 0;
  for (let a of arrays) {
    out.set(a, pos);
    pos += a.length;
  }
  return out;
}
