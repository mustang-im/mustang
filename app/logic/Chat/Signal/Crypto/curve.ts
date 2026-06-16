/** Curve25519 operations as WhatsApp/Signal use them:
 *  - X25519 Diffie-Hellman for key agreement.
 *  - XEdDSA signatures (Ed25519 signatures produced from a Montgomery/X25519
 *    private key), used for the signed prekey and the ADV device identity.
 *
 * Public keys are 32 raw bytes. In most Signal wire structures they are
 * serialized in the "DJB" form `0x05 || pubkey` (33 bytes) — see djbEncode().
 *
 * The XEdDSA implementation follows the Signal XEdDSA specification and is
 * built on @noble's Ed25519 point arithmetic. It is independent of libsignal. */
import { sha512, randomBytes } from "./primitives";
import { x25519, ed25519 } from "@noble/curves/ed25519.js";
import { bytesToNumberLE, numberToBytesLE } from "@noble/curves/utils.js";

export const kDjbType = 0x05;

/** X25519 ECDH. @returns the 32-byte shared secret. */
export function sharedSecret(privateKey: Uint8Array, publicKey: Uint8Array): Uint8Array {
  return x25519.getSharedSecret(privateKey, publicKey);
}

/** Prepends the 0x05 type byte: the 33-byte form used in Signal wire structures. */
export function djbEncode(publicKey: Uint8Array): Uint8Array {
  let out = new Uint8Array(33);
  out[0] = kDjbType;
  out.set(publicKey, 1);
  return out;
}

/** Strips a leading 0x05 type byte, if present. */
export function djbDecode(publicKey: Uint8Array): Uint8Array {
  return publicKey.length == 33 ? publicKey.subarray(1) : publicKey;
}

let Point = ed25519.Point;
let p = Point.Fp.ORDER; // field modulus 2^255 - 19
let q = Point.Fn.ORDER; // group order

function mod(a: bigint, m: bigint): bigint {
  return ((a % m) + m) % m;
}

/** The clamped X25519 private scalar, as a number (mod the group order). */
function clampedScalar(privateKey: Uint8Array): bigint {
  let e = privateKey.slice(0, 32);
  e[0] &= 248;
  e[31] &= 127;
  e[31] |= 64;
  return mod(bytesToNumberLE(e), q);
}

/** hash_i(X) = SHA-512( (2^256 - 1 - i) || X ), for i = 1, per XEdDSA. */
function hash1(data: Uint8Array): Uint8Array {
  let prefix = new Uint8Array(32).fill(0xFF);
  prefix[0] = 0xFE; // little-endian (2^256 - 2)
  let input = new Uint8Array(prefix.length + data.length);
  input.set(prefix);
  input.set(data, prefix.length);
  return sha512(input);
}

/** XEdDSA signature (64 bytes) over `message`, using an X25519 private key.
 *
 * Follows the Signal/curve25519-dalek convention: the Edwards public key A is
 * `a·B` (with its natural sign bit), and **A's sign bit is carried in bit 255 of
 * s** (always 0 for a genuine scalar, so it's free to reuse). The hash binds the
 * full `A` encoding including that sign bit. */
export function xeddsaSign(privateKey: Uint8Array, message: Uint8Array, random?: Uint8Array): Uint8Array {
  let Z = random ?? randomBytes(64);
  let a = clampedScalar(privateKey);
  let A = Point.BASE.multiply(a);
  let Aenc = A.toBytes();
  let signBit = Aenc[31] & 0x80; // A's sign bit, carried in s below
  let aBytes = numberToBytesLE(a, 32);
  let r = mod(bytesToNumberLE(hash1(concat(aBytes, message, Z))), q);
  let R = Point.BASE.multiply(r);
  let Renc = R.toBytes();
  let h = mod(bytesToNumberLE(sha512(concat(Renc, Aenc, message))), q);
  let s = mod(r + h * a, q);
  let sBytes = numberToBytesLE(s, 32);
  sBytes[31] |= signBit;
  return concat(Renc, sBytes);
}

/** Verifies an XEdDSA signature against an X25519 public key (the Montgomery
 * u-coordinate). @param publicKey 32 bytes (a leading 0x05 is tolerated). */
export function xeddsaVerify(publicKey: Uint8Array, message: Uint8Array, signature: Uint8Array): boolean {
  try {
    let u = mod(bytesToNumberLE(djbDecode(publicKey)), p);
    // Montgomery u -> Edwards y: y = (u - 1) / (u + 1)
    let y = mod((u - 1n) * modInverse(u + 1n, p), p);
    let Aenc = numberToBytesLE(y, 32);
    let Renc = signature.subarray(0, 32);
    let sBytes = signature.slice(32, 64);
    let signBit = sBytes[31] & 0x80; // A's sign bit travels in bit 255 of s
    sBytes[31] &= 0x7F;
    let s = bytesToNumberLE(sBytes);
    if (s >= q) {
      return false;
    }
    Aenc[31] = (Aenc[31] & 0x7F) | signBit;
    let A = Point.fromBytes(Aenc);
    let h = mod(bytesToNumberLE(sha512(concat(Renc, Aenc, message))), q);
    // Check R == sB - hA
    let check = Point.BASE.multiplyUnsafe(s).subtract(A.multiplyUnsafe(h));
    return bytesEqualLocal(check.toBytes(), Renc);
  } catch (ex) {
    return false;
  }
}

function modInverse(a: bigint, m: bigint): bigint {
  let [old_r, r] = [mod(a, m), m];
  let [old_s, s] = [1n, 0n];
  while (r != 0n) {
    let quotient = old_r / r;
    [old_r, r] = [r, old_r - quotient * r];
    [old_s, s] = [s, old_s - quotient * s];
  }
  return mod(old_s, m);
}

function concat(...arrays: Uint8Array[]): Uint8Array {
  let total = arrays.reduce((sum, a) => sum + a.length, 0);
  let out = new Uint8Array(total);
  let offset = 0;
  for (let a of arrays) {
    out.set(a, offset);
    offset += a.length;
  }
  return out;
}

function bytesEqualLocal(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length != b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i] != b[i]) {
      return false;
    }
  }
  return true;
}
