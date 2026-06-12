/** Low-level cryptographic primitives used across the WhatsApp protocol.
 *
 * Hashing/HMAC/HKDF come from @noble (synchronous, audited, pure JS).
 * AES uses WebCrypto, which is available both in the Electron renderer and
 * under Node (vitest). Everything here is independent of WhatsApp specifics. */
import { sha256 as nobleSha256, sha512 as nobleSha512 } from "@noble/hashes/sha2.js";
import { md5 as nobleMd5 } from "@noble/hashes/legacy.js";
import { hmac as nobleHmac } from "@noble/hashes/hmac.js";
import { hkdf as nobleHkdf } from "@noble/hashes/hkdf.js";

export function sha256(data: Uint8Array): Uint8Array {
  return nobleSha256(data);
}

/** MD5 — used only for the registration build-hash the server expects, never
 * for anything security-relevant. */
export function md5(data: Uint8Array): Uint8Array {
  return nobleMd5(data);
}

export function sha512(data: Uint8Array): Uint8Array {
  return nobleSha512(data);
}

export function hmacSHA256(key: Uint8Array, data: Uint8Array): Uint8Array {
  return nobleHmac(nobleSha256, key, data);
}

/** HKDF-SHA256 (RFC 5869), as used by Signal's "HKDFv3" and WhatsApp.
 * @param salt Pass the explicit salt; for "zero salt" pass 32 zero bytes. */
export function hkdfSHA256(ikm: Uint8Array, salt: Uint8Array, info: Uint8Array, length: number): Uint8Array {
  return nobleHkdf(nobleSha256, ikm, salt, info, length);
}

let subtle = globalThis.crypto.subtle;

/** AES-256-GCM. @returns ciphertext with the 16-byte tag appended. */
export async function aesGCMEncrypt(key: Uint8Array, iv: Uint8Array, plaintext: Uint8Array, aad?: Uint8Array): Promise<Uint8Array> {
  let k = await subtle.importKey("raw", key as BufferSource, "AES-GCM", false, ["encrypt"]);
  let params: AesGcmParams = { name: "AES-GCM", iv: iv as BufferSource, tagLength: 128 };
  if (aad) {
    params.additionalData = aad as BufferSource;
  }
  return new Uint8Array(await subtle.encrypt(params, k, plaintext as BufferSource));
}

/** AES-256-GCM. @param data ciphertext with the 16-byte tag appended. */
export async function aesGCMDecrypt(key: Uint8Array, iv: Uint8Array, data: Uint8Array, aad?: Uint8Array): Promise<Uint8Array> {
  let k = await subtle.importKey("raw", key as BufferSource, "AES-GCM", false, ["decrypt"]);
  let params: AesGcmParams = { name: "AES-GCM", iv: iv as BufferSource, tagLength: 128 };
  if (aad) {
    params.additionalData = aad as BufferSource;
  }
  return new Uint8Array(await subtle.decrypt(params, k, data as BufferSource));
}

/** AES-256-CBC with PKCS#7 padding (the padding WebCrypto applies by default). */
export async function aesCBCEncrypt(key: Uint8Array, iv: Uint8Array, plaintext: Uint8Array): Promise<Uint8Array> {
  let k = await subtle.importKey("raw", key as BufferSource, "AES-CBC", false, ["encrypt"]);
  return new Uint8Array(await subtle.encrypt({ name: "AES-CBC", iv: iv as BufferSource }, k, plaintext as BufferSource));
}

export async function aesCBCDecrypt(key: Uint8Array, iv: Uint8Array, ciphertext: Uint8Array): Promise<Uint8Array> {
  let k = await subtle.importKey("raw", key as BufferSource, "AES-CBC", false, ["decrypt"]);
  return new Uint8Array(await subtle.decrypt({ name: "AES-CBC", iv: iv as BufferSource }, k, ciphertext as BufferSource));
}

export function randomBytes(length: number): Uint8Array {
  return globalThis.crypto.getRandomValues(new Uint8Array(length));
}

export function concatBytes(...arrays: Uint8Array[]): Uint8Array {
  let total = arrays.reduce((sum, a) => sum + a.length, 0);
  let result = new Uint8Array(total);
  let offset = 0;
  for (let a of arrays) {
    result.set(a, offset);
    offset += a.length;
  }
  return result;
}

/** Standard base64 (RFC 4648, with `+/` and `=` padding), as WhatsApp uses in
 * the QR pairing payload. */
export function base64Encode(bytes: Uint8Array): string {
  let binary = "";
  for (let b of bytes) {
    binary += String.fromCharCode(b);
  }
  return btoa(binary);
}

export function base64Decode(text: string): Uint8Array {
  let binary = atob(text);
  let bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length != b.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff == 0;
}
