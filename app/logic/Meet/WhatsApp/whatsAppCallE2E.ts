/** End-to-end media encryption for WhatsApp Web calls.
 *
 * Web calls use the browser's DTLS-SRTP for transport (to a WhatsApp SFU for
 * groups), so to keep calls end-to-end encrypted there is an additional layer:
 * each media frame is encrypted in JavaScript before it enters the WebRTC sender
 * and decrypted after the receiver, using a key derived from the call key that
 * was shared over the Signal session. This is the same "insertable streams"
 * approach Jitsi/Meet/Zoom use for E2EE in SFU calls.
 *
 * The key derivation and per-frame AEAD here are real and unit-tested. The exact
 * parameters WhatsApp Web uses (HKDF info string, which header bytes are left in
 * the clear, the frame counter wire layout) are undocumented and need a live
 * capture — those specifics are the integration gap, not the mechanism. */
import { hkdfSHA256, aesGCMEncrypt, aesGCMDecrypt, concatBytes } from "../../Chat/WhatsApp/Crypto/primitives";

const kIvLength = 12;
const enc = (s: string) => new TextEncoder().encode(s);

/** Derives the 32-byte media frame key from the Signal-shared call key. */
export function deriveCallMediaKey(callKey: Uint8Array): Uint8Array {
  return hkdfSHA256(callKey, new Uint8Array(32), enc("WhatsApp Call E2E Media Key"), 32);
}

/** Encrypts one media frame payload. Layout: `[12-byte IV][ciphertext+GCM tag]`.
 * @param counter unique per frame; becomes the IV. */
export async function encryptFrame(plaintext: Uint8Array, key: Uint8Array, counter: number): Promise<Uint8Array> {
  let iv = ivFor(counter);
  return concatBytes(iv, await aesGCMEncrypt(key, iv, plaintext));
}

export async function decryptFrame(data: Uint8Array, key: Uint8Array): Promise<Uint8Array> {
  let iv = data.subarray(0, kIvLength);
  return await aesGCMDecrypt(key, iv, data.subarray(kIvLength));
}

function ivFor(counter: number): Uint8Array {
  let iv = new Uint8Array(kIvLength);
  // counter in the last 8 bytes, big-endian (supports >2^32 frames)
  new DataView(iv.buffer).setBigUint64(4, BigInt(counter), false);
  return iv;
}

// createEncodedStreams() may be called only once per sender/receiver.
let wired = new WeakSet<object>();

/** Wires the per-frame encrypt/decrypt onto a peer connection's senders and
 * receivers using insertable streams. Idempotent, browser-only, and feature-
 * detected; a no-op where the API is unavailable. GATED: not active in production. */
export function setupEncodedTransforms(peerConnection: RTCPeerConnection, callKey: Uint8Array): boolean {
  if (typeof (RTCRtpSender.prototype as any).createEncodedStreams != "function") {
    return false; // No insertable-streams support; E2E frame layer unavailable.
  }
  let key = deriveCallMediaKey(callKey);
  let counter = 0;
  for (let sender of peerConnection.getSenders()) {
    wireEndpoint(sender, async (data: Uint8Array) => encryptFrame(data, key, counter++));
  }
  for (let receiver of peerConnection.getReceivers()) {
    wireEndpoint(receiver, async (data: Uint8Array) => {
      try {
        return await decryptFrame(data, key);
      } catch (ex) {
        return data; // pass through undecryptable frames rather than tear down
      }
    });
  }
  return true;
}

function wireEndpoint(endpoint: RTCRtpSender | RTCRtpReceiver, process: (data: Uint8Array) => Promise<Uint8Array>) {
  if (wired.has(endpoint) || !(endpoint as any).track) {
    return;
  }
  let streams = (endpoint as any).createEncodedStreams?.();
  if (!streams) {
    return;
  }
  wired.add(endpoint);
  let transform = new TransformStream({
    transform: async (frame: any, controller: any) => {
      frame.data = (await process(new Uint8Array(frame.data))).buffer;
      controller.enqueue(frame);
    },
  });
  streams.readable.pipeThrough(transform).pipeTo(streams.writable);
}
