/** WhatsApp media encryption/decryption (AES-256-CBC + HMAC, keyed by an
 * HKDF expansion of the 32-byte mediaKey). Media bytes travel separately from
 * the message and are end-to-end encrypted with these keys. */
import { hkdfSHA256, aesCBCEncrypt, aesCBCDecrypt, hmacSHA256, sha256, concatBytes, bytesEqual } from "./primitives";

export enum MediaType {
  Image = "image",
  Video = "video",
  Audio = "audio",
  Document = "document",
  Sticker = "sticker",
}

/** The HKDF "application info" string per media type. Stickers reuse the image keys. */
function mediaInfo(type: MediaType): string {
  switch (type) {
    case MediaType.Image: return "WhatsApp Image Keys";
    case MediaType.Sticker: return "WhatsApp Image Keys";
    case MediaType.Video: return "WhatsApp Video Keys";
    case MediaType.Audio: return "WhatsApp Audio Keys";
    case MediaType.Document: return "WhatsApp Document Keys";
  }
}

interface MediaKeys {
  iv: Uint8Array;
  cipherKey: Uint8Array;
  macKey: Uint8Array;
}

function expandMediaKey(mediaKey: Uint8Array, type: MediaType): MediaKeys {
  let expanded = hkdfSHA256(mediaKey, new Uint8Array(32), new TextEncoder().encode(mediaInfo(type)), 112);
  return {
    iv: expanded.subarray(0, 16),
    cipherKey: expanded.subarray(16, 48),
    macKey: expanded.subarray(48, 80),
    // bytes 80..112 (refKey) are unused in the CBC path
  };
}

export interface EncryptedMedia {
  /** ciphertext followed by the 10-byte MAC, as uploaded/downloaded */
  enc: Uint8Array;
  fileEncSHA256: Uint8Array;
  fileSHA256: Uint8Array;
  fileLength: number;
}

/** Encrypts media for upload. (Sending media is not wired into production yet.) */
export async function encryptMedia(plaintext: Uint8Array, mediaKey: Uint8Array, type: MediaType): Promise<EncryptedMedia> {
  let keys = expandMediaKey(mediaKey, type);
  let ciphertext = await aesCBCEncrypt(keys.cipherKey, keys.iv, plaintext);
  let mac = hmacSHA256(keys.macKey, concatBytes(keys.iv, ciphertext)).subarray(0, 10);
  let enc = concatBytes(ciphertext, mac);
  return {
    enc,
    fileEncSHA256: sha256(enc),
    fileSHA256: sha256(plaintext),
    fileLength: plaintext.length,
  };
}

/** Decrypts downloaded media: verifies the file hash and MAC, then AES-CBC. */
export async function decryptMedia(enc: Uint8Array, mediaKey: Uint8Array, type: MediaType,
    fileEncSHA256?: Uint8Array): Promise<Uint8Array> {
  if (fileEncSHA256 && !bytesEqual(sha256(enc), fileEncSHA256)) {
    throw new Error("Downloaded media hash does not match");
  }
  let keys = expandMediaKey(mediaKey, type);
  let ciphertext = enc.subarray(0, enc.length - 10);
  let mac = enc.subarray(enc.length - 10);
  let expectedMac = hmacSHA256(keys.macKey, concatBytes(keys.iv, ciphertext)).subarray(0, 10);
  if (!bytesEqual(mac, expectedMac)) {
    throw new Error("Media MAC verification failed");
  }
  return await aesCBCDecrypt(keys.cipherKey, keys.iv, ciphertext);
}
