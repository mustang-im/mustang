import type { PrivateKey, PublicKey } from "./PublicKey";
import type { Person } from "../../Abstract/Person";
import type { MailIdentity } from "../MailIdentity";
import { appGlobal } from "../../app";

export function getPublicKeyForID(id: string | null): PublicKey | null {
  if (!id) {
    return null;
  }
  for (let person of appGlobal.persons.each) {
    for (let key of person.encryptionPublicKeys.each) {
      if (key.id == id) {
        return key;
      }
    }
  }
  return null;
}

/** For composer, which own key to use for signing the outgoing email */
export function getKeyForSigning(identity: MailIdentity): PublicKey & PrivateKey | null {
  return identity.encryptionPrivateKeys.find(key => key.useToSign);
}

/** For composer, which recipient key to use for encrypting the outgoing email */
export function getKeyForEncryption(person: Person): PublicKey | null {
  return person.encryptionPublicKeys.find(key => key.useToEncrypt);
}
