/** The Noise Protocol handshake (pattern `Noise_XX_25519_AESGCM_SHA256`) that
 * secures the transport between the client and the WhatsApp server, plus the
 * post-handshake transport cipher.
 *
 * This is the generic symmetric-state machine. The WhatsApp-specific wrapping
 * (HandshakeMessage protobufs, server certificate verification, the ClientPayload)
 * lives in the connection layer, which drives this class.
 *
 * Reference: the Noise Protocol Framework, plus WhatsApp's conventions:
 *  - the 32-byte pattern label is used directly as the initial hash;
 *  - the GCM nonce is 8 zero bytes followed by a 4-byte big-endian counter;
 *  - the handshake AEAD uses the running hash as AAD; the transport uses none. */
import { sha256, hkdfSHA256, aesGCMEncrypt, aesGCMDecrypt } from "./primitives";
import { sharedSecret } from "./curve";

export class NoiseHandshake {
  protected hash: Uint8Array;
  protected salt: Uint8Array; // the Noise chaining key `ck`
  protected key: Uint8Array;
  protected counter = 0;

  /** @param header The connection header bytes (e.g. "WA" + version), folded
   *   into the transcript hash. */
  start(header: Uint8Array) {
    let label = new TextEncoder().encode(kPattern);
    // The label plus 4 NUL bytes is exactly 32 bytes, used directly as the hash.
    let init = new Uint8Array(32);
    init.set(label.subarray(0, 28));
    this.hash = init;
    this.salt = init;
    this.key = init;
    this.counter = 0;
    this.mixHash(header);
  }

  mixHash(data: Uint8Array) {
    this.hash = sha256(concat(this.hash, data));
  }

  async mixKey(input: Uint8Array) {
    let out = hkdfSHA256(input, this.salt, new Uint8Array(0), 64);
    this.salt = out.slice(0, 32);
    this.key = out.slice(32, 64);
    this.counter = 0;
  }

  /** Mix a Diffie-Hellman shared secret into the key. */
  async mixKeyDH(privateKey: Uint8Array, publicKey: Uint8Array) {
    await this.mixKey(sharedSecret(privateKey, publicKey));
  }

  async encryptAndHash(plaintext: Uint8Array): Promise<Uint8Array> {
    let ciphertext = await aesGCMEncrypt(this.key, ivForCounter(this.counter++), plaintext, this.hash);
    this.mixHash(ciphertext);
    return ciphertext;
  }

  async decryptAndHash(ciphertext: Uint8Array): Promise<Uint8Array> {
    let plaintext = await aesGCMDecrypt(this.key, ivForCounter(this.counter++), ciphertext, this.hash);
    this.mixHash(ciphertext);
    return plaintext;
  }

  /** Derives the two transport keys. The first is the initiator's write key. */
  split(): { write: Uint8Array, read: Uint8Array } {
    let out = hkdfSHA256(new Uint8Array(0), this.salt, new Uint8Array(0), 64);
    return { write: out.slice(0, 32), read: out.slice(32, 64) };
  }
}

/** AES-256-GCM frame cipher used after the handshake completes.
 * Each direction has its own counter, starting at 0; no AAD. */
export class NoiseTransport {
  protected writeKey: Uint8Array;
  protected readKey: Uint8Array;
  protected writeCounter = 0;
  protected readCounter = 0;

  constructor(writeKey: Uint8Array, readKey: Uint8Array) {
    this.writeKey = writeKey;
    this.readKey = readKey;
  }

  async encrypt(plaintext: Uint8Array): Promise<Uint8Array> {
    return await aesGCMEncrypt(this.writeKey, ivForCounter(this.writeCounter++), plaintext);
  }

  async decrypt(ciphertext: Uint8Array): Promise<Uint8Array> {
    return await aesGCMDecrypt(this.readKey, ivForCounter(this.readCounter++), ciphertext);
  }
}

const kPattern = "Noise_XX_25519_AESGCM_SHA256";

function ivForCounter(counter: number): Uint8Array {
  let iv = new Uint8Array(12);
  new DataView(iv.buffer).setUint32(8, counter, false); // big-endian, last 4 bytes
  return iv;
}

function concat(a: Uint8Array, b: Uint8Array): Uint8Array {
  let out = new Uint8Array(a.length + b.length);
  out.set(a);
  out.set(b, a.length);
  return out;
}
