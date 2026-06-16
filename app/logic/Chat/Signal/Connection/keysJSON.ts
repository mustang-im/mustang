/** Wire JSON marshalling for the key-bearing endpoints — device link, new-account
 * registration, and `/v2/keys` (Docs/02 §A, §B.5, §C). Each EC/Kyber prekey is
 * serialized to the element shapes the server validates, all with **base64 (no
 * padding)** (`PreKeyEntity`/`SignedPreKeyEntity` emit `encodeWithoutPadding`).
 *
 * Wire-key serialization (Docs/02 conventions):
 *  - EC public key: 33 bytes = `0x05 ‖ X25519` (djbEncode).
 *  - Kyber-1024 public key: 1569 bytes = `0x08 ‖ 1568-byte ML-KEM` (libsignal kem.rs).
 *
 * ⚠️ The Kyber `signature` the server verifies is over the **1569-byte serialized**
 * public key — a different signature than the internal PQXDH one (which is over the
 * raw 1568-byte key, see pqxdh.ts). We therefore re-sign at marshalling time from
 * the identity private key rather than reusing the stored last-resort signature. */
import { KeyPair } from "../Crypto/KeyPair";
import { SignedPreKey, PreKey } from "../Crypto/Identity";
import { djbEncode, xeddsaSign } from "../Crypto/curve";
import { KyberKeyPair } from "../Encryption/kyber";
import { base64Encode } from "../Crypto/primitives";

/** Kyber-1024 public-key type byte (libsignal kem.rs `KeyType::Kyber1024 => 0x08`). */
export const kKyberKeyTypeByte = 0x08;

/** `0x08 ‖ raw 1568-byte ML-KEM key` — the 1569-byte libsignal-serialized form. */
export function serializeKyberPublicKey(publicKey: Uint8Array): Uint8Array {
  let out = new Uint8Array(1 + publicKey.length);
  out[0] = kKyberKeyTypeByte;
  out.set(publicKey, 1);
  return out;
}

/** Standard-alphabet base64, padding stripped (the client's `encodeWithoutPadding`). */
export function base64NoPad(bytes: Uint8Array): string {
  return base64Encode(bytes).replace(/=+$/, "");
}

export interface ECSignedPreKeyJSON {
  keyId: number;
  publicKey: string; // base64-no-pad, 33-byte DJB EC key
  signature: string; // base64-no-pad, 64-byte XEdDSA signature
}
export interface ECPreKeyJSON {
  keyId: number;
  publicKey: string; // base64-no-pad, 33-byte DJB EC key
}
export interface KEMSignedPreKeyJSON {
  keyId: number;
  publicKey: string; // base64-no-pad, 1569-byte serialized Kyber key
  signature: string; // base64-no-pad, 64-byte XEdDSA signature over the serialized key
}

/** A signed EC prekey → ECSignedPreKey JSON (`publicKey` is the 33-byte DJB key;
 * `signature` is the stored XEdDSA over djbEncode(pub), per Identity.ts). */
export function ecSignedPreKeyJSON(key: SignedPreKey): ECSignedPreKeyJSON {
  return {
    keyId: key.keyID,
    publicKey: base64NoPad(djbEncode(key.keyPair.publicKey)),
    signature: base64NoPad(key.signature),
  };
}

/** A one-time EC prekey → ECPreKey JSON. */
export function ecPreKeyJSON(key: PreKey): ECPreKeyJSON {
  return { keyId: key.keyID, publicKey: base64NoPad(djbEncode(key.keyPair.publicKey)) };
}

/** A Kyber prekey (last-resort or one-time) → KEMSignedPreKey JSON, signing the
 * 1569-byte serialized public key with `identityKey` (the server verifies over
 * that form). */
export function kemSignedPreKeyJSON(keyID: number, keyPair: KyberKeyPair, identityKey: KeyPair): KEMSignedPreKeyJSON {
  let serialized = serializeKyberPublicKey(keyPair.publicKey);
  return {
    keyId: keyID,
    publicKey: base64NoPad(serialized),
    signature: base64NoPad(xeddsaSign(identityKey.privateKey, serialized)),
  };
}
