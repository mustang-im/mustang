/** In-memory Signal protocol store: our keys plus per-peer sessions and
 * per-group sender keys. A SQL-backed implementation can replace this later
 * by implementing the same shape; persistence is not wired yet. */
import { KeyPair } from "../KeyPair";
import { SignedPreKey, PreKey } from "./Identity";
import type { SessionState } from "./SessionCipher";
import type { SenderKeyState } from "./GroupCipher";
import { generateRegistrationID, generateSignedPreKey, generatePreKeys } from "./Identity";
import { base64Encode, base64Decode } from "../primitives";

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

  /** Serializes the static key material (identity, registration id, signed and
   * one-time prekeys, trusted identities) to plain JSON for the account config.
   * The dynamic ratchet state (sessions, sender keys) is not included; it is
   * rebuilt from incoming messages. */
  toJSON(): any {
    return {
      identityKey: base64Encode(this.identityKeyPair.privateKey),
      registrationID: this.registrationID,
      signedPreKeys: [...this.signedPreKeys.values()].map(key => ({
        id: key.keyID,
        key: base64Encode(key.keyPair.privateKey),
        signature: base64Encode(key.signature),
      })),
      preKeys: [...this.preKeys.values()].map(key => ({
        id: key.keyID,
        key: base64Encode(key.keyPair.privateKey),
      })),
      identities: [...this.identities.entries()].map(([address, key]) => ({
        address,
        key: base64Encode(key),
      })),
    };
  }

  static fromJSON(json: any): SignalStore {
    let store = new SignalStore();
    store.identityKeyPair = KeyPair.fromPrivate(base64Decode(json.identityKey));
    store.registrationID = json.registrationID;
    for (let entry of json.signedPreKeys ?? []) {
      store.signedPreKeys.set(entry.id,
        new SignedPreKey(entry.id, KeyPair.fromPrivate(base64Decode(entry.key)), base64Decode(entry.signature)));
    }
    for (let entry of json.preKeys ?? []) {
      store.preKeys.set(entry.id, new PreKey(entry.id, KeyPair.fromPrivate(base64Decode(entry.key))));
    }
    for (let entry of json.identities ?? []) {
      store.identities.set(entry.address, base64Decode(entry.key));
    }
    return store;
  }
}
