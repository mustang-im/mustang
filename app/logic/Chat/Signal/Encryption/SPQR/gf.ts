/** GF(2¹⁶) arithmetic for SPQR's Reed-Solomon erasure code. Elements are 16-bit
 * values; the reduction polynomial is 0x1100b. Addition/subtraction is XOR;
 * multiplication is a carry-less multiply reduced mod POLY; the inverse is
 * Fermat's a^(2¹⁶−2). Clean-room port of SparsePostQuantumRatchet
 * `src/encoding/gf.rs` (the portable `unaccelerated` path). */
const POLY = 0x1100b;

export function gfAdd(a: number, b: number): number {
  return (a ^ b) & 0xFFFF;
}

/** Carry-less (polynomial) multiply of two 16-bit values → up to 31 bits. */
function polyMul(a: number, b: number): number {
  let acc = 0;
  for (let shift = 0; shift < 16; shift++) {
    if (b & (1 << shift)) {
      acc ^= a << shift;
    }
  }
  return acc >>> 0;
}

/** Reduce a <31-bit carry-less product mod POLY → a field element (16 bits). */
function polyReduce(v: number): number {
  for (let bit = 30; bit >= 16; bit--) {
    if (v & (1 << bit)) {
      v ^= POLY << (bit - 16);
    }
  }
  return v & 0xFFFF;
}

export function gfMul(a: number, b: number): number {
  return polyReduce(polyMul(a & 0xFFFF, b & 0xFFFF));
}

export function gfPow(a: number, exponent: number): number {
  let result = 1;
  let base = a & 0xFFFF;
  let e = exponent;
  while (e > 0) {
    if (e & 1) {
      result = gfMul(result, base);
    }
    base = gfMul(base, base);
    e >>>= 1;
  }
  return result;
}

/** Multiplicative inverse: a^(2¹⁶−2). (gfInv(0) is 0, as in the reference.) */
export function gfInv(a: number): number {
  return gfPow(a, 0xFFFE);
}

export function gfDiv(a: number, b: number): number {
  return gfMul(a, gfInv(b));
}
