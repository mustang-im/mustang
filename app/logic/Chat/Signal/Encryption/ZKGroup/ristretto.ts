/** Ristretto255 helpers that zkgroup needs but @noble doesn't expose: the SINGLE
 * Elligator2 one-way map (RFC 9496 §4.3.4 MAP, a.k.a. dalek
 * `RistrettoPoint::elligator_ristretto_flavor`) and Signal's Lizard encoding
 * (16 bytes ⇄ a Ristretto point, used to embed a UUID/ACI as a group element).
 *
 * @noble's public Ristretto hash-to-group applies Elligator twice and adds; zkgroup
 * applies it ONCE, so we implement the map ourselves over @noble's field `Fp`
 * (p = 2^255-19) and build the point via `Point.fromAffine`. Verified against the
 * curve25519-dalek-signal Lizard known-answer vectors (see ristretto.test.ts). */
import { ristretto255 } from "@noble/curves/ed25519.js";
import { bytesToNumberLE, numberToBytesLE, bytesToHex } from "@noble/curves/utils.js";
import { sha256 } from "../../Crypto/primitives";

const Point = ristretto255.Point;
const Fp = Point.Fp;

// Canonical Ristretto255 / ed25519 constants (RFC 9496 §3 / dalek). Base values
// are published constants; the rest are derived so there is nothing to mistype.
const D = Fp.create(37095705934669439343138083508754565189542113879843219016388785533085940283555n);
const SQRT_M1 = Fp.create(19681161376707505956807079304988542015446066515923890162744021073123829784752n);
const SQRT_AD_MINUS_ONE = Fp.create(25063068953384623474111414158702152701244531502492656460079210482610430750235n);
const ONE = Fp.ONE;
const MINUS_ONE = Fp.neg(ONE);
const ONE_MINUS_D_SQ = Fp.sub(ONE, Fp.sqr(D));
const D_MINUS_ONE_SQ = Fp.sqr(Fp.sub(D, ONE));
const P_MINUS_5_DIV_8 = (Fp.ORDER - 5n) / 8n;

// Lizard-decode constants (dalek `lizard/u64_constants.rs`). Derived here from the
// curve params so there is nothing to mistype — each matches dalek's published value.
const A_MINUS_D = Fp.sub(MINUS_ONE, D);                          // a − d, a = −1
const INVSQRT_A_MINUS_D = Fp.inv(Fp.sqrt(A_MINUS_D));           // 1/√(a−d)
const DP1_OVER_DM1 = Fp.mul(Fp.add(D, ONE), Fp.inv(Fp.sub(D, ONE)));        // (d+1)/(d−1)
const MDOUBLE_INVSQRT_A_MINUS_D = Fp.neg(Fp.add(INVSQRT_A_MINUS_D, INVSQRT_A_MINUS_D)); // −2/√(a−d)
const MIDOUBLE_INVSQRT_A_MINUS_D = Fp.mul(MDOUBLE_INVSQRT_A_MINUS_D, SQRT_M1);          // −2i/√(a−d)
const MINVSQRT_ONE_PLUS_D = Fp.neg(Fp.inv(Fp.sqrt(Fp.add(ONE, D))));        // −1/√(1+d)

/** True if the canonical encoding's low bit is set (RFC 9496 IS_NEGATIVE). */
function isNeg(a: bigint): boolean {
  return Fp.isOdd(a);
}

/** Non-negative absolute value (RFC 9496 CT_ABS). */
function abs(a: bigint): bigint {
  return isNeg(a) ? Fp.neg(a) : a;
}

function is0(a: bigint): boolean {
  return Fp.is0(a);
}

/** RFC 9496 SQRT_RATIO_M1(u, v): returns the non-negative r with r^2·v = ±u·{1,i},
 * and whether u/v was actually square. */
function sqrtRatioI(u: bigint, v: bigint): { wasSquare: boolean, r: bigint } {
  let v3 = Fp.mul(Fp.sqr(v), v);
  let v7 = Fp.mul(Fp.sqr(v3), v);
  let r = Fp.mul(Fp.mul(u, v3), Fp.pow(Fp.mul(u, v7), P_MINUS_5_DIV_8));
  let check = Fp.mul(v, Fp.sqr(r));
  let uNeg = Fp.neg(u);
  let correct = Fp.eql(check, u);
  let flipped = Fp.eql(check, uNeg);
  let flippedI = Fp.eql(check, Fp.mul(uNeg, SQRT_M1));
  if (flipped || flippedI) {
    r = Fp.mul(SQRT_M1, r);
  }
  return { wasSquare: correct || flipped, r: abs(r) };
}

/** The single Elligator2 map: a field element → a Ristretto point
 * (RFC 9496 §4.3.4 MAP). */
function elligator(r0: bigint): InstanceType<typeof Point> {
  let r = Fp.mul(SQRT_M1, Fp.sqr(r0));
  let Ns = Fp.mul(Fp.add(r, ONE), ONE_MINUS_D_SQ);
  let Dv = Fp.mul(Fp.sub(MINUS_ONE, Fp.mul(D, r)), Fp.add(r, D));
  let { wasSquare, r: sSquare } = sqrtRatioI(Ns, Dv);
  let s = sSquare;
  let sPrime = Fp.neg(abs(Fp.mul(s, r0)));
  let c = MINUS_ONE;
  if (!wasSquare) {
    s = sPrime;
    c = r;
  }
  let Nt = Fp.sub(Fp.mul(Fp.mul(c, Fp.sub(r, ONE)), D_MINUS_ONE_SQ), Dv);
  let s2 = Fp.sqr(s);
  // Completed point (X:Y:Z:T) → affine (X/Z, Y/T).
  let X = Fp.mul(Fp.add(s, s), Dv);
  let Z = Fp.mul(Nt, SQRT_AD_MINUS_ONE);
  let Y = Fp.sub(ONE, s2);
  let T = Fp.add(ONE, s2);
  let x = Fp.mul(X, Fp.inv(Z));
  let y = Fp.mul(Y, Fp.inv(T));
  return Point.fromAffine({ x, y });
}

/** 32 uniform bytes → a Ristretto point via a SINGLE Elligator2 call (dalek
 * `from_uniform_bytes_single_elligator`). The top bit is ignored, per the field
 * decoding. Used by zkgroup to map a profile key to a point. */
export function elligatorFromBytes(bytes: Uint8Array): InstanceType<typeof Point> {
  let n = bytesToNumberLE(bytes) & ((1n << 255n) - 1n);
  return elligator(Fp.create(n));
}

/** Lizard: embed 16 bytes of data as a Ristretto POINT (dalek `lizard_encode`,
 * SHA-256 flavour). */
export function lizardEncodeToPoint(data: Uint8Array): InstanceType<typeof Point> {
  if (data.length != 16) {
    throw new Error("Lizard encodes exactly 16 bytes");
  }
  let fe = sha256(data); // 32 bytes
  fe.set(data, 8);       // overwrite the middle 16 bytes with the data
  fe[0] &= 254;          // Elligator(r) == Elligator(-r): pick the even representative
  fe[31] &= 63;          // clear the top 2 bits → a valid field element
  return elligator(Fp.create(bytesToNumberLE(fe)));
}

/** Lizard encode, returning the 32-byte compressed Ristretto encoding. */
export function lizardEncode(data: Uint8Array): Uint8Array {
  return lizardEncodeToPoint(data).toBytes();
}

/** The compressed (32-byte) Ristretto encoding of a point built from {@link elligatorFromBytes}. */
export function elligatorPointBytes(bytes: Uint8Array): Uint8Array {
  return elligatorFromBytes(bytes).toBytes();
}

// --- Lizard DECODE (the inverse of lizardEncode) ---
// Recovers the up-to-16 bytes that were embedded as a Ristretto point. The map is
// inverted at three levels (dalek `lizard/lizard_ristretto.rs` + `jacobi_quartic.rs`):
// the Ristretto point → 4 points (s,t) on the Jacobi quartic (each with a dual) →
// each (s,t) → at most one Elligator2 preimage field element. We then re-hash each
// candidate to keep only the one consistent encoding (the 8-candidate check).

/** `1/√v` (non-negative), and whether v was a non-zero square (`FieldElement::invsqrt`). */
function invSqrt(v: bigint): { wasSquare: boolean, r: bigint } {
  return sqrtRatioI(ONE, v);
}

/** `√(i·d)` — the Elligator2 preimage of the Jacobi point (0,1), only used for that
 * corner case (`lizard_constants::SQRT_ID`). */
const SQRT_ID = sqrtRatioI(Fp.mul(SQRT_M1, D), ONE).r;

/** A point on the Jacobi quartic associated to the Edwards curve. */
interface JacobiPoint { S: bigint, T: bigint }

const ZERO = 0n;

/** Invert one Elligator2 step: the field element `r0` mapped to `(s,t)`, if any
 * (dalek `JacobiPoint::elligator_inv`). NOTE the sign of `s²` is flipped vs dalek:
 * @noble normalizes the Edwards representative, which inverts the parity of `S`
 * relative to dalek's stored representative — so the `is_negative` branch flips. */
function elligatorInv(jc: JacobiPoint): { ok: boolean, fe: bigint } {
  let out = ZERO;
  let sIsZero = is0(jc.S);
  if (Fp.eql(jc.T, ONE)) {
    out = SQRT_ID;
  }
  let a = Fp.mul(Fp.add(jc.T, ONE), DP1_OVER_DM1);
  let s2 = Fp.sqr(jc.S);
  let invSqY = Fp.mul(Fp.sub(Fp.sqr(s2), Fp.sqr(a)), SQRT_M1);
  let { wasSquare, r: y } = invSqrt(invSqY);
  let ok = sIsZero || wasSquare;
  let done = sIsZero || !wasSquare;
  let pms2 = isNeg(jc.S) ? s2 : Fp.neg(s2);
  let x = abs(Fp.mul(Fp.add(a, pms2), y));
  if (!done) {
    out = x;
  }
  return { ok, fe: out };
}

function dual(jc: JacobiPoint): JacobiPoint {
  return { S: Fp.neg(jc.S), T: Fp.neg(jc.T) };
}

/** The four Jacobi-quartic points for the four Ristretto-equivalent even Edwards
 * representatives (dalek `to_jacobi_quartic_ristretto`). Works on @noble's
 * normalized affine point (Z = 1, T = X·Y). */
function toJacobiQuarticRistretto(point: InstanceType<typeof Point>): JacobiPoint[] {
  let ep = (point as any).ep as { X: bigint, Y: bigint, Z: bigint };
  let X = ep.X, Y = ep.Y, Z = ep.Z;
  let x2 = Fp.sqr(X), y2 = Fp.sqr(Y), y4 = Fp.sqr(y2), z2 = Fp.sqr(Z);
  let zMinY = Fp.sub(Z, Y), zPlY = Fp.add(Z, Y), z2MinY2 = Fp.sub(z2, y2);
  let gamma = invSqrt(Fp.mul(Fp.mul(y4, x2), z2MinY2)).r; // 1/√(Y⁴X²(Z²−Y²))
  let den = Fp.mul(gamma, y2);
  let sOverX = Fp.mul(den, zMinY), spOverXp = Fp.mul(den, zPlY);
  let s0 = Fp.mul(sOverX, X), s1 = Fp.mul(Fp.neg(spOverXp), X);
  let tmp = Fp.mul(MDOUBLE_INVSQRT_A_MINUS_D, Z);
  let t0 = Fp.mul(tmp, sOverX), t1 = Fp.mul(tmp, spOverXp);

  let den2 = Fp.mul(Fp.mul(Fp.neg(z2MinY2), MINVSQRT_ONE_PLUS_D), gamma);
  let iz = Fp.mul(SQRT_M1, Z); // substitution (X,Y,Z) = (Y,X,iZ)
  let sOverY = Fp.mul(den2, Fp.sub(iz, X)), spOverYp = Fp.mul(den2, Fp.add(iz, X));
  let s2 = Fp.mul(sOverY, Y), s3 = Fp.mul(Fp.neg(spOverYp), Y);
  let tmp2 = Fp.mul(MDOUBLE_INVSQRT_A_MINUS_D, iz);
  let t2 = Fp.mul(tmp2, sOverY), t3 = Fp.mul(tmp2, spOverYp);

  if (is0(X) || is0(Y)) { // corner case: return (0,1),(1,·),(−1,·)
    t0 = ONE; t1 = ONE; t2 = MIDOUBLE_INVSQRT_A_MINUS_D; t3 = MIDOUBLE_INVSQRT_A_MINUS_D;
    s2 = ONE; s3 = Fp.neg(ONE);
  }
  return [{ S: s0, T: t0 }, { S: s1, T: t1 }, { S: s2, T: t2 }, { S: s3, T: t3 }];
}

/** The at-most-8 positive field elements `f` with `elligator(f) == point`, as a
 * bitmask of which slots are set (dalek `elligator_ristretto_flavor_inverse`). */
function elligatorInverse(point: InstanceType<typeof Point>): { mask: number, fes: bigint[] } {
  let jcs = toJacobiQuarticRistretto(point);
  let mask = 0;
  let fes: bigint[] = new Array(8).fill(ONE);
  for (let i = 0; i < 4; i++) {
    let a = elligatorInv(jcs[i]);
    fes[2 * i] = a.fe;
    if (a.ok) {
      mask |= 1 << (2 * i);
    }
    let b = elligatorInv(dual(jcs[i]));
    fes[2 * i + 1] = b.fe;
    if (b.ok) {
      mask |= 1 << (2 * i + 1);
    }
  }
  return { mask, fes };
}

/** All Elligator2 preimages of a point as 32-byte little-endian field encodings
 * (dalek `decode_253_bits`). `mask` bit `j` is set iff `candidates[j]` is a real
 * preimage. Used by profile-key decryption, which must additionally restore the
 * three bits the encoder cleared. */
export function decode253Bits(point: InstanceType<typeof Point>): { mask: number, candidates: Uint8Array[] } {
  let { mask, fes } = elligatorInverse(point);
  return { mask, candidates: fes.map(fe => numberToBytesLE(fe, 32)) };
}

/** Lizard: recover the 16 embedded bytes from a Ristretto point, or null if the
 * point is not a valid Lizard encoding (dalek `lizard_decode`, SHA-256 flavour).
 * For each Elligator2 preimage, re-derive the field element the encoder would have
 * produced from the candidate 16 bytes and keep it only if it matches exactly;
 * exactly one consistent candidate ⇒ that data, else null. */
export function lizardDecode(point: InstanceType<typeof Point>): Uint8Array | null {
  let { mask, fes } = elligatorInverse(point);
  let result: Uint8Array | null = null;
  let found = 0;
  for (let j = 0; j < 8; j++) {
    if (!((mask >> j) & 1)) {
      continue;
    }
    let buf = numberToBytesLE(fes[j], 32);
    let data = buf.subarray(8, 24);
    let check = sha256(data);
    check.set(data, 8);
    check[0] &= 254;
    check[31] &= 63;
    if (bytesToHex(check) == bytesToHex(buf)) {
      result = data.slice();
      found++;
    }
  }
  return found == 1 ? result : null;
}
