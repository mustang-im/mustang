import {
  encryptProfileName, decryptProfileName, encryptProfileAbout, encryptProfileEmoji,
  decryptProfileField, kProfileEncryptionOverhead, kNamePaddedLength1, kNamePaddedLength2,
} from "../../../../logic/Chat/Signal/Encryption/ProfileCipher";
import {
  deriveStorageKey, deriveManifestKey, deriveItemKey, storageEncrypt, storageDecrypt,
} from "../../../../logic/Chat/Signal/Encryption/StorageCipher";
import { randomBytes, bytesEqual } from "../../../../logic/Chat/Signal/Crypto/primitives";
import { expect, test } from "vitest";

test("profile name encrypts to a fixed-size bucket and round-trips", async () => {
  let key = randomBytes(32);
  let enc = await encryptProfileName(key, "Alice", "Smith");
  expect(enc.length).toBe(kNamePaddedLength1 + kProfileEncryptionOverhead); // short → 53-byte bucket
  let { givenName, familyName } = await decryptProfileName(key, enc);
  expect(givenName).toBe("Alice");
  expect(familyName).toBe("Smith");
});

test("a long profile name uses the larger bucket; given-only has empty family", async () => {
  let key = randomBytes(32);
  let longName = "x".repeat(80);
  expect((await encryptProfileName(key, longName)).length).toBe(kNamePaddedLength2 + kProfileEncryptionOverhead);
  let givenOnly = await encryptProfileName(key, "Bob");
  expect(await decryptProfileName(key, givenOnly)).toEqual({ givenName: "Bob", familyName: "" });
});

test("profile about + emoji round-trip", async () => {
  let key = randomBytes(32);
  expect(new TextDecoder().decode(await decryptProfileField(key, await encryptProfileAbout(key, "hi there 🌟")))).toBe("hi there 🌟");
  expect(new TextDecoder().decode(await decryptProfileField(key, await encryptProfileEmoji(key, "🦊")))).toBe("🦊");
});

test("storage-service key derivation shapes + record round-trip", async () => {
  let masterKey = randomBytes(32);
  let storageKey = deriveStorageKey(masterKey);
  expect(storageKey.length).toBe(32);
  expect(deriveManifestKey(storageKey, 7).length).toBe(32);
  let itemKey = deriveItemKey(storageKey, randomBytes(16));
  expect(itemKey.length).toBe(32);
  let record = randomBytes(120);
  let blob = await storageEncrypt(itemKey, record);
  expect(bytesEqual(await storageDecrypt(itemKey, blob), record)).toBe(true);
});
