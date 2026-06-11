/** Signal identity, registration id, and prekeys. */
import { KeyPair } from "../KeyPair";
import { djbEncode, xeddsaSign, xeddsaVerify } from "../curve";
import { randomBytes } from "../primitives";

export class SignedPreKey {
  keyID: number;
  keyPair: KeyPair;
  /** XEdDSA signature over djbEncode(keyPair.publicKey), by the identity key. */
  signature: Uint8Array;

  constructor(keyID: number, keyPair: KeyPair, signature: Uint8Array) {
    this.keyID = keyID;
    this.keyPair = keyPair;
    this.signature = signature;
  }
}

export class PreKey {
  keyID: number;
  keyPair: KeyPair;

  constructor(keyID: number, keyPair: KeyPair) {
    this.keyID = keyID;
    this.keyPair = keyPair;
  }
}

/** A remote user's published keys, used to start a session with them (X3DH). */
export class PreKeyBundle {
  registrationID: number;
  identityKey: Uint8Array; // 32 bytes
  signedPreKeyID: number;
  signedPreKeyPublic: Uint8Array; // 32 bytes
  signedPreKeySignature: Uint8Array; // 64 bytes
  preKeyID?: number;
  preKeyPublic?: Uint8Array; // 32 bytes, optional one-time prekey
}

export function generateRegistrationID(): number {
  // 14-bit, 0..16383 (the range WhatsApp/Signal use)
  let bytes = randomBytes(2);
  return ((bytes[0] << 8) | bytes[1]) & 0x3FFF;
}

export function generateSignedPreKey(identityKey: KeyPair, keyID: number): SignedPreKey {
  let keyPair = KeyPair.generate();
  let signature = xeddsaSign(identityKey.privateKey, djbEncode(keyPair.publicKey));
  return new SignedPreKey(keyID, keyPair, signature);
}

export function generatePreKeys(startID: number, count: number): PreKey[] {
  let keys: PreKey[] = [];
  for (let i = 0; i < count; i++) {
    keys.push(new PreKey(startID + i, KeyPair.generate()));
  }
  return keys;
}

/** Verifies the signed prekey signature in a remote bundle. */
export function verifyPreKeyBundle(bundle: PreKeyBundle): boolean {
  return xeddsaVerify(bundle.identityKey, djbEncode(bundle.signedPreKeyPublic), bundle.signedPreKeySignature);
}
