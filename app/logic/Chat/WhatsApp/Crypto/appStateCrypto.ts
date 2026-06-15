/** Cryptography for WhatsApp app-state sync: master-key expansion, mutation
 * value decryption, the value/index/snapshot/patch MACs, and the LTHash
 * integrity accumulator. */
import { hkdfSHA256, hmacSHA256, hmacSHA512, aesCBCDecrypt, concatBytes } from "../../Signal/Crypto/primitives";
import { bigEndian } from "../util";

const enc = (text: string) => new TextEncoder().encode(text);
/** RFC-5869 "no salt" is HashLen zero bytes; pass it explicitly (see hkdfSHA256). */
const kZeroSalt = new Uint8Array(32);

/** The five 32-byte sub-keys derived from one app-state master key. */
export interface AppStateKeys {
  index: Uint8Array;
  valueEncryption: Uint8Array;
  valueMac: Uint8Array;
  snapshotMac: Uint8Array;
  patchMac: Uint8Array;
}

/** HKDF-expands a 32-byte master key into the five mutation sub-keys. */
export function expandAppStateKeys(master: Uint8Array): AppStateKeys {
  let e = hkdfSHA256(master, kZeroSalt, enc("WhatsApp Mutation Keys"), 160);
  return {
    index: e.subarray(0, 32),
    valueEncryption: e.subarray(32, 64),
    valueMac: e.subarray(64, 96),
    snapshotMac: e.subarray(96, 128),
    patchMac: e.subarray(128, 160),
  };
}

/** The encrypted content a value MAC covers: IV + ciphertext (all but the
 * trailing 32-byte MAC) of a mutation's value blob. */
export function encContentOf(valueBlob: Uint8Array): Uint8Array {
  return valueBlob.subarray(0, valueBlob.length - 32);
}
/** The trailing 32-byte MAC of a mutation's value blob. */
export function valueMacOf(valueBlob: Uint8Array): Uint8Array {
  return valueBlob.subarray(valueBlob.length - 32);
}

/** The MAC over a mutation's encrypted value: HMAC-SHA512 (truncated to 32) of
 * the operation byte, key id, encrypted content, and the key-id length (BE u64).
 * The operation byte is the proto enum + 1 (SET→1, REMOVE→2). */
export function valueMac(operation: number, keyId: Uint8Array, encContent: Uint8Array, key: Uint8Array): Uint8Array {
  let opByte = new Uint8Array([operation + 1]);
  let keyIdLen = bigEndian(keyId.length + 1, 8);
  return hmacSHA512(key, concatBytes(opByte, keyId, encContent, keyIdLen)).subarray(0, 32);
}

/** The MAC over a mutation's index (the JSON array bytes): HMAC-SHA256, full 32. */
export function indexMac(indexBytes: Uint8Array, key: Uint8Array): Uint8Array {
  return hmacSHA256(key, indexBytes);
}

/** Decrypts a value blob `[IV(16) | AES-256-CBC | MAC(32)]` to the SyncActionData
 * protobuf bytes. The caller verifies {@link valueMac} separately, first. */
export async function decryptMutationValue(valueBlob: Uint8Array, valueEncryptionKey: Uint8Array): Promise<Uint8Array> {
  let iv = valueBlob.subarray(0, 16);
  let ciphertext = valueBlob.subarray(16, valueBlob.length - 32);
  return await aesCBCDecrypt(valueEncryptionKey, iv, ciphertext);
}

/** The LTHash homomorphic integrity accumulator. The state is a fixed-size buffer
 * of little-endian uint16 lanes; each contributing value-MAC is HKDF-expanded to
 * the state size and added (SET) or subtracted (REMOVE) lane-wise mod 2^16. Being
 * commutative, mutation order doesn't matter. */
export class LTHash {
  constructor(private readonly info: string, private readonly size = 128) {}

  /** A fresh state = `base` with the `subtract` points removed and `add` points
   * added. Does not mutate `base`. */
  subtractThenAdd(base: Uint8Array, subtract: Uint8Array[], add: Uint8Array[]): Uint8Array {
    let result = base.slice();
    for (let point of subtract) {
      this.pointwise(result, this.expand(point), false);
    }
    for (let point of add) {
      this.pointwise(result, this.expand(point), true);
    }
    return result;
  }

  private expand(point: Uint8Array): Uint8Array {
    return hkdfSHA256(point, kZeroSalt, enc(this.info), this.size);
  }

  private pointwise(base: Uint8Array, input: Uint8Array, add: boolean): void {
    let b = new DataView(base.buffer, base.byteOffset, base.byteLength);
    let i = new DataView(input.buffer, input.byteOffset, input.byteLength);
    for (let p = 0; p < base.length; p += 2) {
      let x = b.getUint16(p, true);
      let y = i.getUint16(p, true);
      b.setUint16(p, (add ? x + y : x - y) & 0xffff, true);
    }
  }
}

/** The app-state integrity hash, keyed by its info string. */
export const WAPatchIntegrity = new LTHash("WhatsApp Patch Integrity", 128);

/** The snapshot MAC: HMAC-SHA256 over `hash | version(8 BE) | name`. */
export function snapshotMac(hash: Uint8Array, version: number, name: string, key: Uint8Array): Uint8Array {
  return hmacSHA256(key, concatBytes(hash, bigEndian(version, 8), enc(name)));
}

/** The patch MAC: HMAC-SHA256 over `snapshotMac | valueMacs… | version(8 BE) | name`. */
export function patchMac(snapMac: Uint8Array, valueMacs: Uint8Array[], version: number, name: string, key: Uint8Array): Uint8Array {
  return hmacSHA256(key, concatBytes(snapMac, ...valueMacs, bigEndian(version, 8), enc(name)));
}
