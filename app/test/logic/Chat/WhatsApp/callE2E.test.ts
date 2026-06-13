import { deriveCallMediaKey, encryptFrame, decryptFrame } from "../../../../logic/Meet/WhatsApp/whatsAppCallE2E";
import { randomBytes, bytesEqual } from "../../../../logic/Chat/Signal/Crypto/primitives";
import { expect, test } from "vitest";

test("call media key derivation is deterministic and key-dependent", () => {
  let callKey = randomBytes(32);
  let k1 = deriveCallMediaKey(callKey);
  let k2 = deriveCallMediaKey(callKey);
  expect(k1.length).toBe(32);
  expect(bytesEqual(k1, k2)).toBe(true);
  expect(bytesEqual(deriveCallMediaKey(randomBytes(32)), k1)).toBe(false);
});

test("media frame encrypt/decrypt round-trips", async () => {
  let key = deriveCallMediaKey(randomBytes(32));
  let frame = randomBytes(1200); // a typical media frame payload
  let encrypted = await encryptFrame(frame, key);
  expect(bytesEqual(encrypted, frame)).toBe(false); // actually encrypted
  expect(bytesEqual(await decryptFrame(encrypted, key), frame)).toBe(true);
});

test("each frame uses a fresh random IV, so equal plaintext gives distinct ciphertext", async () => {
  let key = deriveCallMediaKey(randomBytes(32));
  let frame = randomBytes(300);
  let a = await encryptFrame(frame, key);
  let b = await encryptFrame(frame, key);
  expect(bytesEqual(a, b)).toBe(false); // different random IVs, never a nonce reuse
  // both still decrypt correctly
  expect(bytesEqual(await decryptFrame(a, key), frame)).toBe(true);
  expect(bytesEqual(await decryptFrame(b, key), frame)).toBe(true);
});

test("a wrong key fails to decrypt (frame is authenticated)", async () => {
  let frame = randomBytes(300);
  let encrypted = await encryptFrame(frame, deriveCallMediaKey(randomBytes(32)));
  await expect(decryptFrame(encrypted, deriveCallMediaKey(randomBytes(32)))).rejects.toThrow();
});
