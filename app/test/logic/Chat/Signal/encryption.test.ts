import { message, fixed64, fixed32, string, int, repeated, encode, decode, type TypeOf } from "../../../../logic/Chat/Signal/Proto/codec";
import { aesGcmSivEncrypt, aesGcmSivDecrypt } from "../../../../logic/Chat/Signal/Encryption/aesGcmSiv";
import { KyberKeyPair, kyberEncapsulate } from "../../../../logic/Chat/Signal/Encryption/kyber";
import { bytesEqual } from "../../../../logic/Chat/Signal/Crypto/primitives";
import { hexToBytes, bytesToHex } from "@noble/curves/utils.js";
import { expect, test } from "vitest";

// --- Proto DSL: the new fixed64 / fixed32 wire types ---

const Pointer = message({
  cdnId: fixed64(1),
  cdnNumber: fixed32(2),
  name: string(3),
  sizes: repeated(int(4)),
});
type Pointer = TypeOf<typeof Pointer>;

test("codec round-trips fixed64 (bigint) and fixed32 alongside varint/string", () => {
  let obj: Pointer = { cdnId: 0x0102030405060708n, cdnNumber: 3, name: "photo.jpg", sizes: [1, 200, 65000] };
  let back = decode(Pointer, encode(Pointer, obj));
  expect(back.cdnId).toBe(0x0102030405060708n);
  expect(back.cdnNumber).toBe(3);
  expect(back.name).toBe("photo.jpg");
  expect(back.sizes).toEqual([1, 200, 65000]);
});

test("fixed64 preserves values above 2^53", () => {
  let obj: Pointer = { cdnId: 0xFFFFFFFFFFFFFFFFn };
  let back = decode(Pointer, encode(Pointer, obj));
  expect(back.cdnId).toBe(0xFFFFFFFFFFFFFFFFn);
});

// --- AES-GCM-SIV (RFC 8452 Appendix C.2 known-answer vectors) ---

test("AES-256-GCM-SIV matches RFC 8452 test vectors", () => {
  let key = hexToBytes("0100000000000000000000000000000000000000000000000000000000000000");
  let nonce = hexToBytes("030000000000000000000000");
  // empty plaintext -> tag only
  expect(bytesToHex(aesGcmSivEncrypt(key, nonce, new Uint8Array(0))))
    .toBe("07f5f4169bbf55a8400cd47ea6fd400f");
  // 8-byte plaintext
  let ct = aesGcmSivEncrypt(key, nonce, hexToBytes("0100000000000000"));
  expect(bytesToHex(ct)).toBe("c2ef328e5c71c83b843122130f7364b761e0b97427e3df28");
  expect(bytesToHex(aesGcmSivDecrypt(key, nonce, ct))).toBe("0100000000000000");
});

test("AES-GCM-SIV rejects a tampered ciphertext", () => {
  let key = new Uint8Array(32).fill(9);
  let nonce = new Uint8Array(12).fill(1);
  let ct = aesGcmSivEncrypt(key, nonce, new TextEncoder().encode("hello signal"));
  ct[0] ^= 0x80;
  expect(() => aesGcmSivDecrypt(key, nonce, ct)).toThrow();
});

// --- ML-KEM-1024 (PQXDH KEM) ---

test("ML-KEM-1024 encapsulate/decapsulate agree on the shared secret", () => {
  let bob = KyberKeyPair.generate();
  expect(bob.publicKey.length).toBe(1568);
  let { cipherText, sharedSecret } = kyberEncapsulate(bob.publicKey);
  expect(cipherText.length).toBe(1568);
  expect(sharedSecret.length).toBe(32);
  expect(bytesEqual(bob.decapsulate(cipherText), sharedSecret)).toBe(true);
});

test("KyberKeyPair is deterministic from its 64-byte seed (so we can persist just the seed)", () => {
  let a = KyberKeyPair.generate();
  let b = KyberKeyPair.fromSeed(a.seed);
  expect(bytesToHex(b.publicKey)).toBe(bytesToHex(a.publicKey));
  let { cipherText, sharedSecret } = kyberEncapsulate(a.publicKey);
  expect(bytesEqual(b.decapsulate(cipherText), sharedSecret)).toBe(true);
});
