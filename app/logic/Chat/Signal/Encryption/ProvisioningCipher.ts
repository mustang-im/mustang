/** The provisioning envelope crypto for linking as a secondary (companion)
 * device — the default setup path. The primary device encrypts a ProvisionMessage
 * to the secondary's freshly generated public key; the secondary decrypts it.
 *
 * Scheme (libsignal PrimaryProvisioningCipher / SecondaryProvisioningCipher):
 *   agreement = X25519(ephemeral/our priv, their pub)
 *   keys      = HKDF-SHA256(agreement, salt=0, info="TextSecure Provisioning Message", 64)
 *               → cipherKey(32) ‖ macKey(32)
 *   body      = 0x01 ‖ iv(16) ‖ AES-256-CBC(cipherKey, iv, plaintext) ‖ HMAC-SHA256(macKey, 0x01‖iv‖ct)
 * The envelope carries our ephemeral public key (33-byte DJB) and this body. */
import { KeyPair } from "../Crypto/KeyPair";
import { sharedSecret, djbEncode, djbDecode } from "../Crypto/curve";
import { hkdfSHA256, hmacSHA256, aesCBCEncrypt, aesCBCDecrypt, randomBytes, concatBytes, bytesEqual } from "../Crypto/primitives";

const kProvisioningInfo = new TextEncoder().encode("TextSecure Provisioning Message");
const kZeroSalt = new Uint8Array(32);
const kVersion = 0x01;

export interface ProvisionEnvelopeBytes {
  /** 33-byte DJB-encoded ephemeral public key of the encrypting (primary) side. */
  publicKey: Uint8Array;
  body: Uint8Array;
}

function deriveKeys(agreement: Uint8Array): { cipherKey: Uint8Array, macKey: Uint8Array } {
  let derived = hkdfSHA256(agreement, kZeroSalt, kProvisioningInfo, 64);
  return { cipherKey: derived.slice(0, 32), macKey: derived.slice(32, 64) };
}

/** Primary side: encrypt a serialized ProvisionMessage to the secondary's public
 * key (32 raw or 33-byte DJB). @returns the envelope's `publicKey` + `body`. */
export async function encryptProvisionEnvelope(theirPublicKey: Uint8Array, plaintext: Uint8Array): Promise<ProvisionEnvelopeBytes> {
  let ephemeral = KeyPair.generate();
  let { cipherKey, macKey } = deriveKeys(sharedSecret(ephemeral.privateKey, djbDecode(theirPublicKey)));
  let iv = randomBytes(16);
  let ciphertext = concatBytes(iv, await aesCBCEncrypt(cipherKey, iv, plaintext));
  let version = new Uint8Array([kVersion]);
  let mac = hmacSHA256(macKey, concatBytes(version, ciphertext));
  return { publicKey: djbEncode(ephemeral.publicKey), body: concatBytes(version, ciphertext, mac) };
}

/** Secondary side: decrypt a ProvisionEnvelope from the primary.
 * @param ourKeyPair the secondary's identity key pair (its public key is what we
 *   put in the QR code). @returns the serialized ProvisionMessage bytes.
 * @throws on an unknown version or a bad MAC. */
export async function decryptProvisionEnvelope(ourKeyPair: KeyPair, publicKey: Uint8Array, body: Uint8Array): Promise<Uint8Array> {
  if (body[0] != kVersion) {
    throw new Error(`Unsupported provisioning version ${body[0]}`);
  }
  let { cipherKey, macKey } = deriveKeys(sharedSecret(ourKeyPair.privateKey, djbDecode(publicKey)));
  let macOffset = body.length - 32;
  if (!bytesEqual(hmacSHA256(macKey, body.subarray(0, macOffset)), body.subarray(macOffset))) {
    throw new Error("Bad MAC on provisioning envelope");
  }
  let iv = body.subarray(1, 17);
  let ciphertext = body.subarray(17, macOffset);
  return await aesCBCDecrypt(cipherKey, iv, ciphertext);
}
