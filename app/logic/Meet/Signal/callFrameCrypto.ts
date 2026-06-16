/** Signal GROUP-call per-sender media-frame encryption (Docs/07 §D.4).
 *
 * Group calls go through a central SFU that forwards (and could otherwise read)
 * media, so each sender E2E-encrypts every media frame with a per-sender
 * ratcheting key, ON TOP of the SFU-leg SRTP. This module is the frame-crypto
 * layer; it is fully specified by Docs/07 and reproduced here in pure TS.
 *
 * Wiring it into the media pipeline (encoded-frame transforms / Insertable
 * Streams) is GATED on the same media-engine question as 1:1 (callSRTP.ts). The
 * crypto below is complete and unit-testable on its own; the transport hook is
 * the remaining work, marked where it lives in SignalGroupCall.
 *
 * Clean-room from Docs/07 §D.4 / the public ringrtc crypto.rs description. */
import { hkdfSHA256, hmacSHA256, aesCBCEncrypt } from "../../Chat/Signal/Crypto/primitives";

const enc = (s: string) => new TextEncoder().encode(s);

// HKDF info strings (Docs/07 §D.4 — ringrtc crypto.rs). No salt.
const kAESKeyInfo = "RingRTC AES Key";
const kHMACKeyInfo = "RingRTC HMAC Key";
const kRatchetInfo = "RingRTC Ratchet";

const kKeyLength = 32;
/** Truncated MAC length appended per frame (ringrtc MAC_SIZE_BYTES). */
const kMacLength = 16;

/** The keys derived from one ratchet secret. */
export interface FrameKeys {
  aesKey: Uint8Array;
  hmacKey: Uint8Array;
}

/** Derive the AES + HMAC keys from a 32-byte ratchet secret (Docs/07 §D.4). */
export function deriveFrameKeys(secret: Uint8Array): FrameKeys {
  return {
    aesKey: hkdfSHA256(secret, EMPTY, enc(kAESKeyInfo), kKeyLength),
    hmacKey: hkdfSHA256(secret, EMPTY, enc(kHMACKeyInfo), kKeyLength),
  };
}

/** One ratchet step: `secret ← HKDF(secret, "RingRTC Ratchet")`. The caller
 * increments the ratchet counter alongside. */
export function advanceRatchet(secret: Uint8Array): Uint8Array {
  return hkdfSHA256(secret, EMPTY, enc(kRatchetInfo), kKeyLength);
}

/** The 16-byte IV: the u64 big-endian frame counter in the high 8 bytes, rest
 * zero (ringrtc convert_frame_counter_to_iv). */
export function frameCounterIv(frameCounter: bigint): Uint8Array {
  let iv = new Uint8Array(16);
  let v = frameCounter & 0xFFFFFFFFFFFFFFFFn;
  for (let i = 0; i < 8; i++) {
    iv[i] = Number((v >> BigInt((7 - i) * 8)) & 0xFFn);
  }
  return iv;
}

/** The per-frame on-wire footer appended after the ciphertext (Docs/07 §D.4):
 *   [ ratchet_counter : u8 ][ frame_counter : u32 BE ][ mac : 16 bytes ]
 * `frameCounter` starts at 1, increments per frame, must stay ≤ u32::MAX. */
export function buildFrameFooter(ratchetCounter: number, frameCounter: number, mac: Uint8Array): Uint8Array {
  let footer = new Uint8Array(1 + 4 + kMacLength);
  footer[0] = ratchetCounter & 0xFF;
  footer[1] = (frameCounter >>> 24) & 0xFF;
  footer[2] = (frameCounter >>> 16) & 0xFF;
  footer[3] = (frameCounter >>> 8) & 0xFF;
  footer[4] = frameCounter & 0xFF;
  footer.set(mac.subarray(0, kMacLength), 5);
  return footer;
}

/** Parse a frame footer back into its parts. Returns the footer fields and the
 * payload (everything before the footer). */
export function parseFrameFooter(frame: Uint8Array): { payload: Uint8Array, ratchetCounter: number, frameCounter: number, mac: Uint8Array } {
  let footerStart = frame.length - (1 + 4 + kMacLength);
  let ratchetCounter = frame[footerStart];
  let frameCounter = (frame[footerStart + 1] << 24) | (frame[footerStart + 2] << 16)
    | (frame[footerStart + 3] << 8) | frame[footerStart + 4];
  let mac = frame.subarray(footerStart + 5, footerStart + 5 + kMacLength);
  return { payload: frame.subarray(0, footerStart), ratchetCounter, frameCounter: frameCounter >>> 0, mac };
}

/** The frame MAC: first 16 bytes of
 *   HMAC-SHA256(hmacKey, iv ‖ len(data)_u32_BE ‖ data ‖ 0x00000000)
 * (Docs/07 §D.4). */
export function frameMac(hmacKey: Uint8Array, iv: Uint8Array, data: Uint8Array): Uint8Array {
  let lenBE = new Uint8Array(4);
  new DataView(lenBE.buffer).setUint32(0, data.length, false);
  let input = new Uint8Array(iv.length + 4 + data.length + 4);
  let pos = 0;
  input.set(iv, pos); pos += iv.length;
  input.set(lenBE, pos); pos += 4;
  input.set(data, pos); pos += data.length;
  // trailing 0x00000000 already zero
  return hmacSHA256(hmacKey, input).subarray(0, kMacLength);
}

/** Encrypt one media frame: AES-256-CTR(aesKey, iv) over the payload, then a
 * truncated HMAC, returning `[ ciphertext ][ footer ]`.
 *
 * NOTE: the app's crypto primitives expose AES-GCM/CBC but not raw CTR; this
 * implements CTR via CBC over a zero-block keystream so no new dependency is
 * needed. Docs/07 §D.4 specifies CTR. */
export async function encryptFrame(
  payload: Uint8Array, keys: FrameKeys, ratchetCounter: number, frameCounter: number): Promise<Uint8Array> {
  let iv = frameCounterIv(BigInt(frameCounter));
  let ciphertext = await aesCTR(keys.aesKey, iv, payload);
  let mac = frameMac(keys.hmacKey, iv, ciphertext);
  let footer = buildFrameFooter(ratchetCounter, frameCounter, mac);
  let out = new Uint8Array(ciphertext.length + footer.length);
  out.set(ciphertext);
  out.set(footer, ciphertext.length);
  return out;
}

/** Decrypt one media frame, verifying the MAC. Returns the plaintext payload, or
 * null if authentication fails. */
export async function decryptFrame(frame: Uint8Array, keys: FrameKeys): Promise<Uint8Array | null> {
  let { payload, frameCounter, mac } = parseFrameFooter(frame);
  let iv = frameCounterIv(BigInt(frameCounter));
  let expected = frameMac(keys.hmacKey, iv, payload);
  if (!timingSafeEqual(mac, expected)) {
    return null;
  }
  return await aesCTR(keys.aesKey, iv, payload);
}

// --- AES-256-CTR via the WebCrypto-backed CBC primitive ---

/** AES-256-CTR by generating a CBC keystream over zero blocks and XOR-ing.
 * (WebCrypto exposes CTR directly; this keeps to the app's existing primitives.) */
async function aesCTR(key: Uint8Array, iv16: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
  let blocks = Math.ceil(data.length / 16);
  let counterBlocks = new Uint8Array(blocks * 16);
  let counter = iv16.slice();
  for (let i = 0; i < blocks; i++) {
    counterBlocks.set(counter, i * 16);
    incrementCounter(counter);
  }
  // CBC with a zero IV over the counter blocks, with PKCS7 stripped, is NOT a CTR
  // keystream; do it explicitly via ECB-equivalent: encrypt each counter block.
  let keystream = await ecbEncryptBlocks(key, counterBlocks);
  let out = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) {
    out[i] = data[i] ^ keystream[i];
  }
  return out;
}

/** ECB-encrypt 16-byte blocks via CBC with a zero IV chained per block. CBC over a
 * single block with zero IV equals ECB for that block; to get independent blocks
 * we encrypt each block separately. */
async function ecbEncryptBlocks(key: Uint8Array, blocks: Uint8Array): Promise<Uint8Array> {
  let out = new Uint8Array(blocks.length);
  let zeroIv = new Uint8Array(16);
  for (let off = 0; off < blocks.length; off += 16) {
    let block = blocks.subarray(off, off + 16);
    // aesCBCEncrypt applies PKCS7 padding → a 16-byte input yields 32 bytes; the
    // first 16 are E(block) with a zero IV (= ECB of this block).
    let ct = await aesCBCEncrypt(key, zeroIv, block);
    out.set(ct.subarray(0, 16), off);
  }
  return out;
}

function incrementCounter(counter: Uint8Array) {
  for (let i = counter.length - 1; i >= 0; i--) {
    if (++counter[i] != 0) {
      break;
    }
  }
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length != b.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff == 0;
}

const EMPTY = new Uint8Array(0);
