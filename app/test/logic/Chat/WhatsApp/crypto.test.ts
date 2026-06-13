import {
  sha256, hmacSHA256, hkdfSHA256, aesGCMEncrypt, aesGCMDecrypt,
  aesCBCEncrypt, aesCBCDecrypt, randomBytes, concatBytes, bytesEqual,
} from "../../../../logic/Chat/Signal/Crypto/primitives";
import { KeyPair } from "../../../../logic/Chat/Signal/Crypto/KeyPair";
import {
  sharedSecret, djbEncode, djbDecode, xeddsaSign, xeddsaVerify,
} from "../../../../logic/Chat/Signal/Crypto/curve";
import { ed25519 } from "@noble/curves/ed25519.js";
import { bytesToNumberLE, numberToBytesLE } from "@noble/curves/utils.js";
import { expect, test } from "vitest";

function hex(s: string): Uint8Array {
  return Uint8Array.from(Buffer.from(s, "hex"));
}

test("HKDF-SHA256 matches RFC 5869 test case 1", () => {
  // RFC 5869 Appendix A.1
  let ikm = hex("0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b");
  let salt = hex("000102030405060708090a0b0c");
  let info = hex("f0f1f2f3f4f5f6f7f8f9");
  let okm = hkdfSHA256(ikm, salt, info, 42);
  expect(Buffer.from(okm).toString("hex")).toBe(
    "3cb25f25faacd57a90434f64d0362f2a2d2d0a90cf1a5a4c5db02d56ecc4c5bf34007208d5b887185865");
});

test("HMAC-SHA256 matches RFC 4231 test case 1", () => {
  let key = hex("0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b");
  let mac = hmacSHA256(key, new TextEncoder().encode("Hi There"));
  expect(Buffer.from(mac).toString("hex")).toBe(
    "b0344c61d8db38535ca8afceaf0bf12b881dc200c9833da726e9376c2e32cff7");
});

test("SHA-256 known vector", () => {
  expect(Buffer.from(sha256(new TextEncoder().encode("abc"))).toString("hex")).toBe(
    "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
});

test("X25519 Diffie-Hellman agrees", () => {
  let alice = KeyPair.generate();
  let bob = KeyPair.generate();
  expect(bytesEqual(sharedSecret(alice.privateKey, bob.publicKey),
    sharedSecret(bob.privateKey, alice.publicKey))).toBe(true);
  expect(alice.publicKey.length).toBe(32);
});

test("DJB encode/decode", () => {
  let key = randomBytes(32);
  let encoded = djbEncode(key);
  expect(encoded.length).toBe(33);
  expect(encoded[0]).toBe(0x05);
  expect(bytesEqual(djbDecode(encoded), key)).toBe(true);
  expect(bytesEqual(djbDecode(key), key)).toBe(true); // no-op on 32-byte input
});

test("AES-256-GCM round-trip with AAD", async () => {
  let key = randomBytes(32);
  let iv = randomBytes(12);
  let aad = randomBytes(20);
  let plaintext = new TextEncoder().encode("the quick brown fox");
  let ct = await aesGCMEncrypt(key, iv, plaintext, aad);
  let pt = await aesGCMDecrypt(key, iv, ct, aad);
  expect(new TextDecoder().decode(pt)).toBe("the quick brown fox");
  // Wrong AAD must fail authentication
  await expect(aesGCMDecrypt(key, iv, ct, randomBytes(20))).rejects.toThrow();
});

test("AES-256-CBC round-trip (PKCS7)", async () => {
  let key = randomBytes(32);
  let iv = randomBytes(16);
  let plaintext = randomBytes(100);
  let ct = await aesCBCEncrypt(key, iv, plaintext);
  let pt = await aesCBCDecrypt(key, iv, ct);
  expect(bytesEqual(pt, plaintext)).toBe(true);
});

test("XEdDSA sign and verify (self-consistent)", () => {
  let kp = KeyPair.generate();
  let msg = new TextEncoder().encode("sign me");
  let sig = xeddsaSign(kp.privateKey, msg, randomBytes(64));
  expect(sig.length).toBe(64);
  expect(xeddsaVerify(kp.publicKey, msg, sig)).toBe(true);
  // 0x05-prefixed public key is tolerated
  expect(xeddsaVerify(djbEncode(kp.publicKey), msg, sig)).toBe(true);
  // Tampered message fails
  expect(xeddsaVerify(kp.publicKey, new TextEncoder().encode("other"), sig)).toBe(false);
  // Tampered signature fails
  let bad = sig.slice();
  bad[10] ^= 1;
  expect(xeddsaVerify(kp.publicKey, msg, bad)).toBe(false);
});

test("XEdDSA signatures verify under independent Ed25519 verifier", () => {
  // An XEdDSA signature is a valid Ed25519 signature over the sign-normalized
  // Edwards public key. Cross-check against @noble's Ed25519 verify.
  let kp = KeyPair.generate();
  let msg = randomBytes(64);
  let sig = xeddsaSign(kp.privateKey, msg, randomBytes(64));
  // Derive the Edwards public key the same way (Montgomery u -> Edwards y, sign 0)
  let Point = ed25519.Point;
  let p = Point.Fp.ORDER;
  let u = bytesToNumberLE(kp.publicKey) % p;
  let inv = modInv(u + 1n, p);
  let y = ((u - 1n) * inv % p + p) % p;
  let Aenc = numberToBytesLE(y, 32);
  Aenc[31] &= 0x7F;
  expect(ed25519.verify(sig, msg, Aenc)).toBe(true);
});

function modInv(a: bigint, m: bigint): bigint {
  let [r0, r1, s0, s1] = [((a % m) + m) % m, m, 1n, 0n];
  while (r1 != 0n) {
    let qt = r0 / r1;
    [r0, r1] = [r1, r0 - qt * r1];
    [s0, s1] = [s1, s0 - qt * s1];
  }
  return ((s0 % m) + m) % m;
}

test("concatBytes / bytesEqual", () => {
  expect(bytesEqual(concatBytes(hex("0102"), hex("0304")), hex("01020304"))).toBe(true);
  expect(bytesEqual(hex("01"), hex("02"))).toBe(false);
});
