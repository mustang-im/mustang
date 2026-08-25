// The key classes use the app singleton. Importing it first breaks the
// import cycle, which would otherwise leave the base classes undefined.
import "../../../../logic/app";
import { PersonUID } from "../../../../logic/Abstract/PersonUID";
import { getPublicKeyForPersonUID } from "../../../../logic/Mail/Encryption/KeyUtils";
import { SMIMEPublicKey } from "../../../../logic/Mail/Encryption/SMIME/SMIMEPublicKey";
import { PGPPublicKey } from "../../../../logic/Mail/Encryption/PGP/PGPPublicKey";
import { expect, test, describe } from "vitest";

/** The sender signed his email, but he is not in our addressbook,
 * so his certificate is only on the `PersonUID`. */
function signerUID(): PersonUID {
  let uid = new PersonUID("signer@example.com", "Test Signer");
  let key = new SMIMEPublicKey();
  key.id = "1234567890abcdef";
  key.obsolete = false;
  uid.encryptionPublicKey = key;
  return uid;
}

describe("Key of a person who is not in the addressbook", () => {
  test("no key", () => {
    let uid = new PersonUID("nobody@example.com", "Nobody");
    expect(getPublicKeyForPersonUID(uid)).toBe(null);
  });

  test("certificate from the signature of his email", () => {
    let uid = signerUID();
    expect(getPublicKeyForPersonUID(uid)).toBe(uid.encryptionPublicKey);
    expect(getPublicKeyForPersonUID(uid, SMIMEPublicKey)).toBe(uid.encryptionPublicKey);
    expect(getPublicKeyForPersonUID(uid, PGPPublicKey)).toBe(null);
  });

  test("expired certificate", () => {
    let uid = signerUID();
    uid.encryptionPublicKey.obsolete = true;
    expect(getPublicKeyForPersonUID(uid)).toBe(null);
  });
});
