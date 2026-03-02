import type { PublicKey, PrivateKey } from "./PublicKey";
import { PGPPublicKey } from "./PGP/PGPPublicKey";
import { PGPPrivateKey } from "./PGP/PGPPrivateKey";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";

export function publicKeyFromJSON(json: any): PublicKey {
  let PublicKeyClass = sanitize.translate(json.type, {
    pgp: PGPPublicKey,
    //smime: SMIMEPublicKey,
  });
  let publicKey = new PublicKeyClass();
  publicKey.fromJSON(json);
  return publicKey;
}

export function privateKeyFromJSON(json: any): PublicKey & PrivateKey {
  let PrivateKeyClass = sanitize.translate(json.type, {
    pgp: PGPPrivateKey,
    //smime: SMIMEPrivateKey,
  });
  let privateKey = new PrivateKeyClass();
  privateKey.fromJSON(json);
  return privateKey;
}
