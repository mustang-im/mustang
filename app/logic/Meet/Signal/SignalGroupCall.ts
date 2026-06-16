/** Signal GROUP calls over the SFU (Docs/07 §D). STRUCTURED, ADVANCED PARTS
 * MARKED — lower priority than 1:1 signaling, and gated on the same media engine.
 *
 * Group calls are NOT peer-to-peer: every participant connects to a central SFU
 * (`sfu.voip.signal.org`) with a SINGLE PeerConnection (same V4/DH/SRTP transport
 * as 1:1, but the peer is the SFU). E2E content protection is layered on top via
 * per-sender media-frame encryption (callFrameCrypto.ts), since the SFU forwards
 * media. The per-sender secret is distributed over Signal signaling as a
 * `signaling.CallMessage.group_call_message → DeviceToDevice.MediaKey`
 * (signalingProto.ts).
 *
 * What's READY here:
 *  - The join/peek HTTP shapes (JSON) and the SRTP DH with the SFU (reuse callSRTP).
 *  - The MediaKey distribution protobuf (signalingProto.ts) + frame crypto
 *    (callFrameCrypto.ts).
 *
 * What's ADVANCED / TODO (marked inline):
 *  - The actual SFU PeerConnection media plane (same DTLS-disable gate as 1:1).
 *  - The membership-proof zkgroup auth header (depends on the chat group layer).
 *  - The encoded-frame transform wiring for per-frame crypto.
 *  - DeviceToSfu/SfuToDevice RTP-data control (video requests, peek updates).
 *  - eraId ⇄ ringId, call-link adhoc calls (Docs/07 §D.3, §D.8) — deferred. */
import { VideoConfMeeting } from "../VideoConfMeeting";
import { LocalMediaDeviceStreams } from "../LocalMediaDeviceStreams";
import type { SignalMeetAccount } from "./SignalMeetAccount";
import { newCallKeyPair, deriveSRTPKeys } from "./callSRTP";
import { encode, decode } from "../../Chat/Signal/Proto/codec";
import { SignalingCallMessage, type MediaKey } from "./signalingProto";
import { bytesToHex, hexToBytes } from "@noble/curves/utils.js";

/** The Signal SFU base URL (Docs/07 §D). */
export const kSfuURL = "https://sfu.voip.signal.org";

/** JoinRequest body for PUT {sfu}/v2/conference/participants (Docs/07 §D.2). */
export interface SfuJoinRequest {
  adminPasskey?: string;   // base64; call-link admin only
  iceUfrag: string;
  icePwd: string;
  dhePublicKey: string;    // hex of our 32-byte X25519 public key
  hkdfExtraInfo: string;   // hex
}

/** SerializedJoinResponse (camelCase JSON), Docs/07 §D.2. */
export interface SfuJoinResponse {
  demuxId: number;
  ips: string[];
  port: number;
  portTcp?: number;
  portTls?: number;
  hostname?: string;
  iceUfrag: string;
  icePwd: string;
  dhePublicKey: string;    // hex SFU X25519 public key
  callCreator?: string;
  conferenceId: string;    // the eraId
  clientStatus?: string;   // ACTIVE / PENDING / BLOCKED
}

/** SerializedPeekInfo (camelCase JSON), from GET {sfu}/v2/conference/participants. */
export interface SfuPeekInfo {
  conferenceId?: string;   // eraId
  maxDevices?: number;
  participants?: { opaqueUserId?: string, demuxId?: number }[];
  creator?: string;
  pendingClients?: unknown[];
}

export class SignalGroupCall extends VideoConfMeeting {
  declare account: SignalMeetAccount;
  /** The eraId of the joined call instance (Docs/07 §D.3). */
  eraId: string | null = null;
  /** Our demux id at the SFU (identifies our media streams). */
  demuxId = 0;

  protected callKeyPair = newCallKeyPair();
  protected peerConnection: RTCPeerConnection | null = null;
  /** Our current frame-crypto send secret + its ratchet counter (§D.5). */
  protected sendSecret: Uint8Array | null = null;
  protected sendRatchetCounter = 0;

  constructor(account: SignalMeetAccount) {
    super();
    this.account = account;
    this.id = crypto.randomUUID();
    this.mediaDeviceStreams = new LocalMediaDeviceStreams();
    this.listenStreamChanges();
  }

  // --- peek (who's in the call, without joining) ---

  /** GET {sfu}/v2/conference/participants. A 404 means "no call in progress".
   * ADVANCED: the Authorization header needs the zkgroup membership proof
   * (Docs/07 §D.7) — supply via `authHeader`. */
  async peek(authHeader: string): Promise<SfuPeekInfo | null> {
    let res = await fetch(`${kSfuURL}/v2/conference/participants`, {
      method: "GET",
      headers: { Authorization: authHeader },
    });
    if (res.status == 404) {
      return null;
    }
    if (!res.ok) {
      throw new Error(`SFU peek failed: ${res.status}`);
    }
    return await res.json() as SfuPeekInfo;
  }

  // --- join ---

  /** PUT {sfu}/v2/conference/participants. Builds the join body from our WebRTC
   * ICE params + DH public key, then sets up the (single) PeerConnection to the
   * SFU from the response (same V4/DH/SRTP as 1:1).
   *
   * ADVANCED / GATED:
   *  - `authHeader` = the zkgroup membership proof (Docs/07 §D.7), built by the
   *    chat group layer.
   *  - The media plane (SFU PeerConnection, raw SRTP) is the same DTLS-disable
   *    gate as 1:1 (callSRTP.ts MEDIA GATE). */
  async join(authHeader: string, iceUfrag: string, icePwd: string): Promise<SfuJoinResponse> {
    let body: SfuJoinRequest = {
      iceUfrag, icePwd,
      dhePublicKey: bytesToHex(this.callKeyPair.publicKey),
      hkdfExtraInfo: "",
    };
    let res = await fetch(`${kSfuURL}/v2/conference/participants`, {
      method: "PUT",
      headers: { Authorization: authHeader, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      throw new Error(`SFU join failed: ${res.status}`);
    }
    let join = await res.json() as SfuJoinResponse;
    this.eraId = join.conferenceId;
    this.demuxId = join.demuxId;
    this.deriveSfuSRTP(join);
    // TODO: build the SFU PeerConnection from join.ips/port + iceUfrag/icePwd,
    //       install the SRTP keys (gated), then generate + distribute our MediaKey.
    return join;
  }

  /** DH with the SFU's public key → SRTP keys for the SFU leg (Docs/07 §D.2,
   * same negotiate_srtp_keys shape as 1:1; identity-key binding uses empty keys
   * for the SFU leg). */
  protected deriveSfuSRTP(join: SfuJoinResponse) {
    let serverPublic = hexToBytes(join.dhePublicKey);
    // The SFU leg binds to no client identity keys (group E2E is the frame layer).
    deriveSRTPKeys(this.callKeyPair.privateKey, serverPublic, EMPTY, EMPTY);
    // (Result installed into the SFU PeerConnection once the media engine supports it.)
  }

  // --- per-sender media-key distribution (Docs/07 §D.5) ---

  /** Our current send key as a MediaKey, to E2E-send to members over signaling
   * (wrapped in signaling.CallMessage.group_call_message). */
  ourMediaKey(): MediaKey {
    if (!this.sendSecret) {
      throw new Error("No group-call send key yet (join first)");
    }
    return { ratchetCounter: this.sendRatchetCounter, secret: this.sendSecret, demuxId: this.demuxId };
  }

  /** Serialize a MediaKey into a signaling.CallMessage for sending to a member.
   * The caller wraps this in a Signal CallMessage.Opaque.data. */
  encodeMediaKeyMessage(mediaKey: MediaKey, groupId: Uint8Array): Uint8Array {
    return encode(SignalingCallMessage, { groupCallMessage: { groupId, mediaKey } });
  }

  /** Parse an inbound signaling.CallMessage (from Opaque.data) into its MediaKey. */
  static parseMediaKeyMessage(data: Uint8Array): MediaKey | undefined {
    return decode(SignalingCallMessage, data).groupCallMessage?.mediaKey;
  }

  // TODO §D.5 lifecycle: on join generate a random send secret; on member added
  // advance the ratchet and send only to new members; on member removed generate
  // a fresh secret and send to everyone except the removed member (forward
  // secrecy). add_receive_secret per (demuxId, ratchetCounter).
}

const EMPTY = new Uint8Array(0);
