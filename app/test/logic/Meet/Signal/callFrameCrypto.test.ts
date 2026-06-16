/** Signal group-call per-frame encryption (Docs/07 §D.4): encrypt → footer →
 * decrypt round-trips and authenticates; tampering is rejected; the ratchet
 * advances deterministically. */
import {
  deriveFrameKeys, advanceRatchet, frameCounterIv, buildFrameFooter, parseFrameFooter,
  encryptFrame, decryptFrame,
} from "../../../../logic/Meet/Signal/callFrameCrypto";
import { randomBytes, bytesEqual } from "../../../../logic/Chat/Signal/Crypto/primitives";
import { expect, test } from "vitest";

test("frame encrypt/decrypt round-trips and the payload differs from plaintext", async () => {
  let keys = deriveFrameKeys(randomBytes(32));
  let plaintext = randomBytes(120);
  let frame = await encryptFrame(plaintext, keys, 0, 1);
  // footer = 1 (ratchet) + 4 (counter) + 16 (mac) appended after the ciphertext.
  expect(frame.length).toBe(plaintext.length + 21);
  let { payload } = parseFrameFooter(frame);
  expect(bytesEqual(payload, plaintext)).toBe(false);   // it's encrypted
  let decrypted = await decryptFrame(frame, keys);
  expect(decrypted).not.toBeNull();
  expect(bytesEqual(decrypted!, plaintext)).toBe(true);
});

test("a tampered frame fails authentication", async () => {
  let keys = deriveFrameKeys(randomBytes(32));
  let frame = await encryptFrame(randomBytes(64), keys, 0, 1);
  frame[3] ^= 0xFF;                                       // flip a ciphertext byte
  expect(await decryptFrame(frame, keys)).toBeNull();
});

test("the footer encodes the ratchet and frame counters big-endian", () => {
  let footer = buildFrameFooter(7, 0x01020304, new Uint8Array(16).fill(0xAA));
  let parsed = parseFrameFooter(new Uint8Array([...new Uint8Array(10), ...footer]));
  expect(parsed.ratchetCounter).toBe(7);
  expect(parsed.frameCounter).toBe(0x01020304);
  expect(parsed.payload.length).toBe(10);
});

test("the IV puts the frame counter in the high bytes", () => {
  let iv = frameCounterIv(0x0102n);
  expect(iv.length).toBe(16);
  expect(iv[0]).toBe(0x00);
  expect(iv[6]).toBe(0x01);
  expect(iv[7]).toBe(0x02);
  expect(iv[8]).toBe(0x00);   // low bytes are zero
});

test("the ratchet is deterministic and moves the key forward", () => {
  let secret = randomBytes(32);
  let next1 = advanceRatchet(secret);
  let next2 = advanceRatchet(secret);
  expect(bytesEqual(next1, next2)).toBe(true);            // deterministic
  expect(bytesEqual(next1, secret)).toBe(false);          // moved forward
  expect(next1.length).toBe(32);
});
