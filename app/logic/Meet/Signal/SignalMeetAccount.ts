/** A Meet account for Signal voice/video calls. It is a thin dependent account
 * of the SignalAccount (the chat account) — it has no connection of its own; call
 * signaling rides over the chat account's Signal connection as a `CallMessage`
 * inside `Content.callMessage` (mirrors WhatsAppMeetAccount over its chat account).
 *
 * SIGNALING is complete: build/parse/route Offer/Answer/IceUpdate/Hangup/Busy and
 * fetch TURN relays. The MEDIA plane is GATED — Signal disables DTLS and installs
 * raw SRTP keys, which a stock browser RTCPeerConnection cannot do (see the MEDIA
 * GATE header in callSRTP.ts). Calls only fully work with a WebRTC engine that
 * allows external SRTP keying (desktop/Electron native path). */
import { MeetAccount } from "../MeetAccount";
import { SignalCall } from "./SignalCall";
import { type CallMessage as CallMessageType } from "./signalingProto";
import { CallMessage, buildBusy } from "./signalingProto";
import { ServiceId } from "../../Chat/Signal/ServiceId";
import { djbEncode } from "../../Chat/Signal/Crypto/curve";
import { encode, decode } from "../../Chat/Signal/Proto/codec";
import type { SignalAccount } from "../../Chat/Signal/SignalAccount";
import { appGlobal } from "../../app";

/** A TURN credential set from GET /v2/calling/relays (Docs/07 §E). */
export interface TurnToken {
  username: string;
  password: string;
  ttl: number;
  urls: string[];
  urlsWithIps?: string[];
  hostname?: string;
}

export class SignalMeetAccount extends MeetAccount {
  readonly protocol: string = "signal-meet";
  canAudio = true;
  canVideo = true;
  canScreenShare = false;
  canMultipleParticipants = false; // 1:1 calls for now; Signal also has group calls (SFU)
  canCreateURL = false;

  /** Cached TURN relays + the time they expire (ms epoch). */
  protected turnRelays: TurnToken[] = [];
  protected turnExpiry = 0;

  /** The chat account that owns the connection used for signaling. Derived from
   * `mainAccount`, wired by the standard dependent-account linking. */
  get chatAccount(): SignalAccount {
    return this.mainAccount as SignalAccount;
  }

  newMeeting(): SignalCall {
    return new SignalCall(this);
  }

  // Dependent account: no own login or license; it uses the chat account.
  needsLicense(): boolean {
    return false;
  }
  async login(): Promise<void> {
  }

  /** Our own ACI (the call peer identity), from the paired chat account. */
  get ownServiceId(): ServiceId {
    let aci = this.chatAccount?.aci;
    if (!aci) {
      throw new Error("Signal account is not set up yet");
    }
    return aci;
  }

  // --- outbound ---

  /** Place a 1:1 call to `peer`. Returns the new meeting (state OutgoingCallConfirm;
   * call `.call()` to start ringing). */
  placeCall(peer: ServiceId, video: boolean): SignalCall {
    let call = this.newMeeting();
    call.prepareOutgoing(peer, video);
    appGlobal.meetings.add(call);
    return call;
  }

  /** Send a CallMessage to the recipients over the Signal connection. The
   * CallMessage is wrapped in `Content.callMessage` (field 3) and E2E-encrypted +
   * sent by SignalAccount.sendContent. */
  async sendCallMessage(recipients: ServiceId[], callMessage: CallMessageType): Promise<void> {
    let content = { callMessage: encode(CallMessage, callMessage) };
    await this.chatAccount.sendContent(recipients, content, Date.now());
  }

  // --- inbound (called from SignalAccount's Content routing) ---

  /** Route an inbound CallMessage to the right call, or start a new incoming one.
   * SignalAccount calls this from its Content handling when `content.callMessage`
   * is present (see the hook note at the bottom of this file).
   * @param callMessageBytes the raw `Content.callMessage` (field 3) bytes
   * @param from the sender's ServiceId
   * @param fromDeviceID the sender's device id (Envelope.sourceDeviceId) */
  handleCallMessage(callMessageBytes: Uint8Array, from: ServiceId, fromDeviceID: number): void {
    let callMessage = decode(CallMessage, callMessageBytes);
    let callID = this.callIDOf(callMessage);
    if (callID == null) {
      return; // group/ring opaque or an unrecognized variant — not handled here yet
    }
    let existing = appGlobal.meetings.find(
      m => m instanceof SignalCall && m.callID == callID) as SignalCall | undefined;
    if (existing) {
      existing.onCallMessage(callMessage, fromDeviceID).catch(ex => this.errorCallback(ex));
      return;
    }
    if (callMessage.offer) {
      if (this.busyInAnotherCall()) {
        this.sendCallMessage([from], buildBusy(callID)).catch(ex => this.errorCallback(ex));
        return;
      }
      let call = this.newMeeting();
      call.onIncomingOffer(callMessage, from, fromDeviceID).catch(ex => this.errorCallback(ex));
      appGlobal.meetings.add(call);
    }
    // answer/ice/hangup with no matching call: stale; ignore.
  }

  protected callIDOf(callMessage: CallMessageType): bigint | undefined {
    return callMessage.offer?.id ?? callMessage.answer?.id
      ?? callMessage.iceUpdate?.[0]?.id ?? callMessage.hangup?.id ?? callMessage.busy?.id;
  }

  protected busyInAnotherCall(): boolean {
    return appGlobal.meetings.contents.some(
      m => m instanceof SignalCall && m.state != "ended" && m.state != "init");
  }

  // --- identity keys (for the DH→SRTP binding, Docs/07 §C.2) ---

  /** Our long-term identity public key, DJB-encoded (33 bytes) as sent on the wire. */
  ownIdentityKey(): Uint8Array {
    let store = this.chatAccount?.aciStore;
    if (!store) {
      throw new Error("Signal account has no identity key");
    }
    return djbEncode(store.identityKeyPair.publicKey);
  }

  /** The peer's stored long-term identity public key (DJB form), or undefined if
   * we have no session with them yet. */
  peerIdentityKey(peer: ServiceId): Uint8Array | undefined {
    let store = this.chatAccount?.aciStore;
    if (!store) {
      return undefined;
    }
    let prefix = peer.toString();
    for (let [address, key] of store.identities) {
      if (address == prefix || address.startsWith(prefix + ".")) {
        return key;
      }
    }
    return undefined;
  }

  // --- TURN relays (Docs/07 §E) ---

  /** STUN/TURN ICE servers for the RTCPeerConnection, from cached relays plus a
   * public STUN fallback. Refreshes the relays in the background when stale. */
  iceServers(): RTCIceServer[] {
    if (Date.now() > this.turnExpiry) {
      this.fetchTurnRelays().catch(ex => this.errorCallback(ex));
    }
    let servers: RTCIceServer[] = this.turnRelays.map(relay => ({
      urls: relay.urlsWithIps?.length ? relay.urlsWithIps : relay.urls,
      username: relay.username,
      credential: relay.password,
    }));
    servers.push({ urls: "stun:stun.l.google.com:19302" });
    return servers;
  }

  /** GET /v2/calling/relays → TURN tokens (standard account+device Basic auth). */
  async fetchTurnRelays(): Promise<TurnToken[]> {
    let creds = this.chatAccount.authCredentials();
    let res = await this.chatAccount.api().json<{ relays: TurnToken[] }>(
      "GET", "/v2/calling/relays", undefined, creds);
    this.turnRelays = res?.relays ?? [];
    let minTtl = Math.min(...this.turnRelays.map(r => r.ttl ?? 0), 3600);
    this.turnExpiry = Date.now() + Math.max(minTtl - 60, 60) * 1000;
    return this.turnRelays;
  }
}

/* ───────────────────────────────────────────────────────────────────────────
 * HOOK INTO SignalAccount'S INBOUND ROUTING
 * ───────────────────────────────────────────────────────────────────────────
 * SignalAccount.handleEnvelope() decrypts an Envelope to a `Content`, then routes
 * it to a room. `Content.callMessage` (field 3) is raw bytes there (the chat layer
 * doesn't decode it). To deliver calls, SignalAccount needs, after decrypt:
 *
 *   if (content.callMessage?.length) {
 *     let meet = appGlobal.meetAccounts.find(
 *       a => a instanceof SignalMeetAccount && a.chatAccount == this) as SignalMeetAccount;
 *     meet?.handleCallMessage(content.callMessage, senderId, envelope.sourceDeviceId ?? 0);
 *     return; // a CallMessage is not a chat-room message
 *   }
 *
 * This mirrors how WhatsAppAccount routes a `<call>` stanza to
 * WhatsAppMeetAccount.handleCallStanza(). The dependent SignalMeetAccount is found
 * via the same mainAccount linking the WhatsApp pair uses. (Not wired in
 * SignalAccount yet because its decryptEnvelope is still gated on the SPQR
 * ratchet; the call routing is ready to drop in once decrypt lands.)
 * ─────────────────────────────────────────────────────────────────────────── */
