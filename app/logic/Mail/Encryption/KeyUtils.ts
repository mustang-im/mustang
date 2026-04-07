import type { PublicKey } from "./PublicKey";
import type { PrivateKey } from "./PrivateKey";
import type { Person } from "../../Abstract/Person";
import type { PersonUID } from "../../Abstract/PersonUID";
import { PGPPrivateKey } from "./PGP/PGPPrivateKey";
import { PGPPublicKey } from "./PGP/PGPPublicKey";
import { readAutoCryptKeys } from "./PGP/AutoCrypt";
import type { EMail } from "../EMail";
import { findAllIdentities, type MailIdentity } from "../MailIdentity";
import { appGlobal } from "../../app";
import { UserError, assert } from "../../util/util";
import { gt } from "../../../l10n/l10n";

export async function getPublicKeyByKeyID(id: string | null, email?: EMail): Promise<PublicKey | null> {
  if (!id) {
    return null;
  }
  if (email?.from) {
    let person = email.from.findPerson();
    if (person) {
      for (let key of person.encryptionPublicKeys.each) {
        if (key.id == id) {
          return key;
        }
      }
    }
  } else {
    for (let person of appGlobal.persons.each) {
      for (let key of person.encryptionPublicKeys.each) {
        if (key.id == id) {
          return key;
        }
      }
    }
  }
  for (let identity of findAllIdentities()) {
    for (let key of identity.encryptionPrivateKeys.each) {
      if (key.id == id) {
        return key;
      }
    }
  }
  if (email) {
    return await readAutoCryptKeys(email);
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

export function addPublicKeyToPersonUID(uid: PersonUID, key: PublicKey) {
  let person = uid.createPerson(appGlobal.collectedAddressbook);
  assert(person, "Need person");
  if (person.encryptionPublicKeys.find(key => key.id == key.id)) {
    return;
  }
  person.encryptionPublicKeys.add(key);
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

/** Take base64, and add "-----BEGIN FOO ---" and "-----END FOO ----"
 * This is the opposite of `extractBase64FromArmorned()`
 * @param headerType FOO above, e.g. "PGP PUBLIC KEY BLOCK"
 * @returns the ASCII-armored key file */
export function addArmorHeader(base64: string, headerType: string) {
  return "-----BEGIN " + headerType + "-----\n\n" +
    base64 +
    "\n-----END " + headerType + "-----\n";
}
