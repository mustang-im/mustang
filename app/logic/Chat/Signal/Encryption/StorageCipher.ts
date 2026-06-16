/** Storage-service key derivation + record encryption (libsignal `StorageKey` /
 * `MasterKey` / `StorageCipher`). The roster, contacts and settings sync through
 * this. Keys are HMAC-SHA256 derivations off the master key; records are
 * AES-256-GCM with a 12-byte IV prepended and no AAD:  iv ‖ ciphertext ‖ tag.
 *
 * Two per-item key schemes: the legacy HMAC scheme (default), and the newer
 * SSRE2 scheme when the manifest carries a 32-byte `recordIkm` (HKDF). The
 * manifest itself is always HMAC-derived. See Docs/06. */
import { hmacSHA256, hkdfSHA256, aesGCMEncrypt, aesGCMDecrypt, randomBytes, concatBytes, base64Encode } from "../Crypto/primitives";

const enc = (s: string) => new TextEncoder().encode(s);

/** AccountEntropyPool (the 64-char lowercase-alphanumeric string newer accounts
 * carry in the ProvisionMessage) → 32-byte master key.
 * libsignal `AccountEntropyPool::derive_svr_key`: HKDF-SHA256(IKM = the AEP
 * ascii bytes, salt = none, info = "20240801_SIGNAL_SVR_MASTER_KEY", L = 32). */
export function deriveMasterKeyFromAEP(accountEntropyPool: string): Uint8Array {
  return hkdfSHA256(enc(accountEntropyPool), new Uint8Array(0), enc("20240801_SIGNAL_SVR_MASTER_KEY"), 32);
}

/** masterKey → 32-byte storage service key. */
export function deriveStorageKey(masterKey: Uint8Array): Uint8Array {
  return hmacSHA256(masterKey, enc("Storage Service Encryption"));
}

/** storageKey → the key that encrypts the manifest at `version`. */
export function deriveManifestKey(storageKey: Uint8Array, version: number | bigint): Uint8Array {
  return hmacSHA256(storageKey, enc("Manifest_" + version));
}

/** storageKey + a record's 16-byte id → that record's key (legacy HMAC scheme). */
export function deriveItemKey(storageKey: Uint8Array, rawId: Uint8Array): Uint8Array {
  return hmacSHA256(storageKey, enc("Item_" + base64Encode(rawId)));
}

/** recordIkm + a record's 16-byte id → that record's key (SSRE2 / current).
 * libsignal `RecordIkm`: HKDF-SHA256(IKM = recordIkm, salt = none,
 * info = "20240801_SIGNAL_STORAGE_SERVICE_ITEM_" ‖ rawId(16), L = 32). */
export function deriveItemKeyFromIkm(recordIkm: Uint8Array, rawId: Uint8Array): Uint8Array {
  let info = concatBytes(enc("20240801_SIGNAL_STORAGE_SERVICE_ITEM_"), rawId);
  return hkdfSHA256(recordIkm, new Uint8Array(0), info, 32);
}

/** Encrypt a manifest/record. @returns iv(12) ‖ ciphertext ‖ tag(16). */
export async function storageEncrypt(key: Uint8Array, plaintext: Uint8Array): Promise<Uint8Array> {
  let iv = randomBytes(12);
  return concatBytes(iv, await aesGCMEncrypt(key, iv, plaintext));
}

/** Decrypt a manifest/record produced by {@link storageEncrypt}. */
export async function storageDecrypt(key: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
  return await aesGCMDecrypt(key, data.subarray(0, 12), data.subarray(12));
}
