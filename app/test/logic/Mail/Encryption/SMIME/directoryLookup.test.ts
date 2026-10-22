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
import { ArrayColl } from "svelte-collections";
import { beforeEach, expect, test } from "vitest";

/** The company directory has a certificate for each of these email addresses */
const kDirectory = [
  "colleague@example.com",
  "colleague@sales.example.com",
  "partner@other.org",
];

/** An Exchange account, which resolves names with an `smtp:` prefix.
 * Its identities have S/MIME certificates. */
function fakeAccount(...identityAddresses: string[]): any {
  let account: any = {
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
  account.identities = new ArrayColl(identityAddresses.map(emailAddress => {
    let identity = new MailIdentity(account);
    identity.emailAddress = emailAddress;
    identity.encryptionPrivateKeys.add(smimeKey());
    return identity;
  }));
  appGlobal.searchOnlyAddressbooks.add(new EWSGAL(account));
  return account;
}

function smimeKey(): SMIMEPrivateKey {
  let key = new SMIMEPrivateKey();
  key.id = "1234567890abcdef";
  key.obsolete = false;
  return key;
}

let account: any;
let gal: EWSGAL;

beforeEach(() => {
  appGlobal.searchOnlyAddressbooks.clear();
  appGlobal.addressbooks.clear();
  account = fakeAccount("me@example.com");
  gal = appGlobal.searchOnlyAddressbooks.first as EWSGAL;
});

/** As the composer does */
async function askDirectories(recipient: PersonUID) {
  await Promise.all(appGlobal.searchOnlyAddressbooks.contents.map(directory =>
    directory.fetchCertificate(recipient)));
}

function personInAddressbook(emailAddress: string): Person {
  let addressbook = new Addressbook();
  appGlobal.addressbooks.add(addressbook);
  let person = addressbook.newPerson();
  person.name = "Contact";
  person.emailAddresses.add(new ContactEntry(emailAddress, "work", "mailto"));
  addressbook.persons.add(person);
  return person;
}

/** The user picked this person from the GAL search results */
function galEntry(emailAddress: string): PersonUID {
  let person = gal.newPerson();
  person.emailAddresses.add(new ContactEntry(emailAddress, "work", "mailto"));
  return PersonUID.fromPerson(person);
}

function canEncryptTo(recipient: PersonUID): boolean {
  return !!getPublicKeyForPersonUID(recipient, SMIMEPublicKey);
}

test("Recipient in our domain, who is in no address book", async () => {
  let recipient = new PersonUID("colleague@example.com", "Colleague");
  await askDirectories(recipient);
  expect(account.queries).toEqual(["smtp:colleague@example.com"]);
  expect(canEncryptTo(recipient)).toBe(true);
});

test("Recipient in our domain, who is in a local address book", async () => {
  personInAddressbook("colleague@example.com");
  let recipient = new PersonUID("colleague@example.com", "Colleague");
  await askDirectories(recipient);
  expect(account.queries).toEqual(["smtp:colleague@example.com"]);
  expect(canEncryptTo(recipient)).toBe(true);
});

test("Recipient in a subdomain of our domain", async () => {
  let recipient = new PersonUID("colleague@sales.example.com", "Colleague");
  await askDirectories(recipient);
  expect(account.queries).toEqual(["smtp:colleague@sales.example.com"]);
  expect(canEncryptTo(recipient)).toBe(true);
});

test("Recipient in another domain is not sent to our server", async () => {
  personInAddressbook("partner@other.org");
  let recipient = new PersonUID("partner@other.org", "Partner");
  await askDirectories(recipient);
  expect(account.queries).toEqual([]);
  expect(canEncryptTo(recipient)).toBe(false);
});

test("GAL entry in our domain", async () => {
  let recipient = galEntry("colleague@example.com");
  await askDirectories(recipient);
  expect(account.queries).toEqual(["smtp:colleague@example.com"]);
  expect(canEncryptTo(recipient)).toBe(true);
});

test("GAL entry in another domain", async () => {
  let recipient = galEntry("partner@other.org");
  await askDirectories(recipient);
  expect(account.queries).toEqual([]);
});

test("Without our own S/MIME certificate, we ask nothing, also not about GAL entries", async () => {
  let identity = account.identities.first as MailIdentity;
  identity.encryptionPrivateKeys.clear();
  let pgpKey = new PGPPrivateKey();
  pgpKey.id = "fedcba0987654321";
  pgpKey.obsolete = false;
  identity.encryptionPrivateKeys.add(pgpKey);
  await askDirectories(galEntry("colleague@example.com"));
  await askDirectories(new PersonUID("colleague@sales.example.com", "Colleague"));
  expect(account.queries).toEqual([]);
});

test("Account with identities in two domains", async () => {
  appGlobal.searchOnlyAddressbooks.clear();
  account = fakeAccount("me@example.com", "me@other.org");
  let recipient = new PersonUID("partner@other.org", "Partner");
  await askDirectories(recipient);
  expect(account.queries).toEqual(["smtp:partner@other.org"]);
  expect(canEncryptTo(recipient)).toBe(true);
});

test("The identity in the domain of the recipient needs an S/MIME certificate", async () => {
  appGlobal.searchOnlyAddressbooks.clear();
  account = fakeAccount("me@example.com", "me@other.org");
  (account.identities.get(1) as MailIdentity).encryptionPrivateKeys.clear();
  await askDirectories(new PersonUID("partner@other.org", "Partner"));
  expect(account.queries).toEqual([]);
});

test("With two Exchange accounts, only the directory of the domain of the recipient is asked", async () => {
  let otherAccount = fakeAccount("me@other.org");
  let recipient = new PersonUID("partner@other.org", "Partner");
  await askDirectories(recipient);
  expect(account.queries).toEqual([]);
  expect(otherAccount.queries).toEqual(["smtp:partner@other.org"]);
  expect(canEncryptTo(recipient)).toBe(true);
});

test("Recipient who already has an S/MIME certificate", async () => {
  let person = personInAddressbook("colleague@example.com");
  let saved = new SMIMEPublicKey();
  saved.id = "1111111111111111";
  saved.obsolete = false;
  person.addEncryptionPublicKey(saved);
  let recipient = new PersonUID("colleague@example.com", "Colleague");
  await askDirectories(recipient);
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
  await askDirectories(recipient);
  expect(account.queries).toEqual(["smtp:colleague@example.com"]);
  expect(canEncryptTo(recipient)).toBe(true);
});

test("Ask the directory only once per email address", async () => {
  // Picking the recipient and then encrypting, then the same recipient in another email
  let first = new PersonUID("colleague@example.com", "Colleague");
  await Promise.all([askDirectories(first), askDirectories(first)]);
  let second = new PersonUID("Colleague@example.com", "Colleague");
  await askDirectories(second);
  expect(account.queries.length).toBe(1);
  expect(canEncryptTo(second)).toBe(true);
});

test("Recipient who is not in the directory", async () => {
  let recipient = new PersonUID("newbie@example.com", "Newbie");
  await askDirectories(recipient); // the error callback would throw
  expect(account.queries).toEqual(["smtp:newbie@example.com"]);
  expect(canEncryptTo(recipient)).toBe(false);
});
