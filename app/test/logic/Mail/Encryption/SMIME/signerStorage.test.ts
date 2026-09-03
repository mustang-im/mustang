import "../../../../../logic/app";
import { setupTestFolder } from "../../SQL/setup";
import { appGlobal } from "../../../../../logic/app";
import { getPublicKeyByKeyID } from "../../../../../logic/Mail/Encryption/KeyUtils";
import { SQLEMail } from "../../../../../logic/Mail/SQL/SQLEMail";
import { Addressbook } from "../../../../../logic/Contacts/Addressbook";
import type { EMail } from "../../../../../logic/Mail/EMail";
import type { Folder } from "../../../../../logic/Mail/Folder";
import { kClearSigned } from "./signedMessages";
import { expect, test, describe } from "vitest";

// The browser has this, but Node does not.
globalThis.indexedDB ??= {
  cmp(a: Uint8Array, b: Uint8Array): number {
    let length = Math.min(a.length, b.length);
    for (let i = 0; i < length; i++) {
      if (a[i] != b[i]) {
        return a[i] < b[i] ? -1 : 1;
      }
    }
    return Math.sign(a.length - b.length);
  },
} as any;

/** Keeps the MIME source, as `MailDir` does on disk */
class TestMailStore {
  supportsAttachments = true;
  protected readonly mime = new Map<number, Uint8Array>();
  async save(email: EMail) {
    this.mime.set(email.dbID, email.mime);
  }
  async read(email: EMail) {
    email.mime = this.mime.get(email.dbID);
  }
  async deleteIt() {
  }
}

async function readAndSaveSignedMessage(folder: Folder): Promise<EMail> {
  let email = folder.newEMail();
  email.received = new Date();
  email.mime = new TextEncoder().encode(kClearSigned.replace(/\n/g, "\r\n"));
  await email.parseMIME();
  await SQLEMail.save(email);
  return email;
}

/** The message as the reader gets it after a restart */
async function reread(email: EMail): Promise<EMail> {
  let fromDB = email.folder.newEMail();
  await SQLEMail.read(email.dbID, fromDB);
  expect(fromDB.mime).toBeFalsy();
  return fromDB;
}

describe("The key of a sender who is not in the addressbook", () => {
  test("is stored with the message, and read back on demand", async () => {
    let { folder } = await setupTestFolder({ getCACertificates: async () => [] });
    let email = await readAndSaveSignedMessage(folder);
    expect(email.signedKey).toBeTruthy();

    let fromDB = await reread(email);
    expect(fromDB.signedByKeyID).toBe(email.signedByKeyID);
    expect(fromDB.signedKey).toBe(null); // not parsed while merely reading
    expect(fromDB.signedKeyJSON).toBeTruthy();

    let signingKey = await getPublicKeyByKeyID(fromDB.signedByKeyID, fromDB);
    expect(signingKey.id).toBe(email.signedKey.id);
    expect(signingKey.userIDs.contents).toEqual(["alice@example.com"]);
    expect(fromDB.signedKey).toBe(signingKey); // parsed only once
  });

  test("is read from the message itself, for messages that predate this", async () => {
    let { folder } = await setupTestFolder({ getCACertificates: async () => [] });
    folder.account.contentStorage.add(new TestMailStore());
    let email = await readAndSaveSignedMessage(folder);
    await folder.account.contentStorage.first.save(email);

    let fromDB = await reread(email);
    fromDB.signedKeyJSON = null; // an older message, stored without the key

    let signingKey = await getPublicKeyByKeyID(fromDB.signedByKeyID, fromDB);
    expect(signingKey.id).toBe(email.signedKey.id);
    // stored now, so that we do not read the message again
    expect(await reread(email)).toHaveProperty("signedKeyJSON.id", signingKey.id);
  });

  test("is not duplicated, once the contact has it", async () => {
    let { folder } = await setupTestFolder({ getCACertificates: async () => [] });
    let addressbook = new Addressbook();
    appGlobal.addressbooks.add(addressbook);
    let email = await readAndSaveSignedMessage(folder);

    // As "Add to addressbook" does it
    let alice = email.from.createPerson(addressbook);
    alice.addEncryptionPublicKey(email.signedKey);
    await SQLEMail.save(email);

    let fromDB = await reread(email);
    expect(fromDB.signedKeyJSON).toBe(null);
    let signingKey = await getPublicKeyByKeyID(fromDB.signedByKeyID, fromDB);
    expect(signingKey).toBe(alice.encryptionPublicKeys.first);
  });
});
