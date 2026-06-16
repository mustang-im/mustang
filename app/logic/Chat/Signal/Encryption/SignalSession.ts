/** The Signal triple-ratchet message layer: combines PQXDH session establishment,
 * the classic Double Ratchet ({@link SessionCipher}) and the SPQR post-quantum
 * public ratchet ({@link tripleRatchet}) into a single per-peer-device session that
 * encrypts/decrypts the *padded* `Content` bytes.
 *
 * It is the piece between {@link SignalAccount} (transport, routing, persistence)
 * and the three verified crypto stacks: it holds, per address, the SPQR state +
 * the initial `pqrKey`, drives `spqr.send`/`spqr.recv` for each message, and feeds
 * the per-message SPQR key + the `pq_ratchet` wire blob through the additive
 * SessionCipher hook (so the Double Ratchet output is mixed with the post-quantum
 * key, per Docs/08 §1). The classic Double-Ratchet `SessionState` itself lives in
 * the {@link SignalStore} (already persisted); only the SPQR halves live here.
 *
 * Mirrors how WhatsApp keeps its signal sessions in the store while the protocol
 * orchestration lives in the account — but Signal's per-device sessions are
 * triple-ratchet, so the SPQR state is the extra durable bit.
 *
 * @see Docs/03 (message wrapping/padding), Docs/08 (the triple-ratchet mix). */
import type { SignalStore } from "../Crypto/Store";
import { PreKeyBundle } from "../Crypto/Identity";
import {
  encrypt, decryptSignalMessage, decryptPreKeyMessage,
  type EncryptedSignalMessage, type EncryptPqr, type DecryptPqr,
} from "../Crypto/SessionCipher";
import {
  initiatePqxdhSession, encryptPqxdh, decryptPqxdhPreKeyMessage,
  KyberPreKeyBundle,
} from "./pqxdh";
import { KyberKeyPair } from "./kyber";
import {
  initialState, send as spqrSend, recv as spqrRecv,
  serializeSPQRState, deserializeSPQRState, Direction, type SPQRState,
} from "./SPQR/tripleRatchet";
import { base64Encode, base64Decode } from "../Crypto/primitives";

/** The SPQR half of a triple-ratchet session, held per peer-device address
 * alongside the Double-Ratchet `SessionState` in the {@link SignalStore}. */
export class SPQRSession {
  state: SPQRState;
  /** A2B for the side that initiated PQXDH (us, when we sent first); B2A for the
   * responder. Kept so a restored session re-derives nothing — already in `state`. */
  direction: Direction;

  constructor(state: SPQRState, direction: Direction) {
    this.state = state;
    this.direction = direction;
  }

  static initiator(pqrKey: Uint8Array): SPQRSession {
    return new SPQRSession(initialState({ direction: Direction.A2B, authKey: pqrKey }), Direction.A2B);
  }
  static responder(pqrKey: Uint8Array): SPQRSession {
    return new SPQRSession(initialState({ direction: Direction.B2A, authKey: pqrKey }), Direction.B2A);
  }

  toJSON(): any {
    return { state: base64Encode(serializeSPQRState(this.state)), direction: this.direction };
  }
  static fromJSON(json: any): SPQRSession {
    return new SPQRSession(deserializeSPQRState(base64Decode(json.state)), json.direction);
  }
}

/** Holds every peer-device's SPQR session, keyed by the same address string the
 * {@link SignalStore} uses for the Double Ratchet (e.g. `"<aci>.1"`). Persisted by
 * {@link SignalAccount} alongside `aciStore` (Double-Ratchet sessions persist in
 * the store; the SPQR halves persist here). */
export class SignalSessions {
  protected readonly store: SignalStore;
  /** Our ACI Kyber prekey (the last-resort kyber key), used to decapsulate an
   * incoming PQXDH `pkmsg`. */
  protected readonly ourKyberKeyPair: KyberKeyPair;
  protected readonly spqr = new Map<string, SPQRSession>();

  constructor(store: SignalStore, ourKyberKeyPair: KyberKeyPair) {
    this.store = store;
    this.ourKyberKeyPair = ourKyberKeyPair;
  }

  hasSession(address: string): boolean {
    return this.store.sessions.has(address);
  }

  /** Start a session to a peer device from its fetched prekey bundle (PQXDH, as
   * the initiator). The first outgoing message will be a kyber-carrying `pkmsg`. */
  initiate(address: string, bundle: PreKeyBundle, kyberPreKey: KyberPreKeyBundle): void {
    let { pqrKey } = initiatePqxdhSession(this.store, address, bundle, kyberPreKey);
    this.spqr.set(address, SPQRSession.initiator(pqrKey));
  }

  /** Encrypt already-padded `Content` bytes to `address`, advancing both ratchets.
   * Returns `pkmsg` while the session is still pending (peer hasn't replied), else
   * `msg`. Throws if there is no session for `address` (call {@link initiate}). */
  async encryptContent(address: string, paddedContent: Uint8Array): Promise<EncryptedSignalMessage> {
    let spqr = this.spqr.get(address);
    if (!spqr) {
      throw new Error(`No SPQR session for ${address}`);
    }
    let out = spqrSend(spqr.state);
    let pqr: EncryptPqr = { key: out.key, ratchetBytes: out.msg };
    // pad=false: the caller already applied Signal's 0x80 Content padding (Docs/03 §8).
    let result = this.store.sessions.get(address)!.pendingKyber
      ? await encryptPqxdh(this.store, address, paddedContent, false, pqr)
      : await encrypt(this.store, address, paddedContent, false, pqr);
    spqr.state = out.state; // commit SPQR only after the encrypt succeeded
    return result;
  }

  /** Decrypt an inbound triple-ratchet message to its padded `Content` bytes.
   * `type` is the CiphertextMessage kind: `"pkmsg"` (PQXDH, establishes/advances
   * the responder session) or `"msg"` (an established Double Ratchet message). */
  async decryptContent(address: string, type: "pkmsg" | "msg", body: Uint8Array): Promise<Uint8Array> {
    return type == "pkmsg"
      ? await this.decryptPreKey(address, body)
      : await this.decryptMessage(address, body);
  }

  protected async decryptMessage(address: string, body: Uint8Array): Promise<Uint8Array> {
    let spqr = this.spqr.get(address);
    if (!spqr) {
      throw new Error(`No SPQR session for ${address}`);
    }
    let nextState: SPQRState | null = null;
    let pqr: DecryptPqr = ratchetBytes => {
      let out = spqrRecv(spqr!.state, ratchetBytes ?? new Uint8Array(0));
      nextState = out.state;
      return out.key;
    };
    let plaintext = await decryptSignalMessage(this.store, address, body, false, pqr);
    if (nextState) {
      spqr.state = nextState; // commit SPQR only after MAC verified + decrypt succeeded
    }
    return plaintext;
  }

  protected async decryptPreKey(address: string, body: Uint8Array): Promise<Uint8Array> {
    // A new responder PQXDH session seeds a fresh SPQR; a duplicate `pkmsg` on the
    // session we already hold reuses it. Both only commit on decrypt success.
    let established: SPQRSession | null = null;
    let nextState: SPQRState | null = null;
    let pqr: DecryptPqr = ratchetBytes => {
      let active = established ?? this.spqr.get(address);
      if (!active) {
        return null; // no SPQR yet (shouldn't happen for a kyber pkmsg)
      }
      let out = spqrRecv(active.state, ratchetBytes ?? new Uint8Array(0));
      nextState = out.state;
      return out.key;
    };
    let plaintext = await decryptPqxdhPreKeyMessage(
      this.store, address, body, this.ourKyberKeyPair, false, pqr,
      pqrKey => { established = SPQRSession.responder(pqrKey); });
    let session = established ?? this.spqr.get(address)!;
    if (nextState) {
      session.state = nextState;
    }
    this.spqr.set(address, session); // commit (new or reused) on success
    return plaintext;
  }

  // --- persistence (SPQR halves; Double-Ratchet sessions persist via the store) ---

  toJSON(): any {
    return [...this.spqr.entries()].map(([address, session]) => ({ address, session: session.toJSON() }));
  }

  /** Restore the SPQR halves. Pass the same store + kyber key the account holds. */
  static fromJSON(json: any, store: SignalStore, ourKyberKeyPair: KyberKeyPair): SignalSessions {
    let sessions = new SignalSessions(store, ourKyberKeyPair);
    for (let entry of json ?? []) {
      sessions.spqr.set(entry.address, SPQRSession.fromJSON(entry.session));
    }
    return sessions;
  }
}
