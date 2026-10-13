// @vitest-environment happy-dom
// The key classes use the app singleton. Importing it first breaks the
// import cycle, which would otherwise leave the base classes undefined.
import "../../../../logic/app";
import { PersonUID } from "../../../../logic/Abstract/PersonUID";
import { setUpAccount, type TestMailAccount } from "../TestMailAccount";
import { SpecialFolder } from "../../../../logic/Mail/Folder";
import { getEncryptionSystem, getPublicKeyForPersonUID } from "../../../../logic/Mail/Encryption/KeyUtils";
import { EncryptionSystem } from "../../../../logic/Mail/Encryption/enums";
import { SMIMEPublicKey } from "../../../../logic/Mail/Encryption/SMIME/SMIMEPublicKey";
import { SMIMEPrivateKey } from "../../../../logic/Mail/Encryption/SMIME/SMIMEPrivateKey";
import { PGPPublicKey } from "../../../../logic/Mail/Encryption/PGP/PGPPublicKey";
import { PGPPrivateKey } from "../../../../logic/Mail/Encryption/PGP/PGPPrivateKey";
import type { EMail } from "../../../../logic/Mail/EMail";
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

/** Our identity has this one secret key */
function accountWithMyKey(myKey: PGPPrivateKey | SMIMEPrivateKey): TestMailAccount {
  let account = setUpAccount();
  myKey.id = "1234567890abcdef";
  myKey.obsolete = false;
  myKey.useToSign = true;
  account.identities.first.encryptionPrivateKeys.add(myKey);
  return account;
}

/** The signer sent us this with S/MIME */
function signedMail(account: TestMailAccount): EMail {
  let mail = account.getSpecialFolder(SpecialFolder.Inbox).newEMail();
  mail.from = signerUID();
  mail.sent = mail.received = new Date();
  mail.html = "<p>Please encrypt</p>";
  mail.system = EncryptionSystem.SMIME;
  return mail;
}

describe("Encryption system of the outgoing email", () => {
  test("new email uses our own key", () => {
    expect(getEncryptionSystem(accountWithMyKey(new PGPPrivateKey()).identities.first.newEMailFrom()))
      .toBe(EncryptionSystem.PGP);
    expect(getEncryptionSystem(accountWithMyKey(new SMIMEPrivateKey()).identities.first.newEMailFrom()))
      .toBe(EncryptionSystem.SMIME);
  });

  test("new email, and we have no key", () => {
    expect(getEncryptionSystem(setUpAccount().identities.first.newEMailFrom())).toBe(null);
  });

  test("reply and forward answer S/MIME with S/MIME, even if we prefer PGP", async () => {
    let original = signedMail(accountWithMyKey(new PGPPrivateKey()));
    expect(getEncryptionSystem(original.compose.replyToAuthor())).toBe(EncryptionSystem.SMIME);
    expect(getEncryptionSystem(await original.compose.forwardInline())).toBe(EncryptionSystem.SMIME);
  });
});
