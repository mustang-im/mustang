/** Plaintext padding applied to the serialized `Content` *before* it enters the
 * triple ratchet / sealed sender, and stripped after decryption (Docs/03 §8,
 * libsignal `PushTransportDetails`). A single `0x80` terminator follows the
 * message, then `0x00` zero-fill up to a block boundary, with the +1/-1 fudge so
 * the outer AES-CBC's own PKCS#7 only adds one byte.
 *
 * This is the §8 transport padding — distinct from the Double Ratchet's own
 * 1..15-byte WhatsApp padding (`SessionCipher.padPlaintext`), which is why the
 * Signal session layer encrypts with `pad = false`. */

const kPaddingBlockSize = 80;

function paddedLength(messageLength: number): number {
  // ceil(messageLength / blockSize) * blockSize, but at least one block.
  let blocks = Math.max(1, Math.ceil(messageLength / kPaddingBlockSize));
  return blocks * kPaddingBlockSize;
}

/** `Content` bytes → `Content ‖ 0x80 ‖ 0x00…` padded to the block boundary. */
export function padContent(content: Uint8Array): Uint8Array {
  let length = paddedLength(content.length + 1) - 1;
  let out = new Uint8Array(length);
  out.set(content);
  out[content.length] = 0x80;
  return out;
}

/** Strips the §8 padding: scan from the end, skip `0x00`, the first `0x80` from
 * the end marks the boundary. Malformed padding ⇒ returned unstripped (matching
 * libsignal's lenient `getStrippedPaddingMessageBody`). */
export function unpadContent(padded: Uint8Array): Uint8Array {
  for (let i = padded.length - 1; i >= 0; i--) {
    if (padded[i] == 0x80) {
      return padded.subarray(0, i);
    }
    if (padded[i] != 0x00) {
      return padded; // malformed: a non-0x00, non-0x80 byte before any 0x80
    }
  }
  return padded; // all zeros / empty: no boundary found
}
