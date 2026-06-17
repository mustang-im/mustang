/** Decrypts a Signal message-backup file (the link-and-sync transfer archive,
 * Docs/02 §B.6) using the one-time `ephemeralBackupKey` from the ProvisionMessage.
 *
 * Key schedule + framing verified against libsignal `rust/message-backup` and
 * `rust/account-keys` (see Docs/10-link-sync-message-backup and the known-answer
 * test `messageBackup.test.ts`). The transfer archive is the *legacy* (no
 * forward-secrecy) variant, so:
 *
 *   backupId = HKDF(backupKey, ∅, "20241024_SIGNAL_BACKUP_ID:" ‖ aci)
 *   mbk      = HKDF(backupKey, ∅, "20241007_SIGNAL_BACKUP_ENCRYPT_MESSAGE_BACKUP:" ‖ backupId)  → hmacKey ‖ aesKey
 *   file     = IV(16) ‖ AES-256-CBC-PKCS7(aesKey, IV, gzip(frames)) ‖ HMAC-SHA256(hmacKey, IV‖ct)
 */
import { hkdfSHA256, aesCBCDecrypt, hmacSHA256, bytesEqual, concatBytes } from "../Crypto/primitives";
import type { ServiceId } from "../ServiceId";
import { appGlobal } from "../../../app";

const BACKUP_ID_INFO = "20241024_SIGNAL_BACKUP_ID:";
const ENCRYPT_MESSAGE_BACKUP_INFO = "20241007_SIGNAL_BACKUP_ENCRYPT_MESSAGE_BACKUP:";
/** Forward-secrecy backups start with this; the link transfer never does. */
const MAGIC_NUMBER = new TextEncoder().encode("SBACKUP\x01");
const IV_LEN = 16;
const HMAC_LEN = 32;

export interface MessageBackupKey {
  aesKey: Uint8Array;   // 32 bytes
  hmacKey: Uint8Array;  // 32 bytes
}

function utf8(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}

/** The 16-byte BackupId for `backupKey` (32 bytes) + the account ACI. */
export function deriveBackupId(backupKey: Uint8Array, aci: ServiceId): Uint8Array {
  let info = concatBytes(utf8(BACKUP_ID_INFO), aci.serviceIdBinary());
  return hkdfSHA256(backupKey, new Uint8Array(0), info, 16);
}

/** Derive the AES + HMAC keys that encrypt the backup file (legacy variant). */
export function deriveMessageBackupKey(backupKey: Uint8Array, aci: ServiceId): MessageBackupKey {
  let backupId = deriveBackupId(backupKey, aci);
  let info = concatBytes(utf8(ENCRYPT_MESSAGE_BACKUP_INFO), backupId);
  let out = hkdfSHA256(backupKey, new Uint8Array(0), info, 64);
  return { hmacKey: out.subarray(0, 32), aesKey: out.subarray(32, 64) };
}

/** Verify + decrypt + decompress a backup file into its varint-delimited frame
 * stream. @throws on a forward-secrecy file (unsupported here) or a bad HMAC. */
export async function decryptMessageBackup(backupKey: Uint8Array, aci: ServiceId, file: Uint8Array): Promise<Uint8Array> {
  if (file.length >= MAGIC_NUMBER.length && bytesEqual(file.subarray(0, MAGIC_NUMBER.length), MAGIC_NUMBER)) {
    throw new Error("Signal: forward-secrecy message backup is not supported for link-and-sync");
  }
  if (file.length < IV_LEN + HMAC_LEN) {
    throw new Error("Signal: message backup file too short");
  }
  let { aesKey, hmacKey } = deriveMessageBackupKey(backupKey, aci);

  let macOffset = file.length - HMAC_LEN;
  let signed = file.subarray(0, macOffset);          // IV ‖ ciphertext
  if (!bytesEqual(hmacSHA256(hmacKey, signed), file.subarray(macOffset))) {
    throw new Error("Signal: message backup HMAC mismatch (wrong key?)");
  }
  let iv = signed.subarray(0, IV_LEN);
  let ciphertext = signed.subarray(IV_LEN);
  let compressed = await aesCBCDecrypt(aesKey, iv, ciphertext); // WebCrypto strips PKCS7
  return await inflateGzip(compressed);
}

/** gzip-inflate. Prefers the backend's Node zlib; falls back to the renderer's
 * `DecompressionStream`. Mirrors WhatsAppHistorySync's `inflate`. */
async function inflateGzip(data: Uint8Array): Promise<Uint8Array> {
  let backendGunzip = (appGlobal.remoteApp as any)?.gunzip;
  if (backendGunzip) {
    try {
      return new Uint8Array(await backendGunzip(data));
    } catch (ex) {
      console.warn("Signal: backend gunzip failed, falling back:", (ex as any)?.message ?? ex);
    }
  }
  let stream = new DecompressionStream("gzip");
  let writer = stream.writable.getWriter();
  void writer.write(data as BufferSource);
  void writer.close();
  let reader = stream.readable.getReader();
  let chunks: Uint8Array[] = [];
  for (let chunk = await reader.read(); !chunk.done; chunk = await reader.read()) {
    chunks.push(chunk.value);
  }
  return concatBytes(...chunks);
}
