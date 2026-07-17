/** Profile field encryption (libsignal `ProfileCipher`). Each field is AES-256-GCM
 * under the 32-byte profile key, zero-padded to a fixed bucket so its length leaks
 * nothing, with a 12-byte random nonce prepended:  nonce ‖ ciphertext ‖ tag.
 * The name is `givenName ‖ 0x00 ‖ familyName` before padding. */
import { aesGCMEncrypt, aesGCMDecrypt, randomBytes, concatBytes } from "../Crypto/primitives";

export const kNamePaddedLength1 = 53;
export const kNamePaddedLength2 = 257;
export const kAboutPaddedLength1 = 128;
export const kAboutPaddedLength2 = 254;
export const kAboutPaddedLength3 = 512;
export const kEmojiPaddedLength = 32;
/** nonce(12) + GCM tag(16). */
const kOverhead = 28;

/** Smallest bucket in `buckets` that fits `length`, else the largest. */
function bucketFor(length: number, buckets: number[]): number {
  return buckets.find(b => length <= b) ?? buckets[buckets.length - 1];
}

/** Encrypt one field, zero-padded to `paddedLength`. @returns nonce ‖ ct ‖ tag
 * (length = paddedLength + 28). */
export async function encryptProfileField(profileKey: Uint8Array, plaintext: Uint8Array, paddedLength: number): Promise<Uint8Array> {
  let padded = new Uint8Array(paddedLength);
  padded.set(plaintext.subarray(0, paddedLength));
  let nonce = randomBytes(12);
  return concatBytes(nonce, await aesGCMEncrypt(profileKey, nonce, padded));
}

/** Decrypt one field and strip the trailing zero padding. */
export async function decryptProfileField(profileKey: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
  let nonce = data.subarray(0, 12);
  let plain = await aesGCMDecrypt(profileKey, nonce, data.subarray(12));
  let end = plain.length;
  while (end > 0 && plain[end - 1] == 0) {
    end--;
  }
  return plain.subarray(0, end);
}

/** Encrypt the profile name (`given ‖ 0x00 ‖ family`), bucketed to 53 or 257. */
export async function encryptProfileName(profileKey: Uint8Array, givenName: string, familyName = ""): Promise<Uint8Array> {
  let enc = new TextEncoder();
  let combined = concatBytes(enc.encode(givenName), new Uint8Array([0]), enc.encode(familyName));
  return encryptProfileField(profileKey, combined, bucketFor(combined.length, [kNamePaddedLength1, kNamePaddedLength2]));
}

/** @returns the decrypted `{ givenName, familyName }`. */
export async function decryptProfileName(profileKey: Uint8Array, data: Uint8Array): Promise<{ givenName: string, familyName: string }> {
  let combined = await decryptProfileField(profileKey, data);
  let sep = combined.indexOf(0);
  let dec = new TextDecoder();
  if (sep < 0) {
    return { givenName: dec.decode(combined), familyName: "" };
  }
  return { givenName: dec.decode(combined.subarray(0, sep)), familyName: dec.decode(combined.subarray(sep + 1)) };
}

export async function encryptProfileAbout(profileKey: Uint8Array, about: string): Promise<Uint8Array> {
  let bytes = new TextEncoder().encode(about);
  // libsignal getTargetAboutLength: ≤128 → 128, <254 → 254, else 512. The 254 boundary
  // is strict `<` (unlike the name buckets), so exactly 254 bytes pads to 512.
  let bucket = bytes.length <= kAboutPaddedLength1 ? kAboutPaddedLength1
    : bytes.length < kAboutPaddedLength2 ? kAboutPaddedLength2
    : kAboutPaddedLength3;
  return encryptProfileField(profileKey, bytes, bucket);
}

export async function encryptProfileEmoji(profileKey: Uint8Array, emoji: string): Promise<Uint8Array> {
  return encryptProfileField(profileKey, new TextEncoder().encode(emoji), kEmojiPaddedLength);
}

export { kOverhead as kProfileEncryptionOverhead };
