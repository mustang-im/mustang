/** SPQR running authenticator (clean-room port of SparsePostQuantumRatchet
 * `src/authenticator.rs`). A keyed MAC whose key is ratcheted with each epoch
 * secret, binding the ML-KEM header + ciphertext to the shared auth_key and all
 * prior epoch secrets. The four ASCII labels are byte-exact. */
import { hkdfSHA256, hmacSHA256, concatBytes, bytesEqual } from "../../Crypto/primitives";

export const MAC_SIZE = 32;

let ZERO_SALT = new Uint8Array(32);
let LABEL_UPDATE = textBytes("Signal_PQCKA_V1_MLKEM768:Authenticator Update");
let LABEL_HDR = textBytes("Signal_PQCKA_V1_MLKEM768:ekheader");
let LABEL_CT = textBytes("Signal_PQCKA_V1_MLKEM768:ciphertext");

function textBytes(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}

function u64BE(n: number): Uint8Array {
  let out = new Uint8Array(8);
  let v = BigInt(n);
  for (let i = 7; i >= 0; i--) {
    out[i] = Number(v & 0xFFn);
    v >>= 8n;
  }
  return out;
}

export class Authenticator {
  rootKey: Uint8Array; // 32
  macKey: Uint8Array; // 32

  private constructor(rootKey: Uint8Array, macKey: Uint8Array) {
    this.rootKey = rootKey;
    this.macKey = macKey;
  }

  /** Start with zero keys, then fold in the auth_key at the given epoch. */
  static newAuth(authKey: Uint8Array, epoch: number): Authenticator {
    let a = new Authenticator(new Uint8Array(32), new Uint8Array(32));
    a.update(epoch, authKey);
    return a;
  }

  static fromKeys(rootKey: Uint8Array, macKey: Uint8Array): Authenticator {
    return new Authenticator(rootKey.slice(), macKey.slice());
  }

  update(epoch: number, k: Uint8Array): void {
    let ikm = concatBytes(this.rootKey, k);
    let info = concatBytes(LABEL_UPDATE, u64BE(epoch));
    let out = hkdfSHA256(ikm, ZERO_SALT, info, 64);
    this.rootKey = out.subarray(0, 32).slice();
    this.macKey = out.subarray(32, 64).slice();
  }

  macHdr(epoch: number, hdr: Uint8Array): Uint8Array {
    let data = concatBytes(LABEL_HDR, u64BE(epoch), hdr);
    return hmacSHA256(this.macKey, data).subarray(0, MAC_SIZE).slice();
  }

  verifyHdr(epoch: number, hdr: Uint8Array, expectedMac: Uint8Array): boolean {
    return bytesEqual(expectedMac, this.macHdr(epoch, hdr));
  }

  macCt(epoch: number, ct: Uint8Array): Uint8Array {
    let data = concatBytes(LABEL_CT, u64BE(epoch), ct);
    return hmacSHA256(this.macKey, data).subarray(0, MAC_SIZE).slice();
  }

  verifyCt(epoch: number, ct: Uint8Array, expectedMac: Uint8Array): boolean {
    return bytesEqual(expectedMac, this.macCt(epoch, ct));
  }

  clone(): Authenticator {
    return new Authenticator(this.rootKey.slice(), this.macKey.slice());
  }
}
