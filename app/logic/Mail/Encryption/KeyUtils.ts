import type { PublicKey } from "./PublicKey";
import type { PrivateKey } from "./PrivateKey";
import type { Person } from "../../Abstract/Person";
import type { MailIdentity } from "../MailIdentity";
import { appGlobal } from "../../app";
import { UserError, assert } from "../../util/util";
import { gt } from "../../../l10n/l10n";
import { PGPPrivateKey } from "./PGP/PGPPrivateKey";
import { PGPPublicKey } from "./PGP/PGPPublicKey";

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

/** For composer, which recipient key to use for encrypting the outgoing email */
export function getPublicKeyForPerson<T extends PublicKey>(person: Person, keyType?: new () => T): T | null {
  if (!person || person.encryptionPublicKeys.isEmpty) {
    return null;
  }
  let keys = person.encryptionPublicKeys.filterOnce(key => !key.obsolete && (!keyType || key instanceof keyType));
  return (keys.find(key => key.encryptByDefault) ?? keys.first) as T;
}

/** For composer, which own key to use for signing the outgoing email */
export function getMyPrivateKey<T extends PublicKey & PrivateKey>(identity: MailIdentity, keyType?: new () => T): T | null {
  if (identity.encryptionPrivateKeys.isEmpty) {
    return null;
  }
  let keys = identity.encryptionPrivateKeys.filterOnce(key => !key.obsolete && (!keyType || key instanceof keyType));
  return (keys.find(key => key.encryptByDefault && key.useToSign) ??
    keys.find(key => key.useToSign) ??
    keys.first) as T | null;
}

export async function importPrivateKey(fileContent: string, passphrase: string): Promise<PublicKey & PrivateKey> {
  assert(fileContent.includes("---BEGIN ") && fileContent.includes("---END "), gt`Could not find a key in this file`);
  assert(!fileContent.includes("PUBLIC KEY"), gt`This is a public key. If this is your key, you should also have the secret key in another file.`);
  if (fileContent.includes("-----BEGIN PGP PRIVATE KEY BLOCK-----")) {
    return await PGPPrivateKey.importPrivateKey(fileContent, passphrase);
  } else if (fileContent.includes("-----BEGIN PRIVATE KEY BLOCK-----")) {
  }
  throw new UserError(gt`Could not find a key in this file`);
}

export async function importPublicKey(fileContent: string): Promise<PublicKey> {
  assert(fileContent.includes("---BEGIN ") && fileContent.includes("---END "), gt`Could not find a key in this file`);
  assert(!fileContent.includes("PRIVATE KEY"), gt`This is a secret key. If this is your key, go to Settings | Mail | Identity | Encryption and import it there.`);
  if (fileContent.includes("-----BEGIN PGP PUBLIC KEY BLOCK-----")) {
    return await PGPPublicKey.importPublicKey(fileContent);
  } else if (fileContent.includes("-----BEGIN PUBLIC KEY BLOCK-----")) {
  }
  throw new UserError(gt`Could not find a key in this file`);
}


/**
 * Takes an armored public or private key, and returns the base64 content of it
 * Works for PGP private and public keys, and S/MIME certificates, if ASCII-armored.
 * @returns base64-encoded key
 */
export function extractBase64FromArmorned(armored: string): string {
  let lines = armored.trim().split("\n");
  assert(lines[0].startsWith("-----BEGIN"), "Not an armored key: BEGIN line missing");
  let bodyStartIndex = lines.findIndex(line => line.trim() === "") + 1;
  let footerIndex = lines.findIndex(line => line.startsWith("-----END "));
  let bodyLines = lines
    .slice(bodyStartIndex, footerIndex)
    .filter(line => !line.startsWith("=")); // exclude checksum line (starts with "=")
  return bodyLines.join("").replace(/\s/g, "");
}
