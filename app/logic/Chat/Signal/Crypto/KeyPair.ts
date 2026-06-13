import { x25519 } from "@noble/curves/ed25519.js";

/** A Curve25519 (X25519) key pair. Public keys are 32 raw bytes; see curve.ts
 * for the operations (DH, XEdDSA) that use them. */
export class KeyPair {
  /** 32-byte X25519 private key */
  privateKey: Uint8Array;
  /** 32-byte X25519 public key */
  publicKey: Uint8Array;

  constructor(privateKey: Uint8Array, publicKey: Uint8Array) {
    this.privateKey = privateKey;
    this.publicKey = publicKey;
  }

  static generate(): KeyPair {
    let priv = x25519.utils.randomSecretKey();
    return new KeyPair(priv, x25519.getPublicKey(priv));
  }

  static fromPrivate(priv: Uint8Array): KeyPair {
    return new KeyPair(priv, x25519.getPublicKey(priv));
  }
}
