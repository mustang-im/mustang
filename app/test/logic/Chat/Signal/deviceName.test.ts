import { encryptDeviceName, DeviceName } from "../../../../logic/Chat/Signal/Encryption/DeviceNameCipher";
import { KeyPair } from "../../../../logic/Chat/Signal/Crypto/KeyPair";
import { sharedSecret, djbDecode } from "../../../../logic/Chat/Signal/Crypto/curve";
import { hmacSHA256 } from "../../../../logic/Chat/Signal/Crypto/primitives";
import { decode } from "../../../../logic/Chat/Signal/Proto/codec";
import { ctr } from "@noble/ciphers/aes.js";
import { expect, test } from "vitest";

let enc = new TextEncoder();
let dec = new TextDecoder();

test("encryptDeviceName produces a DeviceName proto that decrypts back to plaintext", () => {
  let identity = KeyPair.generate();
  let name = "Mustang on Linux";

  let serialized = encryptDeviceName(name, identity);
  let proto = decode(DeviceName, serialized);

  // Shapes: 33-byte DJB ephemeral key, 16-byte synthetic IV, non-empty ciphertext.
  expect(proto.ephemeralPublic!.length).toBe(33);
  expect(proto.ephemeralPublic![0]).toBe(0x05);
  expect(proto.syntheticIv!.length).toBe(16);
  expect(proto.ciphertext!.length).toBe(enc.encode(name).length);

  // Decrypt the way the primary phone does (Docs/02 §B.5).
  let masterSecret = sharedSecret(identity.privateKey, djbDecode(proto.ephemeralPublic!));
  let cipherKey = hmacSHA256(hmacSHA256(masterSecret, enc.encode("cipher")), proto.syntheticIv!);
  let plaintext = ctr(cipherKey, new Uint8Array(16)).decrypt(proto.ciphertext!);
  expect(dec.decode(plaintext)).toBe(name);

  // The synthetic IV is the keyed hash of the plaintext (integrity check).
  let expectedIv = hmacSHA256(hmacSHA256(masterSecret, enc.encode("auth")), plaintext).subarray(0, 16);
  expect(proto.syntheticIv!).toEqual(expectedIv);
});

test("encryptDeviceName uses a fresh ephemeral key each call", () => {
  let identity = KeyPair.generate();
  let a = decode(DeviceName, encryptDeviceName("x", identity));
  let b = decode(DeviceName, encryptDeviceName("x", identity));
  expect(a.ephemeralPublic).not.toEqual(b.ephemeralPublic);
});
