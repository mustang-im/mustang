import { Sho } from "../../../../logic/Chat/Signal/Encryption/ZKGroup/sho";
import { bytesToHex } from "@noble/curves/utils.js";
import { expect, test } from "vitest";

// Known-answer vectors from libsignal poksho/src/shohmacsha256.rs (test_vectors).
test("ShoHmacSha256 matches poksho test vectors", () => {
  let a = new Sho("asd");
  a.absorbAndRatchet(new TextEncoder().encode("asdasd"));
  expect(bytesToHex(a.squeezeAndRatchet(64))).toBe(
    "392cb94493 7303 7fa0c11aebed69cca3b7d3bc9790878f341729c65d5506442f04986cb5c9098f277c3ea640a4dc6e90372b433a90af9aea7072eaba3398c4fe".replace(/ /g, ""));

  let b = new Sho("asd");
  b.absorbAndRatchet(new TextEncoder().encode("asdasd"));
  expect(bytesToHex(b.squeezeAndRatchet(65)))
    .toBe("392cb944937303" + "7fa0c11aebed69cca3b7d3bc9790878f341729c65d5506442f04986cb5c9098f277c3ea640a4dc6e90372b433a90af9aea7072eaba3398c4fe7a");

  // Chained absorbs/squeezes across HMAC block boundaries.
  let c = new Sho("");
  c.absorbAndRatchet(new TextEncoder().encode("abc"));
  for (let len of [63, 64, 65, 127, 128, 129]) {
    c.absorbAndRatchet(new Uint8Array(len));
  }
  for (let len of [63, 64, 65, 127, 128, 129]) {
    c.squeezeAndRatchet(len);
  }
  c.absorbAndRatchet(new TextEncoder().encode("def"));
  expect(bytesToHex(c.squeezeAndRatchet(63))).toBe(
    "c5c13bcc6596c25fc4514eac9269dd6e3e57ef70f4bfb8d67fd3082ed9732d7790d8d2686f19eb2533a65c94bb8ceda0a068e1b615c81bb26e411889da9fb7");
});
