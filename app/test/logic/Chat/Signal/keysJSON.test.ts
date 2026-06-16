import {
  ecSignedPreKeyJSON, ecPreKeyJSON, kemSignedPreKeyJSON,
  serializeKyberPublicKey, base64NoPad, kKyberKeyTypeByte,
} from "../../../../logic/Chat/Signal/Connection/keysJSON";
import { KeyPair } from "../../../../logic/Chat/Signal/Crypto/KeyPair";
import { generateSignedPreKey, generatePreKeys } from "../../../../logic/Chat/Signal/Crypto/Identity";
import { KyberKeyPair } from "../../../../logic/Chat/Signal/Encryption/kyber";
import { djbDecode, djbEncode, xeddsaVerify } from "../../../../logic/Chat/Signal/Crypto/curve";
import { base64Decode } from "../../../../logic/Chat/Signal/Crypto/primitives";
import { expect, test } from "vitest";

let identity = KeyPair.generate();

test("base64NoPad has no trailing '='", () => {
  // 1 byte → 2 base64 chars + 2 pad normally; ensure stripped.
  expect(base64NoPad(new Uint8Array([0x41]))).not.toContain("=");
  expect(base64Decode(base64NoPad(new Uint8Array([1, 2, 3, 4, 5])))).toEqual(new Uint8Array([1, 2, 3, 4, 5]));
});

test("ECSignedPreKey JSON: keyId, 33-byte DJB publicKey, signature round-trip", () => {
  let signed = generateSignedPreKey(identity, 7);
  let json = ecSignedPreKeyJSON(signed);
  expect(json.keyId).toBe(7);

  let pub = base64Decode(json.publicKey);
  expect(pub.length).toBe(33);
  expect(pub[0]).toBe(0x05); // DJB type byte
  expect(djbDecode(pub)).toEqual(signed.keyPair.publicKey);

  // The signature (over djbEncode(pub)) verifies against the identity key.
  let sig = base64Decode(json.signature);
  expect(sig.length).toBe(64);
  expect(xeddsaVerify(identity.publicKey, djbEncode(signed.keyPair.publicKey), sig)).toBe(true);
});

test("ECPreKey JSON: keyId + 33-byte DJB publicKey, no signature field", () => {
  let [preKey] = generatePreKeys(99, 1);
  let json = ecPreKeyJSON(preKey);
  expect(json.keyId).toBe(99);
  expect(base64Decode(json.publicKey).length).toBe(33);
  expect((json as any).signature).toBeUndefined();
});

test("KEMSignedPreKey JSON: 1569-byte serialized Kyber key + signature over it", () => {
  let kyber = KyberKeyPair.generate();
  let json = kemSignedPreKeyJSON(3, kyber, identity);
  expect(json.keyId).toBe(3);

  let pub = base64Decode(json.publicKey);
  expect(pub.length).toBe(1569);          // 1 version byte + 1568 raw
  expect(pub[0]).toBe(kKyberKeyTypeByte); // 0x08
  expect(pub.subarray(1)).toEqual(kyber.publicKey);

  // The wire signature is over the *serialized* (1569-byte) key, not the raw one.
  let sig = base64Decode(json.signature);
  expect(sig.length).toBe(64);
  expect(xeddsaVerify(identity.publicKey, serializeKyberPublicKey(kyber.publicKey), sig)).toBe(true);
  // ... and NOT over the raw 1568-byte key (different from the PQXDH-internal sig).
  expect(xeddsaVerify(identity.publicKey, kyber.publicKey, sig)).toBe(false);
});

test("serializeKyberPublicKey prepends the 0x08 type byte", () => {
  let raw = new Uint8Array(1568).fill(7);
  let out = serializeKyberPublicKey(raw);
  expect(out.length).toBe(1569);
  expect(out[0]).toBe(0x08);
  expect(out.subarray(1)).toEqual(raw);
});
