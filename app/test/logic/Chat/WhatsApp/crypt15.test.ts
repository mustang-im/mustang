import { decryptCrypt15, deriveKeyBits, sanitizeKeyHex } from "../../../../logic/Chat/WhatsApp/Import/crypt15";
import { createCipheriv, createHash, hkdfSync, randomBytes } from "node:crypto";
import { deflateSync } from "node:zlib";
import { expect, test } from "vitest";

// Test vector from wa-crypt-tools tests/res/encrypted_backup.key
const kRootKeyHex = "6730a595a1484d0c39c101dc0ac82ec5e401bb6f0e1b8ee2dc104a6b3687f017";
const kAESKeyHex = "17ec312152f6f84fd13a3ec6b9c9279aac60bb84405f0685d1fae27293757bc7";

test("crypt15 key derivation", async () => {
  let aesKey = await deriveKeyBits(kRootKeyHex);
  expect(Buffer.from(aesKey).toString("hex")).toBe(kAESKeyHex);
});

test("Key sanitization", () => {
  let spaced = kRootKeyHex.toUpperCase().replace(/(.{4})/g, "$1 ");
  expect(sanitizeKeyHex(spaced)).toBe(kRootKeyHex);
  expect(() => sanitizeKeyHex(kRootKeyHex.substring(2))).toThrow();
  expect(() => sanitizeKeyHex(kRootKeyHex.replace("6", "g"))).toThrow();
});

test("crypt15 decryption round-trip", async () => {
  let rootKey = randomBytes(32);
  let payload = makeFakeSQLite();
  let file = encryptCrypt15(payload, rootKey, true);

  let decrypted = await decryptCrypt15(file, rootKey.toString("hex"));
  expect(Buffer.from(decrypted).equals(payload)).toBe(true);

  // Multi-file backup variant: no trailing MD5 checksum
  let fileNoMD5 = encryptCrypt15(payload, rootKey, false);
  let decrypted2 = await decryptCrypt15(fileNoMD5, rootKey.toString("hex"));
  expect(Buffer.from(decrypted2).equals(payload)).toBe(true);

  await expect(decryptCrypt15(file, randomBytes(32).toString("hex")))
    .rejects.toThrow(/decrypt/);
});

function makeFakeSQLite(): Buffer {
  let payload = Buffer.alloc(256);
  payload.write("SQLite format 3\0", 0, "latin1");
  randomBytes(128).copy(payload, 100);
  return payload;
}

/** Independent implementation of the crypt15 format, mirroring waencrypt */
function encryptCrypt15(payload: Buffer, rootKey: Buffer, withMD5: boolean): Uint8Array {
  let aesKey = Buffer.from(hkdfSync("sha256", rootKey, Buffer.alloc(32), "backup encryption", 32));
  let iv = randomBytes(16);
  let header = Buffer.concat([
    Buffer.from([0x08, 0x01]), // field 1: key_type = HSM_CONTROLLED
    Buffer.from([0x1A, 0x12, 0x0A, 0x10]), // field 3: c15_iv { field 1: IV }
    iv,
  ]);
  let cipher = createCipheriv("aes-256-gcm", aesKey, iv);
  let ciphertext = Buffer.concat([cipher.update(deflateSync(payload, { level: 1 })), cipher.final()]);
  let file = Buffer.concat([
    Buffer.from([header.length, 0x01]), // length, msgstore feature flag
    header,
    ciphertext,
    cipher.getAuthTag(),
  ]);
  if (withMD5) {
    file = Buffer.concat([file, createHash("md5").update(file).digest()]);
  }
  return new Uint8Array(file);
}
