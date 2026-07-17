/** Attachment (file transfer) encryption, as Signal uploads/downloads CDN blobs.
 *
 * A random 64-byte key splits into a 32-byte AES-CBC key and a 32-byte HMAC key.
 *   blob   = iv(16) ‖ AES-256-CBC-PKCS7(aesKey, iv, plaintext) ‖ HMAC-SHA256(macKey, iv‖ct)
 *   digest = SHA-256(blob)
 * The `key` (64 bytes) and `digest` (32 bytes) travel in the AttachmentPointer;
 * the receiver verifies the digest and the trailing MAC before decrypting. */
import { sha256, hmacSHA256, aesCBCEncrypt, aesCBCDecrypt, randomBytes, concatBytes, bytesEqual } from "../Crypto/primitives";

export interface EncryptedAttachment {
  /** The blob to upload to the CDN (iv ‖ ciphertext ‖ mac). */
  data: Uint8Array;
  /** SHA-256 over the whole blob; goes in AttachmentPointer.digest. */
  digest: Uint8Array;
  /** Plaintext length; goes in AttachmentPointer.size. */
  size: number;
}

/** @param keyMaterial 64 bytes (AttachmentPointer.key); generate with {@link newAttachmentKey}. */
export async function encryptAttachment(keyMaterial: Uint8Array, plaintext: Uint8Array): Promise<EncryptedAttachment> {
  let aesKey = keyMaterial.subarray(0, 32);
  let macKey = keyMaterial.subarray(32, 64);
  let iv = randomBytes(16);
  let ivAndCipher = concatBytes(iv, await aesCBCEncrypt(aesKey, iv, plaintext));
  let data = concatBytes(ivAndCipher, hmacSHA256(macKey, ivAndCipher));
  return { data, digest: sha256(data), size: plaintext.length };
}

/** @param data the downloaded CDN blob. @param digest AttachmentPointer.digest, if known.
 * @throws on a digest or MAC mismatch. */
export async function decryptAttachment(keyMaterial: Uint8Array, data: Uint8Array, digest?: Uint8Array): Promise<Uint8Array> {
  let aesKey = keyMaterial.subarray(0, 32);
  let macKey = keyMaterial.subarray(32, 64);
  if (digest && !bytesEqual(sha256(data), digest)) {
    throw new Error("Attachment digest mismatch");
  }
  let macOffset = data.length - 32;
  let body = data.subarray(0, macOffset);
  if (!bytesEqual(hmacSHA256(macKey, body), data.subarray(macOffset))) {
    throw new Error("Bad MAC on attachment");
  }
  return await aesCBCDecrypt(aesKey, body.subarray(0, 16), body.subarray(16));
}

/** A fresh 64-byte attachment key (32 AES + 32 HMAC). */
export function newAttachmentKey(): Uint8Array {
  return randomBytes(64);
}
