/** ML-KEM-1024 (FIPS 203, formerly CRYSTALS-Kyber-1024), the post-quantum KEM in
 * Signal's PQXDH handshake. Public keys and ciphertexts are 1568 bytes, the
 * shared secret 32. Thin wrapper over @noble/post-quantum; we persist the 64-byte
 * seed (not the 3168-byte secret key) and re-derive the key pair on demand.
 * Mirrors {@link KeyPair} for the classic curve. */
import { ml_kem1024 } from "@noble/post-quantum/ml-kem.js";
import { sha3_256, shake256 } from "@noble/hashes/sha3.js";
import { randomBytes, concatBytes } from "../Crypto/primitives";

export const kKyberPublicKeyLength = 1568;
export const kKyberCiphertextLength = 1568;
export const kKyberSecretLength = 32;
const kKyberSeedLength = 64;
/** libsignal KEM type byte for Kyber1024 (kem.rs `KeyType::Kyber1024 => 0x08`). The
 * serialized public key and ciphertext both carry it as a 1-byte prefix (raw + 1). */
const kKyberCiphertextTypeByte = 0x08;

export class KyberKeyPair {
  /** 64-byte seed — what we persist; the rest is derived from it. */
  seed: Uint8Array;
  /** 1568-byte ML-KEM public key (what we publish as a Kyber prekey). */
  publicKey: Uint8Array;
  /** 3168-byte ML-KEM secret key (derived, used to decapsulate). */
  secretKey: Uint8Array;

  protected constructor(seed: Uint8Array, publicKey: Uint8Array, secretKey: Uint8Array) {
    this.seed = seed;
    this.publicKey = publicKey;
    this.secretKey = secretKey;
  }

  static generate(): KyberKeyPair {
    return KyberKeyPair.fromSeed(randomBytes(kKyberSeedLength));
  }

  static fromSeed(seed: Uint8Array): KyberKeyPair {
    let keys = ml_kem1024.keygen(seed);
    return new KyberKeyPair(seed, keys.publicKey, keys.secretKey);
  }

  /** Recovers the 32-byte PQXDH shared secret from a peer's encapsulation. `cipherText`
   * is the libsignal-serialized form (`0x08 ‖ 1568-byte raw`); we strip the type byte,
   * run ML-KEM-1024 decapsulation, then apply Signal's Kyber1024 final KDF. */
  decapsulate(cipherText: Uint8Array): Uint8Array {
    if (cipherText[0] != kKyberCiphertextTypeByte) {
      throw new Error(`Unexpected Kyber ciphertext type 0x${cipherText[0]?.toString(16)} (expected 0x08 Kyber1024)`);
    }
    let raw = cipherText.subarray(1);
    let sharedSecret = ml_kem1024.decapsulate(raw, this.secretKey);
    return kyber1024KDF(sharedSecret, raw);
  }
}

/** Encapsulate to a peer's Kyber public key (the initiator side of PQXDH). `publicKey`
 * is the raw 1568-byte ML-KEM key. @returns the 1569-byte serialized ciphertext to put
 * on the wire (`0x08 ‖ raw`) and the 32-byte shared secret (after the Kyber1024 KDF). */
export function kyberEncapsulate(publicKey: Uint8Array): { cipherText: Uint8Array, sharedSecret: Uint8Array } {
  let { cipherText, sharedSecret } = ml_kem1024.encapsulate(publicKey);
  let serialized = new Uint8Array(1 + cipherText.length);
  serialized[0] = kKyberCiphertextTypeByte;
  serialized.set(cipherText, 1);
  return { cipherText: serialized, sharedSecret: kyber1024KDF(sharedSecret, cipherText) };
}

/** Signal's "Kyber1024" (wire type 0x08) is FIPS-203 ML-KEM-1024 keys/ciphertexts with
 * the NIST-Round-3 final shared-secret KDF that FIPS-203 dropped: the secret is
 * `SHAKE256(mlkem_secret ‖ SHA3-256(rawCiphertext))[:32]` (libcrux `variant.rs`
 * `Kyber::kdf`). @noble gives the pre-KDF ML-KEM secret, so we apply it here. The
 * IND-CPA layer and `G(m‖H(pk))` derivation are identical to ML-KEM, so only this
 * final step differs; it makes us interoperate with libsignal's Kyber1024 prekeys. */
function kyber1024KDF(mlkemSecret: Uint8Array, rawCipherText: Uint8Array): Uint8Array {
  return shake256(concatBytes(mlkemSecret, sha3_256(rawCipherText)), { dkLen: 32 });
}
