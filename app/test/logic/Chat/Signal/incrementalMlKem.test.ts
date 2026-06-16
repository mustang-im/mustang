import { ml_kem768 } from "@noble/post-quantum/ml-kem.js";
import { sha3_256 } from "@noble/hashes/sha3.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex } from "@noble/curves/utils.js";
import { expect, test } from "vitest";
import {
  keygenSplit, encaps1, encaps2,
} from "../../../../logic/Chat/Signal/Encryption/SPQR/incrementalMlKem";

/**
 * Detector for the SPQR incremental ML-KEM-768 byte format.
 *
 * Signal's SPQR streams an ML-KEM-768 key+ciphertext as `pk1/pk2/ct1/ct2` via
 * libcrux's `mlkem768::incremental`. These golden vectors were dumped from
 * libcrux v0.0.8 (`incremental::KeyPairBytes::from_seed` + `encapsulate1/2`) for a
 * fixed seed (0x07×64) and message (0x09×32). This test proves that standard
 * FIPS-203 ML-KEM-768 (via @noble), sliced at the FIPS-203 boundaries, reproduces
 * libcrux's incremental output byte-for-byte — so `Encryption/SPQR/incrementalMlKem.ts`
 * must produce exactly this split (NOT a custom layout) to interoperate with Signal.
 *
 *   ek (1184) = pk2(ek[0:1152], byte-encoded t̂) ‖ ρ(ek[1152:1184])
 *   pk1 = ρ(32) ‖ SHA3-256(ek)(32)
 *   ct1 = ct[0:960] (compressed u),  ct2 = ct[960:1088] (compressed v)
 */
const GOLD = {
  pk1: "c120940662814e7adfe06997d652b4001fc612c2b7cfcaa0067c238a942857a4" +
       "cc567de1b5f32d0ca92439e50a7672c8c980a9a937e565729a9986adf11e695f",
  pk2sha256: "51a46d75101498a93d6b82473acc7b884af1344bc2aec7899eb8ac2ce649801c",
  ct1sha256: "59720cb9e41ba949af9254175928c045d5b959552437adcb8c25f579a83565a0",
  ct2: "93b91ea6416e37a6d09de4772ff562ea03dfbfa18d628b79311dce89bbbe2746" +
       "f167d722f91068235a815cc8c25ced46699ab6ce1fada02b3520e64d3f157891" +
       "3606504cf2b5586a44f1d14895f504bbeaf359dfe7e27c7ca7597b8938ecdcba" +
       "df1d0f50c3c499a8d178d6844107dce1b16c0a4c4fa8288f791459ee349b2729",
  ss: "afcf18dfd6b710a09b5cf591d0eb8229d83aa10904934a3ca60a52da5ff36b96",
};

test("@noble ML-KEM-768 split reproduces libcrux's incremental bytes (SPQR wire format)", () => {
  let ek = ml_kem768.keygen(new Uint8Array(64).fill(7)).publicKey;
  let pk1 = new Uint8Array([...ek.slice(1152, 1184), ...sha3_256(ek)]);
  expect(bytesToHex(pk1)).toBe(GOLD.pk1);
  expect(bytesToHex(sha256(ek.slice(0, 1152)))).toBe(GOLD.pk2sha256);

  let enc = ml_kem768.encapsulate(ek, new Uint8Array(32).fill(9));
  expect(bytesToHex(sha256(enc.cipherText.slice(0, 960)))).toBe(GOLD.ct1sha256);
  expect(bytesToHex(enc.cipherText.slice(960, 1088))).toBe(GOLD.ct2);
  expect(bytesToHex(enc.sharedSecret)).toBe(GOLD.ss);
});

// The incremental module itself must hit the same golden ct1/ct2/ss for the
// fixed (seed 0x07×64, m 0x09×32) — proving the header-only split is wire-exact
// with libcrux's `mlkem768::incremental`, not just @noble's one-shot.
test("incrementalMlKem module reproduces the libcrux golden ct1/ct2/ss", () => {
  let keys = keygenSplit(new Uint8Array(64).fill(7));
  expect(bytesToHex(keys.hdr)).toBe(GOLD.pk1);
  expect(bytesToHex(sha256(keys.ek))).toBe(GOLD.pk2sha256);

  let e1 = encaps1(keys.hdr, new Uint8Array(32).fill(9));
  let ct2 = encaps2(keys.ek, e1.state);
  expect(bytesToHex(sha256(e1.ct1))).toBe(GOLD.ct1sha256);
  expect(bytesToHex(ct2)).toBe(GOLD.ct2);
  expect(bytesToHex(e1.sharedSecret)).toBe(GOLD.ss);
});
