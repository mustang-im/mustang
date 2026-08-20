/** Hybrid Public Key Encryption, RFC 9180, base mode only.
 *
 * MLS encrypts each HPKE ciphertext under a fresh context and never sends a
 * second message under the same one, so only the single-shot `SealBase` /
 * `OpenBase` of RFC 9180 § 6.1 are implemented, with the sequence number
 * fixed at 0. That also means the nonce is the base nonce unchanged. */
import type { AEAD } from "./AEAD";
import type { KDF } from "./KDF";
import type { KEM } from "./KEM";
import { utf8 } from "../util";
import { concatBytes } from "../../Signal/Crypto/primitives";

export class HPKE {
  readonly kem: KEM;
  readonly kdf: KDF;
  readonly aead: AEAD;
  /** `suite_id = "HPKE" || I2OSP(kem_id, 2) || I2OSP(kdf_id, 2) || I2OSP(aead_id, 2)` */
  protected readonly suiteID: Uint8Array;

  constructor(kem: KEM, kdf: KDF, aead: AEAD) {
    this.kem = kem;
    this.kdf = kdf;
    this.aead = aead;
    this.suiteID = concatBytes(utf8("HPKE"), uint16(kem.id), uint16(kdf.id), uint16(aead.id));
  }

  /** RFC 9180 § 6.1 `SealBase` */
  seal(recipientPublicKey: Uint8Array, info: Uint8Array, aad: Uint8Array, plaintext: Uint8Array): HPKECiphertext {
    let { sharedSecret, enc } = this.kem.encapsulate(recipientPublicKey);
    let context = this.keySchedule(sharedSecret, info);
    return {
      kemOutput: enc,
      ciphertext: this.aead.seal(context.key, context.baseNonce, aad, plaintext),
    };
  }

  /** RFC 9180 § 6.1 `OpenBase`
   * @throws if the ciphertext does not authenticate */
  open(recipientPrivateKey: Uint8Array, sealed: HPKECiphertext, info: Uint8Array, aad: Uint8Array): Uint8Array {
    let sharedSecret = this.kem.decapsulate(sealed.kemOutput, recipientPrivateKey);
    let context = this.keySchedule(sharedSecret, info);
    return this.aead.open(context.key, context.baseNonce, aad, sealed.ciphertext);
  }

  /** RFC 9180 § 5.1 `KeySchedule` for `mode_base`, without the exporter secret,
   * which MLS does not use. */
  protected keySchedule(sharedSecret: Uint8Array, info: Uint8Array): { key: Uint8Array, baseNonce: Uint8Array } {
    let empty = new Uint8Array(0);
    let pskIDHash = this.labeledExtract(empty, "psk_id_hash", empty);
    let infoHash = this.labeledExtract(empty, "info_hash", info);
    let scheduleContext = concatBytes(new Uint8Array([kModeBase]), pskIDHash, infoHash);
    let secret = this.labeledExtract(sharedSecret, "secret", empty);
    return {
      key: this.labeledExpand(secret, "key", scheduleContext, this.aead.keyLength),
      baseNonce: this.labeledExpand(secret, "base_nonce", scheduleContext, this.aead.nonceLength),
    };
  }

  /** RFC 9180 § 4 `LabeledExtract` */
  protected labeledExtract(salt: Uint8Array, label: string, ikm: Uint8Array): Uint8Array {
    return this.kdf.extract(salt, concatBytes(kHPKEVersion, this.suiteID, utf8(label), ikm));
  }

  /** RFC 9180 § 4 `LabeledExpand` */
  protected labeledExpand(prk: Uint8Array, label: string, info: Uint8Array, length: number): Uint8Array {
    return this.kdf.expand(prk, concatBytes(uint16(length), kHPKEVersion, this.suiteID, utf8(label), info), length);
  }
}

/** RFC 9420 § 6.3.1: what MLS puts on the wire for one HPKE encryption. */
export interface HPKECiphertext {
  kemOutput: Uint8Array;
  ciphertext: Uint8Array;
}

const kHPKEVersion = utf8("HPKE-v1");
/** RFC 9180 § 5.1, Table 1 */
const kModeBase = 0x00;

function uint16(value: number): Uint8Array {
  return new Uint8Array([value >> 8 & 0xFF, value & 0xFF]);
}
