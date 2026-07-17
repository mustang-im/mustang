import {
  generate, keygenSplit, encaps1, encaps2, decaps, ekMatchesHeader,
  HEADER_SIZE, ENCAPSULATION_KEY_SIZE, DECAPSULATION_KEY_SIZE,
  CIPHERTEXT1_SIZE, CIPHERTEXT2_SIZE, SHARED_SECRET_SIZE,
} from "../../../../logic/Chat/Signal/Encryption/SPQR/incrementalMlKem";
import { bytesEqual } from "../../../../logic/Chat/Signal/Crypto/primitives";
import { ml_kem768 } from "@noble/post-quantum/ml-kem.js";
import { concatBytes, randomBytes } from "@noble/hashes/utils.js";
import { expect, test } from "vitest";

// Mirrors incremental_mlkem768.rs:177-185 — generate, encaps1, encaps2, decaps,
// and assert ss_enc == ss_dec, plus the §4 size invariants.
test("SPQR ML-KEM: incremental round-trip yields matching shared secret", () => {
  let keys = generate();
  expect(keys.hdr.length).toBe(HEADER_SIZE);
  expect(keys.ek.length).toBe(ENCAPSULATION_KEY_SIZE);
  expect(keys.dk.length).toBe(DECAPSULATION_KEY_SIZE);

  let e1 = encaps1(keys.hdr);
  expect(e1.ct1.length).toBe(CIPHERTEXT1_SIZE);
  expect(e1.sharedSecret.length).toBe(SHARED_SECRET_SIZE);

  let ct2 = encaps2(keys.ek, e1.state);
  expect(ct2.length).toBe(CIPHERTEXT2_SIZE);

  let ssDec = decaps(keys.dk, e1.ct1, ct2);
  expect(bytesEqual(e1.sharedSecret, ssDec)).toBe(true);
});

test("SPQR ML-KEM: ekMatchesHeader accepts the matching ek, rejects a tampered one", () => {
  let keys = generate();
  expect(ekMatchesHeader(keys.ek, keys.hdr)).toBe(true);
  let tampered = keys.ek.slice();
  tampered[0] ^= 0xFF;
  expect(ekMatchesHeader(tampered, keys.hdr)).toBe(false);
});

test("SPQR ML-KEM: distinct keypairs yield distinct shared secrets", () => {
  let k1 = generate();
  let k2 = generate();
  let e1 = encaps1(k1.hdr);
  let e2 = encaps1(k2.hdr);
  expect(bytesEqual(e1.sharedSecret, e2.sharedSecret)).toBe(false);
});

test("SPQR ML-KEM: 50 independent round-trips all agree", () => {
  for (let i = 0; i < 50; i++) {
    let keys = generate();
    let e1 = encaps1(keys.hdr);
    let ct2 = encaps2(keys.ek, e1.state);
    expect(bytesEqual(e1.sharedSecret, decaps(keys.dk, e1.ct1, ct2))).toBe(true);
  }
});

// Byte-exactness with FIPS-203/libcrux/Signal, with @noble's one-shot
// encapsulate(ek, m) as the oracle: concat(ct1, ct2) === cipherText, the shared
// secret matches, and decaps recovers it.
test("SPQR ML-KEM: split is byte-identical to @noble's one-shot encapsulate (100 random)", () => {
  for (let i = 0; i < 100; i++) {
    let seed = randomBytes(64);
    let m = randomBytes(32);
    let keys = keygenSplit(seed);
    let ek = concatBytes(keys.ek, keys.hdr.subarray(0, 32)); // pk2 ‖ ρ = full ek

    let oracle = ml_kem768.encapsulate(ek, m);
    let e1 = encaps1(keys.hdr, m);
    let ct2 = encaps2(keys.ek, e1.state);

    expect(bytesEqual(concatBytes(e1.ct1, ct2), oracle.cipherText)).toBe(true);
    expect(bytesEqual(e1.sharedSecret, oracle.sharedSecret)).toBe(true);
    expect(bytesEqual(decaps(keys.dk, e1.ct1, ct2), oracle.sharedSecret)).toBe(true);
  }
});

// encaps1 is header-only: it must produce the real ct1 + shared secret from just
// the 64-byte pk1, never touching pk2.
test("SPQR ML-KEM: encaps1 needs only the 64-byte header (not pk2)", () => {
  let keys = generate();
  let m = randomBytes(32);
  let hdrOnly = keys.hdr.slice(); // a standalone 64-byte buffer; no ek in scope
  let e1 = encaps1(hdrOnly, m);
  expect(e1.ct1.length).toBe(CIPHERTEXT1_SIZE);
  expect(e1.sharedSecret.length).toBe(SHARED_SECRET_SIZE);
  // And it agrees with the full split / decaps once pk2 arrives.
  let ct2 = encaps2(keys.ek, e1.state);
  expect(bytesEqual(decaps(keys.dk, e1.ct1, ct2), e1.sharedSecret)).toBe(true);
});
