import { gfAdd, gfMul, gfInv, gfDiv } from "../../../../logic/Chat/Signal/Encryption/SPQR/gf";
import { expect, test } from "vitest";

test("GF(2^16) reduction: 2 · 0x8000 reduces by POLY to 0x100b", () => {
  // 2·0x8000 = 0x10000 (bit 16 set) → ^ POLY(0x1100b) = 0x100b
  expect(gfMul(2, 0x8000)).toBe(0x100b);
});

test("GF(2^16) satisfies the field axioms", () => {
  let vals = [1, 2, 3, 0x1234, 0x8000, 0xFFFF, 0xABCD, 0x0F0F];
  for (let a of vals) {
    expect(gfMul(a, 1)).toBe(a);          // identity
    if (a != 0) {
      expect(gfMul(a, gfInv(a))).toBe(1); // inverse
      expect(gfDiv(a, a)).toBe(1);
    }
    for (let b of vals) {
      expect(gfMul(a, b)).toBe(gfMul(b, a)); // commutative
      for (let c of vals) {
        // distributive: a·(b+c) = a·b + a·c  (+ is XOR)
        expect(gfMul(a, gfAdd(b, c))).toBe(gfAdd(gfMul(a, b), gfMul(a, c)));
      }
    }
  }
});
