/** In-memory Signal protocol store: our keys plus per-peer sessions and
 * per-group sender keys. A SQL-backed implementation can replace this later
 * by implementing the same shape; persistence is not wired yet. */
import { KeyPair } from "../KeyPair";
import type { SignedPreKey, PreKey } from "./Identity";
import type { SessionState } from "./SessionCipher";
import type { SenderKeyState } from "./GroupCipher";
import { generateRegistrationID, generateSignedPreKey, generatePreKeys } from "./Identity";

export class SignalStore {
  identityKeyPair: KeyPair;
  registrationID: number;
  signedPreKeys = new Map<number, SignedPreKey>();
  preKeys = new Map<number, PreKey>();
  /** Keyed by peer address string, e.g. "49151234567.3" */
  sessions = new Map<string, SessionState>();
  /** Keyed by `${groupJID}|${senderAddress}` */
  senderKeys = new Map<string, SenderKeyState>();
  /** Trusted remote identity keys, keyed by peer address (32-byte) */
  identities = new Map<string, Uint8Array>();

  static createNew(): SignalStore {
    let store = new SignalStore();
    store.identityKeyPair = KeyPair.generate();
    store.registrationID = generateRegistrationID();
    let signed = generateSignedPreKey(store.identityKeyPair, 1);
    store.signedPreKeys.set(1, signed);
    for (let preKey of generatePreKeys(1, 100)) {
      store.preKeys.set(preKey.keyID, preKey);
    }
    return store;
  }
}
