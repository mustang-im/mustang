/** Companion-device pairing — the "Link a device" flow, end to end.
 *
 * We register as a companion of the user's own phone, exactly as WhatsApp Web /
 * Desktop do, but presenting the Android client identity (see clientInfo.ts):
 *
 *  1. Connect with a *registration* ClientPayload that offers our Signal key
 *     bundle (no JID yet).
 *  2. The server replies with `<iq><pair-device>` carrying short-lived `<ref>`s.
 *     For each ref we emit a QR string `ref,noisePub,identityPub,advSecret`; the
 *     user scans it with their phone, which authorizes us.
 *  3. The server delivers `<iq><pair-success>` with a device identity the
 *     primary account signed. We verify it (advSecret HMAC + account XEdDSA
 *     signature), counter-sign it with our identity key, and send it back in
 *     `<pair-device-sign>`.
 *  4. The server then restarts the stream; the caller reconnects with a normal
 *     login payload using the device JID this returns.
 *
 * The crypto lives in Crypto/adv.ts; the wire transport in WhatsAppConnection.
 * This class is only the choreography. */
import { WhatsAppConnection, type WhatsAppTransport } from "./WhatsAppConnection";
import { KeyPair } from "./Crypto/KeyPair";
import { SignalStore } from "./Crypto/Signal/Store";
import { kDjbType } from "./Crypto/curve";
import { verifyDeviceIdentityHMAC, verifyAccountSignature, generateDeviceSignature } from "./Crypto/adv";
import { base64Encode, randomBytes } from "./Crypto/primitives";
import { WANode } from "./Binary/WANode";
import { JID, kServerUser } from "./Binary/JID";
import { deferred, type Deferred, stanzaErrorText } from "./util";
import { getRegistrationPayload, getDeviceProps, kWaBuildHash } from "./clientInfo";
import { encode, decode } from "./Proto/codec";
import {
  ADVSignedDeviceIdentityHMAC, ADVSignedDeviceIdentity, ADVDeviceIdentity,
  type DevicePairingRegistrationData,
} from "./Proto/handshakeSchema";

/** The long-lived keys a paired companion keeps. Created fresh per pairing and,
 * once paired, persisted with the account so we can log in again without
 * re-scanning. */
export interface PairingCredentials {
  /** Noise static key — its public half is in the QR and is our handshake identity. */
  noiseKey: KeyPair;
  /** Signal identity, registration id, signed prekey and one-time prekeys. */
  signalStore: SignalStore;
  /** 32-byte secret shared with the phone via the QR; keys the device-identity HMAC. */
  advSecret: Uint8Array;
  /** Our account-signed `ADVSignedDeviceIdentity` (the `<device-identity>` content
   * we sent back), set once paired. We attach it to outgoing `pkmsg` stanzas so a
   * recipient can verify the new session is from a device the account authorized. */
  deviceIdentity?: Uint8Array;
}

export class WhatsAppPairing {
  readonly creds: PairingCredentials;
  readonly connection: WhatsAppConnection;

  /** Called with each QR payload string to render. A new one arrives whenever a
   * ref expires and we rotate to the next. */
  onQR: (qr: string) => void = () => undefined;

  /** Called once the QR has been scanned and the server confirmed it — pairing is now finishing. */
  onPairing: () => void = () => undefined;

  /** How long a QR ref stays valid before we rotate. The phone is given longest
   * on the first code; later refs rotate faster, matching the real client. */
  protected qrTimeoutMs = 60_000;
  protected refs: string[] = [];
  protected qrTimer: ReturnType<typeof setTimeout> | null = null;
  protected restartTimer: ReturnType<typeof setTimeout> | null = null;
  protected result: Deferred<JID> | null = null;
  /** Set once we reach a terminal state, so late stanzas are ignored. */
  protected finished = false;
  /** Our new device JID, set once `<pair-success>` is accepted. While set, the
   * stream restart the server then sends is the expected end of pairing, not a
   * failure. */
  protected paired: JID | null = null;

  constructor(creds: PairingCredentials = WhatsAppPairing.newCredentials()) {
    this.creds = creds;
    this.connection = new WhatsAppConnection({ noiseKey: creds.noiseKey });
  }

  static isCancelled(ex: unknown): boolean {
    return ex instanceof PairingCancelled;
  }

  static newCredentials(): PairingCredentials {
    return {
      noiseKey: KeyPair.generate(),
      signalStore: SignalStore.createNew(),
      advSecret: randomBytes(32),
    };
  }

  /** Connects, shows QR codes, and resolves with our new device JID once the
   * user has scanned a code and the server confirms the pairing.
   * @param transport injectable for tests; production opens the live socket. */
  async register(transport?: WhatsAppTransport): Promise<JID> {
    this.result = deferred<JID>();
    this.connection.onStanza = node => this.onStanza(node);
    await this.connection.connect(() => getRegistrationPayload(this.getRegistrationData()), transport);
    try {
      return await this.result.promise;
    } finally {
      this.clearTimers();
    }
  }

  /** Our Signal key bundle, offered to the server so it can drive the QR pairing. */
  protected getRegistrationData(): DevicePairingRegistrationData {
    let store = this.creds.signalStore;
    let signedPreKey = store.signedPreKeys.get(1)!;
    return {
      eRegid: bigEndian(store.registrationID, 4),
      eKeytype: new Uint8Array([kDjbType]),
      eIdent: store.identityKeyPair.publicKey,
      eSkeyID: bigEndian(signedPreKey.keyID, 3),
      eSkeyVal: signedPreKey.keyPair.publicKey,
      eSkeySig: signedPreKey.signature,
      buildHash: kWaBuildHash,
      deviceProps: getDeviceProps(),
    };
  }

  protected onStanza(node: WANode) {
    this.handleStanza(node)
      .catch(ex => this.fail(ex));
  }

  protected async handleStanza(node: WANode): Promise<void> {
    if (this.finished) {
      return;
    }
    if (node.tag == "iq") {
      let pairDevice = node.child("pair-device");
      let pairSuccess = node.child("pair-success");
      if (pairDevice) {
        await this.onPairDevice(node, pairDevice);
      } else if (pairSuccess) {
        await this.onPairSuccess(node, pairSuccess);
      } else if (node.attrs.type == "error") {
        this.fail(new Error(`WhatsApp rejected the pairing request: ${stanzaErrorText(node)}`));
      }
    } else if (node.tag == "stream:error" || node.tag == "failure") {
      if (this.paired) {
        this.completePairing(); // the expected restart after a successful pairing
      } else {
        this.fail(new Error(`WhatsApp closed the pairing connection: ${stanzaErrorText(node)}`));
      }
    }
  }

  /** The server offered QR refs. Acknowledge, then start showing codes. */
  protected async onPairDevice(iq: WANode, pairDevice: WANode): Promise<void> {
    await this.ack(iq);
    this.refs = pairDevice.children("ref").map(nodeText).filter(ref => ref);
    this.showNextQR();
  }

  protected showNextQR(): void {
    let ref = this.refs.shift();
    if (!ref) {
      this.fail(new Error("The QR code expired. Please restart linking."));
      return;
    }
    let qr = [
      ref,
      base64Encode(this.creds.noiseKey.publicKey),
      base64Encode(this.creds.signalStore.identityKeyPair.publicKey),
      base64Encode(this.creds.advSecret),
    ].join(",");
    this.onQR(qr);
    this.stopQRTimer();
    this.qrTimer = setTimeout(() => this.showNextQR(), this.qrTimeoutMs);
    this.qrTimeoutMs = 20_000;
  }

  /** The phone authorized us: verify the signed device identity, counter-sign
   * it, and send it back. */
  protected async onPairSuccess(iq: WANode, pairSuccess: WANode): Promise<void> {
    this.onPairing(); // the scan succeeded; tell the UI before the (slower) crypto below
    let identityBytes = pairSuccess.child("device-identity")?.contentBytes;
    let jid = pairSuccess.child("device")?.jidAttr("jid");
    if (!identityBytes || !jid) {
      throw new Error("Malformed pair-success from WhatsApp");
    }

    let envelope = decode(ADVSignedDeviceIdentityHMAC, identityBytes);
    if (!verifyDeviceIdentityHMAC(this.creds.advSecret, envelope.details!, envelope.hmac!)) {
      throw new Error("Device identity HMAC mismatch — wrong account or tampered pairing");
    }

    let signed = decode(ADVSignedDeviceIdentity, envelope.details!);
    let ourIdentityPub = this.creds.signalStore.identityKeyPair.publicKey;
    if (!verifyAccountSignature(signed.accountSignatureKey!, signed.details!, ourIdentityPub, signed.accountSignature!)) {
      throw new Error("Account signature on the device identity is invalid");
    }

    let deviceSignature = generateDeviceSignature(
      this.creds.signalStore.identityKeyPair.privateKey, signed.details!, ourIdentityPub, signed.accountSignatureKey!);
    // Re-encode for the reply with our device signature, dropping the account
    // signature key (the server already has it).
    let signedReply = encode(ADVSignedDeviceIdentity, {
      details: signed.details,
      accountSignature: signed.accountSignature,
      deviceSignature,
    });
    // Keep it: sending our own messages later attaches this as `<device-identity>`.
    this.creds.deviceIdentity = signedReply;
    let keyIndex = decode(ADVDeviceIdentity, signed.details!).keyIndex ?? 0;

    // Remember the primary account's identity key, for verifying its Signal sessions later.
    this.creds.signalStore.identities.set(jid.toNonDevice().toString(), signed.accountSignatureKey!);

    this.paired = jid;
    this.stopQRTimer();
    await this.connection.sendNode(new WANode("iq", { to: kServerUser, type: "result", id: iq.attrs.id }, [
      new WANode("pair-device-sign", {}, [
        new WANode("device-identity", { "key-index": String(keyIndex) }, signedReply),
      ]),
    ]));
    // The server now restarts the stream; we finish when it does, then the
    // account reconnects to log in. A fallback timer covers a silent close.
    this.restartTimer = setTimeout(() => this.completePairing(), 5_000);
  }

  protected completePairing(): void {
    if (this.finished || !this.paired) {
      return;
    }
    this.finished = true;
    this.clearTimers();
    this.result!.resolve(this.paired);
  }

  protected async ack(iq: WANode): Promise<void> {
    await this.connection.sendNode(new WANode("iq", { to: kServerUser, type: "result", id: iq.attrs.id }));
  }

  /** Aborts an in-progress pairing (e.g. the user closed the dialog). */
  cancel(): void {
    this.fail(new PairingCancelled());
    void this.connection.disconnect();
  }

  protected fail(ex: Error): void {
    if (this.finished) {
      return;
    }
    this.finished = true;
    this.clearTimers();
    this.result?.reject(ex);
  }

  protected stopQRTimer(): void {
    if (this.qrTimer) {
      clearTimeout(this.qrTimer);
      this.qrTimer = null;
    }
  }

  protected clearTimers(): void {
    this.stopQRTimer();
    if (this.restartTimer) {
      clearTimeout(this.restartTimer);
      this.restartTimer = null;
    }
  }
}

/** Thrown when pairing is aborted by the user, so callers can tell it apart
 * from a real failure and stay silent. */
export class PairingCancelled extends Error {
  constructor() {
    super("WhatsApp linking was cancelled");
  }
}

/** Big-endian fixed-width encoding, as the registration key ids use. */
function bigEndian(value: number, byteCount: number): Uint8Array {
  let out = new Uint8Array(byteCount);
  for (let i = byteCount - 1; i >= 0; i--) {
    out[i] = value & 0xFF;
    value = Math.floor(value / 256);
  }
  return out;
}

/** A `<ref>` (or similar) node's text, whether the codec gave us a string or raw bytes. */
function nodeText(node: WANode): string {
  if (typeof node.content == "string") {
    return node.content;
  }
  if (node.content instanceof Uint8Array) {
    return new TextDecoder().decode(node.content);
  }
  return "";
}
