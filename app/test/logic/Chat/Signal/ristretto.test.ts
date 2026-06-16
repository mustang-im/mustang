import { lizardEncode } from "../../../../logic/Chat/Signal/Encryption/ZKGroup/ristretto";
import { hexToBytes, bytesToHex } from "@noble/curves/utils.js";
import { expect, test } from "vitest";

// Known-answer vectors from curve25519-dalek-signal lizard/lizard_ristretto.rs
// (test_lizard_encode): data[16] → compressed Ristretto point.
const VECTORS: [Uint8Array, string][] = [
  [new Uint8Array(16), "f0b7e34484f74cf00f15024b738539738646bbbe1e9bc7509a676815227e774f"],
  [new Uint8Array(16).fill(1), "cc92e81f585afc5caac88660d8d17e9025a44489a363042123f6af0702156e65"],
  [Uint8Array.from({ length: 16 }, (_, i) => i), "c830573f8a8e7778671f76cdc796dc0a235cf177f197d9fcba06e84e96247444"],
];

test("Lizard encode matches the curve25519-dalek-signal known-answer vectors", () => {
  for (let [data, expected] of VECTORS) {
    expect(bytesToHex(lizardEncode(data))).toBe(expected);
  }
});
