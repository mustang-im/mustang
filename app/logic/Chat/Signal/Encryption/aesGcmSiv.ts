/** AES-GCM-SIV (RFC 8452), the nonce-misuse-resistant AEAD Signal uses for
 * sealed-sender v2 and the zkgroup attribute blobs. Thin wrapper over
 * @noble/ciphers so the rest of the Signal code never imports the cipher lib. */
import { gcmsiv } from "@noble/ciphers/aes.js";

/** @param key 16 or 32 bytes. @param nonce 12 bytes.
 * @returns ciphertext with the 16-byte tag appended. */
export function aesGcmSivEncrypt(key: Uint8Array, nonce: Uint8Array, plaintext: Uint8Array, aad?: Uint8Array): Uint8Array {
  return gcmsiv(key, nonce, aad).encrypt(plaintext);
}

/** @param ciphertext the bytes from {@link aesGcmSivEncrypt} (tag included).
 * @throws if the tag does not verify. */
export function aesGcmSivDecrypt(key: Uint8Array, nonce: Uint8Array, ciphertext: Uint8Array, aad?: Uint8Array): Uint8Array {
  return gcmsiv(key, nonce, aad).decrypt(ciphertext);
}
