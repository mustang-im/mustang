/** ML-KEM-1024 (FIPS 203, formerly CRYSTALS-Kyber-1024), the post-quantum KEM in
 * Signal's PQXDH handshake. Public keys and ciphertexts are 1568 bytes, the
 * shared secret 32. Thin wrapper over @noble/post-quantum; we persist the 64-byte
 * seed (not the 3168-byte secret key) and re-derive the key pair on demand.
 * Mirrors {@link KeyPair} for the classic curve. */
import { ml_kem1024 } from "@noble/post-quantum/ml-kem.js";
import { randomBytes } from "../Crypto/primitives";

export const kKyberPublicKeyLength = 1568;
export const kKyberCiphertextLength = 1568;
export const kKyberSecretLength = 32;
const kKyberSeedLength = 64;

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

  /** Recovers the 32-byte shared secret from a peer's encapsulation ciphertext. */
  decapsulate(cipherText: Uint8Array): Uint8Array {
    return ml_kem1024.decapsulate(cipherText, this.secretKey);
  }
}

/** Encapsulate to a peer's Kyber public key (the initiator side of PQXDH).
 * @returns the 1568-byte ciphertext to send, and the 32-byte shared secret. */
export function kyberEncapsulate(publicKey: Uint8Array): { cipherText: Uint8Array, sharedSecret: Uint8Array } {
  let { cipherText, sharedSecret } = ml_kem1024.encapsulate(publicKey);
  return { cipherText, sharedSecret };
}
