// app first, to resolve the import cycle around Abstract/Account.ts
import "../../../../../logic/app";
import { appGlobal } from "../../../../../logic/app";
import { MailIdentity } from "../../../../../logic/Mail/MailIdentity";
import { EWSGAL } from "../../../../../logic/Contacts/EWS/EWSGAL";
import { Addressbook } from "../../../../../logic/Contacts/Addressbook";
import { ContactEntry, type Person } from "../../../../../logic/Abstract/Person";
import { PersonUID } from "../../../../../logic/Abstract/PersonUID";
import { getPublicKeyForPersonUID } from "../../../../../logic/Mail/Encryption/KeyUtils";
import { SMIMEPrivateKey } from "../../../../../logic/Mail/Encryption/SMIME/SMIMEPrivateKey";
import { SMIMEPublicKey } from "../../../../../logic/Mail/Encryption/SMIME/SMIMEPublicKey";
import { PGPPrivateKey } from "../../../../../logic/Mail/Encryption/PGP/PGPPrivateKey";
import { kSMIMECertificate } from "../../../Contacts/testCertificate";
import { beforeEach, expect, test } from "vitest";

/** The company directory has a certificate for each of these email addresses */
const kDirectory = [
  "colleague@example.com",
  "colleague@sales.example.com",
  "partner@other.org",
];

/** An Exchange account, which resolves names with an `smtp:` prefix */
function fakeAccount(): any {
  return {
    errorCallback: (ex: Error) => { throw ex; },
    queries: [] as string[],
    async callEWS(query: any) {
      let entry = query.m$ResolveNames.m$UnresolvedEntry.toLowerCase();
      this.queries.push(entry);
      let matches = kDirectory.filter(emailAddress => "smtp:" + emailAddress == entry);
      if (!matches.length) {
        throw { type: "ErrorNameResolutionNoResults" };
      }
      return {
        ResolutionSet: {
          Resolution: matches.map(emailAddress => ({
            Mailbox: { EmailAddress: emailAddress, RoutingType: "SMTP" },
            Contact: { UserSMIMECertificate: { Base64Binary: [kSMIMECertificate] } },
          })),
        },
      };
    },
  };
}

function smimeKey(): SMIMEPrivateKey {
  let key = new SMIMEPrivateKey();
  key.id = "1234567890abcdef";
  key.obsolete = false;
  return key;
}

let account: any;
let gal: EWSGAL;
let identity: MailIdentity;

beforeEach(() => {
  appGlobal.searchOnlyAddressbooks.clear();
  appGlobal.addressbooks.clear();
  account = fakeAccount();
  gal = new EWSGAL(account);
  appGlobal.searchOnlyAddressbooks.add(gal);
  identity = new MailIdentity(account);
  identity.emailAddress = "me@example.com";
  identity.encryptionPrivateKeys.add(smimeKey());
});

function personInAddressbook(emailAddress: string): Person {
  let addressbook = new Addressbook();
  appGlobal.addressbooks.add(addressbook);
  let person = addressbook.newPerson();
  person.name = "Contact";
  person.emailAddresses.add(new ContactEntry(emailAddress, "work", "mailto"));
  addressbook.persons.add(person);
  return person;
}

function canEncryptTo(recipient: PersonUID): boolean {
  return !!getPublicKeyForPersonUID(recipient, SMIMEPublicKey);
}

test("Recipient in our domain, who is in no address book", async () => {
  let recipient = new PersonUID("colleague@example.com", "Colleague");
  await identity.fetchCertificateFromDirectory(recipient);
  expect(account.queries).toEqual(["smtp:colleague@example.com"]);
  expect(canEncryptTo(recipient)).toBe(true);
});

test("Recipient in our domain, who is in a local address book", async () => {
  personInAddressbook("colleague@example.com");
  let recipient = new PersonUID("colleague@example.com", "Colleague");
  await identity.fetchCertificateFromDirectory(recipient);
  expect(account.queries).toEqual(["smtp:colleague@example.com"]);
  expect(canEncryptTo(recipient)).toBe(true);
});

test("Recipient in a subdomain of our domain", async () => {
  let recipient = new PersonUID("colleague@sales.example.com", "Colleague");
  await identity.fetchCertificateFromDirectory(recipient);
  expect(account.queries).toEqual(["smtp:colleague@sales.example.com"]);
  expect(canEncryptTo(recipient)).toBe(true);
});

test("Recipient in another domain is not sent to our server", async () => {
  personInAddressbook("partner@other.org");
  let recipient = new PersonUID("partner@other.org", "Partner");
  await identity.fetchCertificateFromDirectory(recipient);
  expect(account.queries).toEqual([]);
  expect(canEncryptTo(recipient)).toBe(false);
});

test("Directory entry is asked in its own directory, whatever its domain", async () => {
  let person = gal.newPerson();
  person.emailAddresses.add(new ContactEntry("partner@other.org", "work", "mailto"));
  let recipient = PersonUID.fromPerson(person);
  await identity.fetchCertificateFromDirectory(recipient);
  expect(account.queries).toEqual(["smtp:partner@other.org"]);
  expect(canEncryptTo(recipient)).toBe(true);
});

test("Without our own S/MIME certificate, we ask nothing, also not for directory entries", async () => {
  identity.encryptionPrivateKeys.clear();
  let pgpKey = new PGPPrivateKey();
  pgpKey.id = "fedcba0987654321";
  pgpKey.obsolete = false;
  identity.encryptionPrivateKeys.add(pgpKey);
  let galPerson = gal.newPerson();
  galPerson.emailAddresses.add(new ContactEntry("colleague@example.com", "work", "mailto"));
  await identity.fetchCertificateFromDirectory(PersonUID.fromPerson(galPerson));
  await identity.fetchCertificateFromDirectory(new PersonUID("colleague@sales.example.com", "Colleague"));
  expect(account.queries).toEqual([]);
});

test("Recipient who already has an S/MIME certificate", async () => {
  let person = personInAddressbook("colleague@example.com");
  let saved = new SMIMEPublicKey();
  saved.id = "1111111111111111";
  saved.obsolete = false;
  person.addEncryptionPublicKey(saved);
  let recipient = new PersonUID("colleague@example.com", "Colleague");
  await identity.fetchCertificateFromDirectory(recipient);
  expect(account.queries).toEqual([]);
  expect(getPublicKeyForPersonUID(recipient, SMIMEPublicKey)).toBe(saved);
});

test("Recipient whose saved certificate expired gets the current one", async () => {
  let person = personInAddressbook("colleague@example.com");
  let expired = new SMIMEPublicKey();
  expired.id = "1111111111111111";
  expired.obsolete = true;
  person.addEncryptionPublicKey(expired);
  let recipient = new PersonUID("colleague@example.com", "Colleague");
  await identity.fetchCertificateFromDirectory(recipient);
  expect(account.queries).toEqual(["smtp:colleague@example.com"]);
  expect(canEncryptTo(recipient)).toBe(true);
});

test("Ask the directory only once per email address", async () => {
  // Picking the recipient and then encrypting, then the same recipient in another email
  let first = new PersonUID("colleague@example.com", "Colleague");
  await Promise.all([
    identity.fetchCertificateFromDirectory(first),
    identity.fetchCertificateFromDirectory(first),
  ]);
  let second = new PersonUID("Colleague@example.com", "Colleague");
  await identity.fetchCertificateFromDirectory(second);
  expect(account.queries.length).toBe(1);
  expect(canEncryptTo(second)).toBe(true);
});

test("Recipient who is not in the directory", async () => {
  let recipient = new PersonUID("newbie@example.com", "Newbie");
  await identity.fetchCertificateFromDirectory(recipient); // the error callback would throw
  expect(account.queries).toEqual(["smtp:newbie@example.com"]);
  expect(canEncryptTo(recipient)).toBe(false);
});

test("Shared account asks the directory of the account which logs in", async () => {
  let sharedAccount: any = { mainAccount: account };
  let sharedIdentity = new MailIdentity(sharedAccount);
  sharedIdentity.emailAddress = "team@example.com";
  sharedIdentity.encryptionPrivateKeys.add(smimeKey());
  let recipient = new PersonUID("colleague@example.com", "Colleague");
  await sharedIdentity.fetchCertificateFromDirectory(recipient);
  expect(account.queries).toEqual(["smtp:colleague@example.com"]);
  expect(canEncryptTo(recipient)).toBe(true);
});

test("Account without directory", async () => {
  let otherIdentity = new MailIdentity({} as any);
  otherIdentity.emailAddress = "me@example.com";
  otherIdentity.encryptionPrivateKeys.add(smimeKey());
  let recipient = new PersonUID("colleague@example.com", "Colleague");
  await otherIdentity.fetchCertificateFromDirectory(recipient);
  expect(account.queries).toEqual([]);
  expect(canEncryptTo(recipient)).toBe(false);
});
