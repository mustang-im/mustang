/** The DHKEM half of an MLS cipher suite: RFC 9180 § 4.1.
 *
 * MLS needs only the unauthenticated `Encap`/`Decap`; the `AuthEncap` variants
 * are not used, so they are not implemented.
 *
 * `DeriveKeyPair` matters beyond HPKE itself: MLS derives every ratchet-tree
 * node key pair from a node secret with it (RFC 9420 § 7.4). */
import { KDF } from "./KDF";
import { utf8 } from "../util";
import { concatBytes, randomBytes } from "../../Signal/Crypto/primitives";
import { x25519 } from "@noble/curves/ed25519.js";
import { p256, p384, p521 } from "@noble/curves/nist.js";
import { bytesToNumberBE, numberToBytesBE } from "@noble/curves/utils.js";

export abstract class KEM {
  /** The HPKE `kem_id` code point, RFC 9180 § 7.1 */
  abstract readonly id: number;
  /** `Nsecret`: length of the KEM shared secret */
  abstract readonly secretLength: number;
  /** `Npk` = `Nenc`: length of a serialized public key */
  abstract readonly publicKeyLength: number;
  /** `Nsk`: length of a serialized private key */
  abstract readonly privateKeyLength: number;
  /** The KDF that the KEM itself uses, which may differ from the suite's */
  abstract readonly kdf: KDF;

  abstract deriveKeyPair(ikm: Uint8Array): KeyPair;
  abstract publicKeyFor(privateKey: Uint8Array): Uint8Array;
  /** The raw Diffie-Hellman, without the KEM's key schedule */
  protected abstract diffieHellman(privateKey: Uint8Array, publicKey: Uint8Array): Uint8Array;

  generateKeyPair(): KeyPair {
    return this.deriveKeyPair(randomBytes(this.privateKeyLength));
  }

  /** RFC 9180 § 4.1 `Encap`: a fresh shared secret plus its encapsulation. */
  encapsulate(recipientPublicKey: Uint8Array): { sharedSecret: Uint8Array, enc: Uint8Array } {
    let ephemeral = this.generateKeyPair();
    let dh = this.diffieHellman(ephemeral.privateKey, recipientPublicKey);
    let enc = ephemeral.publicKey;
    let sharedSecret = this.extractAndExpand(dh, concatBytes(enc, recipientPublicKey));
    return { sharedSecret, enc };
  }

  /** RFC 9180 § 4.1 `Decap` */
  decapsulate(enc: Uint8Array, recipientPrivateKey: Uint8Array): Uint8Array {
    let dh = this.diffieHellman(recipientPrivateKey, enc);
    let recipientPublicKey = this.publicKeyFor(recipientPrivateKey);
    return this.extractAndExpand(dh, concatBytes(enc, recipientPublicKey));
  }

  /** RFC 9180 § 4.1 `ExtractAndExpand` */
  protected extractAndExpand(dh: Uint8Array, kemContext: Uint8Array): Uint8Array {
    let prk = this.labeledExtract(new Uint8Array(0), "eae_prk", dh);
    return this.labeledExpand(prk, "shared_secret", kemContext, this.secretLength);
  }

  /** RFC 9180 § 4: `LabeledExtract` with the KEM's own `suite_id` */
  protected labeledExtract(salt: Uint8Array, label: string, ikm: Uint8Array): Uint8Array {
    return this.kdf.extract(salt, concatBytes(kHPKEVersion, this.suiteID, utf8(label), ikm));
  }

  /** RFC 9180 § 4: `LabeledExpand` with the KEM's own `suite_id` */
  protected labeledExpand(prk: Uint8Array, label: string, info: Uint8Array, length: number): Uint8Array {
    let labeledInfo = concatBytes(
      new Uint8Array([length >> 8 & 0xFF, length & 0xFF]),
      kHPKEVersion, this.suiteID, utf8(label), info);
    return this.kdf.expand(prk, labeledInfo, length);
  }

  /** `suite_id = "KEM" || I2OSP(kem_id, 2)` */
  protected get suiteID(): Uint8Array {
    return concatBytes(utf8("KEM"), new Uint8Array([this.id >> 8 & 0xFF, this.id & 0xFF]));
  }
}

/** DHKEM(X25519, HKDF-SHA256), RFC 9180 § 7.1. The KEM of MLS suites 1 and 3. */
export class X25519KEM extends KEM {
  readonly id = 0x0020;
  readonly secretLength = 32;
  readonly publicKeyLength = 32;
  readonly privateKeyLength = 32;
  readonly kdf = KDF.hkdfSHA256;

  static readonly instance = new X25519KEM();

  /** RFC 9180 § 7.1.3: X25519 expands the ikm, no rejection sampling. */
  deriveKeyPair(ikm: Uint8Array): KeyPair {
    let prk = this.labeledExtract(new Uint8Array(0), "dkp_prk", ikm);
    let privateKey = this.labeledExpand(prk, "sk", new Uint8Array(0), this.privateKeyLength);
    return { privateKey, publicKey: this.publicKeyFor(privateKey) };
  }

  publicKeyFor(privateKey: Uint8Array): Uint8Array {
    return x25519.getPublicKey(privateKey);
  }

  protected diffieHellman(privateKey: Uint8Array, publicKey: Uint8Array): Uint8Array {
    return x25519.getSharedSecret(privateKey, publicKey);
  }
}

/** DHKEM(P-256/P-384/P-521, HKDF-SHA*), RFC 9180 § 7.1.
 * The KEM of MLS suites 2, 5 and 7. Public keys are uncompressed points. */
export class NISTKEM extends KEM {
  readonly id: number;
  readonly secretLength: number;
  readonly publicKeyLength: number;
  readonly privateKeyLength: number;
  readonly kdf: KDF;
  protected readonly curve: typeof p256;
  /** The order of the curve, for the `DeriveKeyPair` rejection sampling */
  protected readonly order: bigint;
  /** 0xFF for P-256 and P-384, 0x01 for P-521, RFC 9180 § 7.1.3 */
  protected readonly bitmask: number;

  protected constructor(id: number, curve: typeof p256, kdf: KDF, privateKeyLength: number, bitmask: number) {
    super();
    this.id = id;
    this.curve = curve;
    this.kdf = kdf;
    this.secretLength = kdf.hashLength;
    this.privateKeyLength = privateKeyLength;
    this.publicKeyLength = 1 + 2 * privateKeyLength;
    this.bitmask = bitmask;
    this.order = curve.Point.Fn.ORDER;
  }

  static readonly p256 = new NISTKEM(0x0010, p256, KDF.hkdfSHA256, 32, 0xFF);
  static readonly p384 = new NISTKEM(0x0011, p384, KDF.hkdfSHA384, 48, 0xFF);
  static readonly p521 = new NISTKEM(0x0012, p521, KDF.hkdfSHA512, 66, 0x01);

  /** RFC 9180 § 7.1.3: rejection sampling over the curve's field. */
  deriveKeyPair(ikm: Uint8Array): KeyPair {
    let prk = this.labeledExtract(new Uint8Array(0), "dkp_prk", ikm);
    for (let counter = 0; counter <= 255; counter++) {
      let candidate = this.labeledExpand(prk, "candidate", new Uint8Array([counter]), this.privateKeyLength);
      candidate[0] &= this.bitmask;
      let scalar = bytesToNumberBE(candidate);
      if (scalar != 0n && scalar < this.order) {
        return { privateKey: candidate, publicKey: this.publicKeyFor(candidate) };
      }
    }
    throw new Error("HPKE DeriveKeyPair failed after 256 candidates");
  }

  publicKeyFor(privateKey: Uint8Array): Uint8Array {
    return this.curve.getPublicKey(privateKey, false);
  }

  /** RFC 9180 § 7.1: the DH output is the x coordinate only. */
  protected diffieHellman(privateKey: Uint8Array, publicKey: Uint8Array): Uint8Array {
    let point = this.curve.Point.fromBytes(publicKey).multiply(bytesToNumberBE(privateKey));
    return numberToBytesBE(point.toAffine().x, this.privateKeyLength);
  }
}

export interface KeyPair {
  privateKey: Uint8Array;
  publicKey: Uint8Array;
}

const kHPKEVersion = utf8("HPKE-v1");
