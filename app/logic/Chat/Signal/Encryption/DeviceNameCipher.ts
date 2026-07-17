/** Encrypt a linked device's display name (Docs/02 §B.5). The result goes into the
 * `name` field of the `PUT /v1/devices/link` account attributes (base64), so the
 * primary phone can show "Mustang on Linux" etc. without the server learning it.
 *
 * Scheme (Signal-Android `DeviceNameCipher.encryptDeviceName`), keyed to the
 * account's ACI identity key:
 *   ephemeral   = fresh X25519 keypair
 *   masterSecret= ECDH(ephemeral.priv, identityKey.pub)
 *   syntheticIv = HMAC-SHA256( HMAC-SHA256(masterSecret,"auth"), plaintext )[0:16]
 *   cipherKey   = HMAC-SHA256( HMAC-SHA256(masterSecret,"cipher"), syntheticIv )
 *   ciphertext  = AES-256-CTR(cipherKey, IV=0^16, plaintext)
 *   DeviceName { ephemeralPublic=1 (33B DJB), syntheticIv=2 (16B), ciphertext=3 } */
import { KeyPair } from "../Crypto/KeyPair";
import { sharedSecret, djbEncode } from "../Crypto/curve";
import { hmacSHA256 } from "../Crypto/primitives";
import { message, bytes, type TypeOf } from "../Proto/codec";
import { encode } from "../Proto/codec";
import { ctr } from "@noble/ciphers/aes.js";

export const DeviceName = message({
  ephemeralPublic: bytes(1),
  syntheticIv: bytes(2),
  ciphertext: bytes(3),
});
export type DeviceName = TypeOf<typeof DeviceName>;

const enc = new TextEncoder();

/** Encrypt `name` under the ACI `identityKey`; returns the serialized DeviceName
 * proto (what the `name` device attribute carries, base64). */
export function encryptDeviceName(name: string, identityKey: KeyPair): Uint8Array {
  let plaintext = enc.encode(name);
  let ephemeral = KeyPair.generate();
  let masterSecret = sharedSecret(ephemeral.privateKey, identityKey.publicKey);

  let syntheticIv = hmacSHA256(hmacSHA256(masterSecret, enc.encode("auth")), plaintext).subarray(0, 16);
  let cipherKey = hmacSHA256(hmacSHA256(masterSecret, enc.encode("cipher")), syntheticIv);
  let ciphertext = ctr(cipherKey, new Uint8Array(16)).encrypt(plaintext);

  return encode(DeviceName, {
    ephemeralPublic: djbEncode(ephemeral.publicKey),
    syntheticIv,
    ciphertext,
  });
}
