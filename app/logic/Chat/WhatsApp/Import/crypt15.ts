import { protobufField } from "./protobuf";
import { UserError, assert } from "../../../util/util";
import { gt } from "../../../../l10n/l10n";

/**
 * Decrypts a WhatsApp Android encrypted backup file (.crypt15),
 * e.g. `msgstore.db.crypt15` or `wa.db.crypt15`.
 *
 * File format:
 * `[1 byte: header length N] [optional 0x01 flag] [N bytes protobuf header with IV]`
 * `[AES-256-GCM ciphertext] [16 bytes GCM tag] [16 bytes MD5 checksum]`
 * The plaintext is a zlib stream containing an SQLite database.
 *
 * @param file Contents of the .crypt15 file
 * @param keyHex The 64-digit hexadecimal backup encryption key,
 *   as shown by WhatsApp when enabling end-to-end encrypted backup
 * @returns The decrypted SQLite database file contents
 */
export async function decryptCrypt15(file: Uint8Array, keyHex: string): Promise<Uint8Array> {
  assert(file?.length > 64, gt`This is not a WhatsApp backup file`);
  let key = await deriveKey(keyHex);
  let { iv, dataStart } = parseHeader(file);
  let compressed = await decrypt(file, dataStart, iv, key);
  let db = await inflate(compressed);
  assert(hasSQLiteMagic(db), gt`Decryption succeeded, but the result is not an SQLite database`);
  return db;
}

export function sanitizeKeyHex(keyHex: string): string {
  // Allow users to paste the key with spaces or dashes, as the phone displays it
  let clean = keyHex?.replace(/[\s-]/g, "") ?? "";
  if (!/^[0-9a-fA-F]{64}$/.test(clean)) {
    throw new UserError(gt`The backup key must be 64 hexadecimal characters (0-9 and a-f)`);
  }
  return clean.toLowerCase();
}

/** HKDF-SHA256 with salt = 32 zero bytes and info = "backup encryption"
 * turns the 32 bytes root key into the AES-256 key.
 * Exported for tests. */
export async function deriveKeyBits(keyHex: string): Promise<Uint8Array> {
  let rootKey = hexToBytes(sanitizeKeyHex(keyHex));
  let hkdfKey = await crypto.subtle.importKey("raw", rootKey as BufferSource, "HKDF", false, ["deriveBits"]);
  let bits = await crypto.subtle.deriveBits({
    name: "HKDF",
    hash: "SHA-256",
    salt: new Uint8Array(32),
    info: new TextEncoder().encode("backup encryption"),
  }, hkdfKey, 256);
  return new Uint8Array(bits);
}

async function deriveKey(keyHex: string): Promise<CryptoKey> {
  let bits = await deriveKeyBits(keyHex);
  return await crypto.subtle.importKey("raw", bits as BufferSource, "AES-GCM", false, ["decrypt"]);
}

/** @returns the 16 bytes AES-GCM IV from the protobuf header,
 *   and the position where the ciphertext starts */
function parseHeader(file: Uint8Array): { iv: Uint8Array, dataStart: number } {
  let headerLength = file[0];
  let pos = 1;
  // msgstore backups have a 0x01 feature flag here. A real protobuf header
  // starts with the tag 0x08 for field 1, so this is unambiguous.
  if (file[1] == 1) {
    pos = 2;
  }
  let header = file.subarray(pos, pos + headerLength);
  assert(header.length == headerLength, gt`This is not a WhatsApp backup file`);
  // BackupPrefix.c15_iv (field 3) contains C15_IV.IV (field 1)
  let c15IV = protobufField(header, 3);
  let iv = c15IV ? protobufField(c15IV, 1) : null;
  if (!iv || iv.length != 16) {
    throw new UserError(gt`This file is not a .crypt15 backup file. Older backup formats like .crypt12 and .crypt14 are not supported.`);
  }
  return { iv, dataStart: pos + headerLength };
}

async function decrypt(file: Uint8Array, dataStart: number, iv: Uint8Array, key: CryptoKey): Promise<ArrayBuffer> {
  let gcm = { name: "AES-GCM", iv: iv as BufferSource };
  try {
    // Single-file backups (msgstore.db, wa.db) end with
    // [16 bytes GCM tag][16 bytes MD5]. WebCrypto wants ciphertext + tag.
    return await crypto.subtle.decrypt(gcm, key, file.subarray(dataStart, -16) as BufferSource);
  } catch (ex) {
    try {
      // Multi-file backups (stickers, wallpapers) have no trailing MD5
      return await crypto.subtle.decrypt(gcm, key, file.subarray(dataStart) as BufferSource);
    } catch (ex2) {
      throw new UserError(gt`Could not decrypt the backup file. Please check that the key is the current 64-digit backup key for this phone.`);
    }
  }
}

async function inflate(compressed: ArrayBuffer): Promise<Uint8Array> {
  if (hasSQLiteMagic(new Uint8Array(compressed))) { // not compressed
    return new Uint8Array(compressed);
  }
  let stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream("deflate"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

function hasSQLiteMagic(data: Uint8Array): boolean {
  const magic = "SQLite format 3";
  return data.length > magic.length &&
    new TextDecoder().decode(data.subarray(0, magic.length)) == magic;
}

function hexToBytes(hex: string): Uint8Array {
  let bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}
