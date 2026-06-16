/** Incremental ML-KEM-768 for SPQR, byte-exact with Signal/libcrux.
 *
 * Signal's SPQR streams an ML-KEM-768 key+ciphertext split into pk1/pk2/ct1/ct2
 * (libcrux `mlkem768::incremental`). The encapsulator must emit the real 960-byte
 * `ct1` from the 64-byte header (pk1 = ρ ‖ H(ek)) BEFORE it has received `ek`
 * (pk2). @noble's one-shot `encapsulate(ek, m)` needs the full ek, so it can't be
 * used at that point.
 *
 * The FIPS-203 IND-CPA ciphertext is ct = ByteEncode_du(Compress_du(u)) ‖
 * ByteEncode_dv(Compress_dv(v)), with u = NTT⁻¹(Âᵀ∘ŷ)+e1 and
 * v = NTT⁻¹(t̂ᵀ∘ŷ)+e2+Decompress₁(m). `u` (= ct1) depends only on ρ (in the
 * header) and the coins r = G(m‖H(ek))[32:64]; `v` (= ct2) additionally needs
 * t̂ = ByteDecode₁₂(pk2). The shared secret K = G(m‖H(ek))[0:32] is header-only
 * too. So `encaps1` emits the real ct1 + K from pk1 + m alone, and `encaps2`
 * finishes ct2 once pk2 arrives.
 *
 * The IND-CPA encrypt below is lifted verbatim from @noble/post-quantum's
 * internal K-PKE `encrypt` (node_modules/@noble/post-quantum/ml-kem.js,
 * `genKPKE().encrypt`) and `_crystals.js`, MIT-licensed (c) Paul Miller, only
 * split at the u/v boundary. This guarantees bit-identical bytes to @noble,
 * which the golden-vector test proves equals libcrux/Signal. decaps reassembles
 * ct1‖ct2 and defers to @noble's `decapsulate`. */
import { ml_kem768 } from "@noble/post-quantum/ml-kem.js";
import { sha3_256, sha3_512, shake256 } from "@noble/hashes/sha3.js";
import { swap32IfBE, u32 } from "@noble/hashes/utils.js";
import { genCrystals, XOF128 } from "@noble/post-quantum/_crystals.js";
import { splitCoder, vecCoder } from "@noble/post-quantum/utils.js";
import { concatBytes, randomBytes, bytesEqual } from "../../Crypto/primitives";

export const HEADER_SIZE = 64; // pk1 = ρ(32) ‖ H(ek)(32)
export const ENCAPSULATION_KEY_SIZE = 1152; // pk2 = ek[0:1152] (byte-encoded t̂)
export const DECAPSULATION_KEY_SIZE = 2400;
export const CIPHERTEXT1_SIZE = 960; // ByteEncode_du(Compress_du(u)), du=10, K=3
export const CIPHERTEXT2_SIZE = 128; // ByteEncode_dv(Compress_dv(v)), dv=4
export const SHARED_SECRET_SIZE = 32;
export const KEY_GENERATION_SEED_SIZE = 64;
export const MESSAGE_SIZE = 32;
export const STATE_SIZE = MESSAGE_SIZE + 32; // m(32) ‖ coins(32)

const FULL_EK_SIZE = 1184; // pk2(1152) ‖ ρ(32)

// --- @noble ML-KEM-768 IND-CPA internals (lifted; see file header) ----------
// MIT-licensed (c) Paul Miller — replicated verbatim from @noble's ml-kem.js /
// _crystals.js, since those helpers aren't exported. ML-KEM-768 params (Table 2).
const N = 256;
const Q = 3329;
const F = 3303;
const ROOT_OF_UNITY = 17;
const K = 3;
const ETA1 = 2;
const ETA2 = 2;
const DU = 10;
const DV = 4;

const crystals = genCrystals({
  N, Q, F, ROOT_OF_UNITY,
  newPoly: (n: number) => new Uint16Array(n),
  brvBits: 7,
  isKyber: true,
});

const compress = (d: number) => {
  if (d >= 12) {
    return { encode: (i: number) => i, decode: (i: number) => (i >= Q ? i - Q : i) };
  }
  let a = 2 ** (d - 1);
  return {
    encode: (i: number) => ((i << d) + Q / 2) / Q,
    decode: (i: number) => (i * Q + a) >>> d,
  };
};
const byteCoder = (d: number) => crystals.bitsCoder(d, d === 12
  ? { encode: (i: number) => i, decode: (i: number) => (i >= Q ? i - Q : i) }
  : { encode: (i: number) => i, decode: (i: number) => i });
const polyCoder = (d: number) => (d === 12 ? byteCoder(12) : crystals.bitsCoder(d, compress(d)));

function polyAdd(a: Uint16Array, b: Uint16Array): void {
  for (let i = 0; i < N; i++) {
    a[i] = crystals.mod(a[i] + b[i]);
  }
}

// Product of two degree-one polys mod (X²−ζ), then of two NTT representations.
function baseCaseMultiply(a0: number, a1: number, b0: number, b1: number, zeta: number) {
  let c0 = crystals.mod(a1 * b1 * zeta + a0 * b0);
  let c1 = crystals.mod(a0 * b1 + a1 * b0);
  return { c0, c1 };
}
function multiplyNTTs(f: Uint16Array, g: Uint16Array): Uint16Array {
  for (let i = 0; i < N / 2; i++) {
    let z = crystals.nttZetas[64 + (i >> 1)];
    if (i & 1) {
      z = -z;
    }
    let { c0, c1 } = baseCaseMultiply(f[2 * i + 0], f[2 * i + 1], g[2 * i + 0], g[2 * i + 1], z);
    f[2 * i + 0] = c0;
    f[2 * i + 1] = c1;
  }
  return f;
}

// Sample matrix poly Â from the SHAKE128 XOF reader (Algorithm 7).
function sampleNTT(xof: () => Uint8Array): Uint16Array {
  let r = new Uint16Array(N);
  for (let j = 0; j < N;) {
    let b = xof();
    if (b.length % 3) {
      throw new Error("SampleNTT: unaligned block");
    }
    for (let i = 0; j < N && i + 3 <= b.length; i += 3) {
      let d1 = ((b[i + 0] >> 0) | (b[i + 1] << 8)) & 0xfff;
      let d2 = ((b[i + 1] >> 4) | (b[i + 2] << 4)) & 0xfff;
      if (d1 < Q) {
        r[j++] = d1;
      }
      if (j < N && d2 < Q) {
        r[j++] = d2;
      }
    }
  }
  return r;
}

// Centered binomial distribution sampler (Algorithm 8) over a PRF bitstream.
const sampleCBDBytes = (buf: Uint8Array, eta: number): Uint16Array => {
  let r = new Uint16Array(N);
  let b32 = u32(buf);
  swap32IfBE(b32);
  let len = 0;
  for (let i = 0, p = 0, bb = 0, t0 = 0; i < b32.length; i++) {
    let b = b32[i];
    for (let j = 0; j < 32; j++) {
      bb += b & 1;
      b >>= 1;
      len += 1;
      if (len === eta) {
        t0 = bb;
        bb = 0;
      } else if (len === 2 * eta) {
        r[p++] = crystals.mod(t0 - bb);
        bb = 0;
        len = 0;
      }
    }
  }
  swap32IfBE(b32);
  if (len) {
    throw new Error(`sampleCBD: leftover bits: ${len}`);
  }
  return r;
};
function shakePRF(dkLen: number, key: Uint8Array, nonce: number): Uint8Array {
  return shake256.create({ dkLen }).update(key).update(new Uint8Array([nonce])).digest();
}
function sampleCBD(seed: Uint8Array, nonce: number, eta: number): Uint16Array {
  return sampleCBDBytes(shakePRF((eta * N) / 4, seed, nonce), eta);
}

let poly1 = polyCoder(1);
let polyV = polyCoder(DV);
let polyU = polyCoder(DU);
let publicCoder = splitCoder("publicKey", vecCoder(polyCoder(12), K), 32);
let uCoder = vecCoder(polyU, K); // ByteEncode_du(Compress_du(u₀..u_{K-1}))

/** ŷ = NTT(SampleCBD_η1(coins, i)), i=0..K-1 — the NTT'd `y` vector, used by
 * both ct1 (with Â) and ct2 (with t̂). Deterministic in `coins`. */
function sampleRHat(coins: Uint8Array): Uint16Array[] {
  let rHat: Uint16Array[] = [];
  for (let i = 0; i < K; i++) {
    rHat.push(crystals.NTT.encode(sampleCBD(coins, i, ETA1)));
  }
  return rHat;
}

/** ct1 = ByteEncode_du(Compress_du(u)), u = NTT⁻¹(Âᵀ∘ŷ)+e1. Needs only ρ +
 * coins (no t̂). Â is sampled from ρ; the transpose is the `x.get(i, j)` index
 * order. (Lifted from @noble's encrypt, the `u` half.) */
function computeCt1(rho: Uint8Array, rHat: Uint16Array[], coins: Uint8Array): Uint8Array {
  let x = XOF128(rho);
  let u: Uint16Array[] = [];
  for (let i = 0; i < K; i++) {
    let e1 = sampleCBD(coins, K + i, ETA2);
    let tmp = new Uint16Array(N);
    for (let j = 0; j < K; j++) {
      let aij = sampleNTT(x.get(i, j)); // Âᵀ[i][j], transpose access
      polyAdd(tmp, multiplyNTTs(aij, rHat[j])); // tmp += Âᵀ[i][j] ∘ ŷ[j]
    }
    polyAdd(e1, crystals.NTT.decode(tmp)); // e1 += NTT⁻¹(tmp)
    u.push(e1);
  }
  x.clean();
  return uCoder.encode(u);
}

/** ct2 = ByteEncode_dv(Compress_dv(v)), v = NTT⁻¹(t̂ᵀ∘ŷ)+e2+Decompress₁(m).
 * Needs t̂ (= ByteDecode₁₂ of pk2). (Lifted from @noble's encrypt, the `v`
 * half.) */
function computeCt2(tHat: Uint16Array[], rHat: Uint16Array[], coins: Uint8Array, m: Uint8Array): Uint8Array {
  let tmp2 = new Uint16Array(N);
  for (let i = 0; i < K; i++) {
    polyAdd(tmp2, multiplyNTTs(tHat[i], rHat[i])); // t2 += t̂[i] ∘ ŷ[i]
  }
  let e2 = sampleCBD(coins, 2 * K, ETA2);
  polyAdd(e2, crystals.NTT.decode(tmp2)); // e2 += NTT⁻¹(t2)
  let v = poly1.decode(m); // Decompress₁(ByteDecode₁(m))
  polyAdd(v, e2); // v += e2
  return polyV.encode(v);
}

// --- SPQR incremental API ---------------------------------------------------

export interface Keys {
  hdr: Uint8Array; // pk1, 64
  ek: Uint8Array; // pk2, 1152
  dk: Uint8Array; // decapKey, 2400
}

/** Reconstruct the standard 1184-byte ML-KEM public key from pk2 (1152) and the
 * ρ seed carried in the header. */
function fullPublicKey(ek: Uint8Array, hdr: Uint8Array): Uint8Array {
  return concatBytes(ek, hdr.subarray(0, 32));
}

/** Split keygen: pk1 = ρ ‖ SHA3-256(ek), pk2 = ek[0:1152], dk from @noble. */
export function keygenSplit(seed: Uint8Array): Keys {
  let kp = ml_kem768.keygen(seed);
  let fullEk = kp.publicKey; // 1184
  let ek = fullEk.subarray(0, ENCAPSULATION_KEY_SIZE).slice(); // pk2, 1152
  let rho = fullEk.subarray(ENCAPSULATION_KEY_SIZE, FULL_EK_SIZE); // 32
  let hdr = concatBytes(rho, sha3_256(fullEk)); // pk1, 64
  return { hdr: hdr, ek: ek, dk: kp.secretKey };
}

export function generate(): Keys {
  return keygenSplit(randomBytes(KEY_GENERATION_SEED_SIZE));
}

/** A received pk2 is consistent with the committed pk1 iff
 * SHA3-256(reconstructed full pk) equals pk1[32:64]. */
export function ekMatchesHeader(ek: Uint8Array, hdr: Uint8Array): boolean {
  if (ek.length != ENCAPSULATION_KEY_SIZE) {
    return false;
  }
  let fullEk = fullPublicKey(ek, hdr);
  return bytesEqual(sha3_256(fullEk), hdr.subarray(32, 64));
}

export interface Encaps1 {
  ct1: Uint8Array; // 960 — the real compressed u
  sharedSecret: Uint8Array; // 32 — the genuine ML-KEM shared secret K
  state: Uint8Array; // m(32) ‖ coins(32), for encaps2 — serializable
}

/** Header-only phase: derive K and r = G(m‖H(ek)), emit the real ct1 (compressed
 * u) from ρ (= pk1[0:32]) + coins ALONE, and stash m+coins for ct2. `m` is
 * sampled if omitted. */
export function encaps1(pk1: Uint8Array, m: Uint8Array = randomBytes(MESSAGE_SIZE)): Encaps1 {
  let rho = pk1.subarray(0, 32);
  let Hek = pk1.subarray(32, 64);
  let Kr = sha3_512.create().update(m).update(Hek).digest();
  let sharedSecret = Kr.subarray(0, SHARED_SECRET_SIZE).slice();
  let coins = Kr.subarray(32, 64);
  let rHat = sampleRHat(coins);
  let ct1 = computeCt1(rho, rHat, coins);
  let state = concatBytes(m, coins); // 64
  return { ct1: ct1, sharedSecret: sharedSecret, state: state };
}

/** ct2 phase: t̂ = ByteDecode₁₂(pk2); recompute ŷ from the stashed coins; emit
 * ct2 (compressed v). Needs pk2 (and never pk1). */
export function encaps2(pk2: Uint8Array, state: Uint8Array): Uint8Array {
  let m = state.subarray(0, MESSAGE_SIZE);
  let coins = state.subarray(MESSAGE_SIZE, MESSAGE_SIZE + 32);
  // publicCoder wants the full 1184-byte pk to slice off the trailing ρ; t̂ is
  // the first 1152 bytes (= pk2), so any 32-byte tail works for the decode.
  let tHat = publicCoder.decode(concatBytes(pk2, new Uint8Array(32)))[0];
  let rHat = sampleRHat(coins);
  return computeCt2(tHat, rHat, coins, m);
}

/** Recover the shared secret: reassemble ct = ct1‖ct2 (the standard 1088-byte
 * ML-KEM ciphertext) and defer to @noble's decapsulate. */
export function decaps(dk: Uint8Array, ct1: Uint8Array, ct2: Uint8Array): Uint8Array {
  return ml_kem768.decapsulate(concatBytes(ct1, ct2), dk);
}
