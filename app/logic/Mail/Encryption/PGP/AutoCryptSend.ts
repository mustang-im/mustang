import type { PGPPrivateKey } from "./PGPPrivateKey";
import type { MailIdentity } from "../../MailIdentity";
import { extractBase64FromArmorned } from "../KeyUtils";
import { assert } from "../../../util/util";

/** @returns the AutoCrypt header, i.e. `AutoCrypt: addr=; ...; keydata=...` */
export function sendAutoCryptHeader(identity: MailIdentity, privateKey: PGPPrivateKey): string {
  assert(privateKey.publicKeyArmored, `Need armored public key of private key ${privateKey.name} for ${identity.emailAddress}`);
  let parts: string[] = [ "addr=" + identity.emailAddress ];
  if (privateKey.encryptByDefault) {
    parts.push("prefer-encrypt=mutual");
  }
  let keydata = extractBase64FromArmorned(privateKey.publicKeyArmored); // definitely not `.privateKeyArmorned` ;-)
  parts.push(`keydata=${keydata}`); // keydata must be last, per spec
  let header = "AutoCrypt: " + parts.join("; ");
  return header;
}
