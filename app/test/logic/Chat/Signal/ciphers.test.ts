import { encryptProvisionEnvelope, decryptProvisionEnvelope } from "../../../../logic/Chat/Signal/Encryption/ProvisioningCipher";
import { encryptAttachment, decryptAttachment, newAttachmentKey } from "../../../../logic/Chat/Signal/Encryption/AttachmentCipher";
import { KeyPair } from "../../../../logic/Chat/Signal/Crypto/KeyPair";
import { randomBytes, bytesEqual } from "../../../../logic/Chat/Signal/Crypto/primitives";
import { expect, test } from "vitest";

test("provisioning envelope round-trips primary→secondary", async () => {
  let secondary = KeyPair.generate(); // the linking (companion) device's identity key
  let plaintext = new TextEncoder().encode("serialized ProvisionMessage bytes");
  let envelope = await encryptProvisionEnvelope(secondary.publicKey, plaintext);
  expect(envelope.publicKey.length).toBe(33); // DJB-encoded
  expect(envelope.body[0]).toBe(0x01); // version
  let decrypted = await decryptProvisionEnvelope(secondary, envelope.publicKey, envelope.body);
  expect(bytesEqual(decrypted, plaintext)).toBe(true);
});

test("provisioning decrypt rejects a tampered body (bad MAC)", async () => {
  let secondary = KeyPair.generate();
  let envelope = await encryptProvisionEnvelope(secondary.publicKey, randomBytes(40));
  envelope.body[20] ^= 0x40;
  await expect(decryptProvisionEnvelope(secondary, envelope.publicKey, envelope.body)).rejects.toThrow();
});

test("attachment round-trips and exposes digest + size", async () => {
  let key = newAttachmentKey();
  expect(key.length).toBe(64);
  let plaintext = randomBytes(5000); // spans many AES blocks
  let enc = await encryptAttachment(key, plaintext);
  expect(enc.size).toBe(5000);
  expect(enc.digest.length).toBe(32);
  let decrypted = await decryptAttachment(key, enc.data, enc.digest);
  expect(bytesEqual(decrypted, plaintext)).toBe(true);
});

test("attachment decrypt rejects a wrong digest and a tampered blob", async () => {
  let key = newAttachmentKey();
  let enc = await encryptAttachment(key, randomBytes(100));
  await expect(decryptAttachment(key, enc.data, randomBytes(32))).rejects.toThrow(); // wrong digest
  enc.data[0] ^= 0x01;
  await expect(decryptAttachment(key, enc.data)).rejects.toThrow(); // tampered, MAC fails
});
