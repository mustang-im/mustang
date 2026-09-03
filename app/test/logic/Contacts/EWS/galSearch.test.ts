// app first, to resolve the import cycle around Abstract/Account.ts
import "../../../../logic/app";
import { EWSGAL } from "../../../../logic/Contacts/EWS/EWSGAL";
import type { EWSPerson } from "../../../../logic/Contacts/EWS/EWSPerson";
import { SMIMEPublicKey } from "../../../../logic/Mail/Encryption/SMIME/SMIMEPublicKey";
import { kCertificate, kCertificateEmailAddress, kSMIMECertificate, kSMIMECertificateEmailAddress } from "../testCertificate";
import { ArrayColl } from "svelte-collections";
import { expect, test } from "vitest";

const kPersons = [{
  name: "Ben Bucksch",
  firstName: "Ben",
  lastName: "Bucksch",
  emailAddresses: ["ben@example.com", "sales@example.com"],
  smimeCertificates: [kSMIMECertificate],
  certificates: [kCertificate],
}, {
  name: "Sally Smith",
  firstName: "Sally",
  lastName: "Smith",
  emailAddresses: ["sally@example.com"],
  smimeCertificates: [],
  certificates: [],
}, {
  name: "Cathy Chen",
  firstName: "Cathy",
  lastName: "Chen",
  emailAddresses: ["cathy@example.com"],
  smimeCertificates: [],
  certificates: [kCertificate],
}];

/** An account stub which resolves names like Exchange does:
 * Without routing type prefix, it matches the names and the primary email address,
 * with an `smtp:` prefix, it matches all email addresses. Both match only the start. */
function fakeAccount(persons = kPersons): any {
  return {
    errorCallback: (ex: Error) => { throw ex; },
    queries: [] as any[],
    async callEWS(query: any) {
      this.queries.push(query);
      this.lastQuery = query;
      let entry = query.m$ResolveNames.m$UnresolvedEntry.toLowerCase();
      let matches = entry.startsWith("smtp:")
        ? persons.filter(person => person.emailAddresses.some(email => email.startsWith(entry.slice("smtp:".length))))
        : persons.filter(person => [person.name, person.firstName, person.lastName, person.emailAddresses[0]]
          .some(field => field.toLowerCase().startsWith(entry)));
      if (!matches.length) {
        throw { type: "ErrorNameResolutionNoResults" };
      }
      return { ResolutionSet: { Resolution: matches.map(resolutionXML) } };
    },
  };
}

function resolutionXML(person: typeof kPersons[0]): any {
  return {
    Mailbox: {
      Name: person.name,
      EmailAddress: person.emailAddresses[0],
      RoutingType: "SMTP",
    },
    Contact: {
      DisplayName: person.name,
      GivenName: person.firstName,
      Surname: person.lastName,
      EmailAddresses: {
        Entry: person.emailAddresses.map((email, i) => ({
          Key: "EmailAddress" + (i + 1),
          Value: "SMTP:" + email,
        })),
      },
      UserSMIMECertificate: person.smimeCertificates.length ? { Base64Binary: person.smimeCertificates } : undefined,
      MSExchangeCertificate: person.certificates.length ? { Base64Binary: person.certificates } : undefined,
    },
  };
}

async function search(searchTerm: string, account = fakeAccount()): Promise<ArrayColl<EWSPerson>> {
  let gal = new EWSGAL(account);
  let results = new ArrayColl<EWSPerson>();
  await gal.quickSearchAsync(searchTerm, results);
  return results;
}

test("Find by last name", async () => {
  let results = await search("bucksch");
  expect(results.length).toBe(1);
  expect(results.first.name).toBe("Ben Bucksch");
  expect(results.first.emailAddresses.first.value).toBe("ben@example.com");
});

test("An email address which is not the primary one is not found", async () => {
  let results = await search("sales");
  expect(results.length).toBe(0);
});

test("Person matching both name and email address is returned only once", async () => {
  let results = await search("ben");
  expect(results.length).toBe(1);
  expect(results.first.name).toBe("Ben Bucksch");
});

test("No match", async () => {
  let results = await search("nobody");
  expect(results.length).toBe(0);
});

test("Server errors are passed on", async () => {
  let account = fakeAccount();
  account.callEWS = async () => {
    throw { type: "ErrorAccessDenied" };
  };
  await expect(search("ben", account)).rejects.toMatchObject({ type: "ErrorAccessDenied" });
});

test("The search itself costs only 1 request, and returns no certificates", async () => {
  let account = fakeAccount();
  let results = await search("bucksch", account);
  expect(account.queries.length).toBe(1);
  expect(account.lastQuery.m$ResolveNames.ContactDataShape).toBeUndefined();
  expect(results.first.encryptionPublicKeys.length).toBe(0);
});

test("Read the `userCertificate` of the person that the user picked", async () => {
  let account = fakeAccount();
  let person = (await search("cathy", account)).first;
  await person.fetchEncryptionKeys();
  expect(account.queries.length).toBe(2);
  expect(account.lastQuery.m$ResolveNames.m$UnresolvedEntry).toBe(person.emailAddresses.first.value);
  expect(account.lastQuery.m$ResolveNames.ContactDataShape).toBe("AllProperties");
  expect(person.encryptionPublicKeys.length).toBe(1);
  let key = person.encryptionPublicKeys.first;
  expect(key).toBeInstanceOf(SMIMEPublicKey);
  expect(key.userIDs.first).toBe(kCertificateEmailAddress);
  expect((key as SMIMEPublicKey).certificate).toContain("-----BEGIN CERTIFICATE-----");
});

test("Prefer `userSMIMECertificate` over `userCertificate`, as RFC 2798 says", async () => {
  let person = (await search("bucksch")).first;
  await person.fetchEncryptionKeys();
  expect(person.encryptionPublicKeys.length).toBe(1);
  let key = person.encryptionPublicKeys.first as SMIMEPublicKey;
  expect(key.userIDs.first).toBe(kSMIMECertificateEmailAddress);
});

test("Read the certificate chain from `userSMIMECertificate`", async () => {
  let person = (await search("bucksch")).first;
  await person.fetchEncryptionKeys();
  let key = person.encryptionPublicKeys.first as SMIMEPublicKey;
  expect(key.chain.length).toBe(1); // the CA which issued the certificate
  expect(key.chain.first.commonName).toBe("Test SMIME CA");
});

test("Person without a certificate in the GAL", async () => {
  let person = (await search("sally")).first;
  expect(person.name).toBe("Sally Smith");
  await person.fetchEncryptionKeys();
  expect(person.encryptionPublicKeys.length).toBe(0);
});

test("Certificates are optional, and their failure does not disturb the user", async () => {
  let errors: Error[] = [];
  let account = fakeAccount();
  account.errorCallback = (ex: Error) => errors.push(ex);
  let person = (await search("bucksch", account)).first;
  account.callEWS = async () => {
    throw new Error("The operation is not supported");
  };
  await person.fetchEncryptionKeys();
  expect(person.encryptionPublicKeys.length).toBe(0);
  expect(errors.map(ex => ex.message)).toEqual(["The operation is not supported"]);
});

test("The person is no longer in the GAL", async () => {
  let account = fakeAccount();
  let person = (await search("bucksch", account)).first;
  account.callEWS = async () => {
    throw { type: "ErrorNameResolutionNoResults" }; // expected, and not an error for us
  };
  await person.fetchEncryptionKeys(); // the error callback would throw
  expect(person.encryptionPublicKeys.length).toBe(0);
});

test("Broken certificates are skipped", async () => {
  let account = fakeAccount([{
    name: "Ben Bucksch",
    firstName: "Ben",
    lastName: "Bucksch",
    emailAddresses: ["ben@example.com"],
    smimeCertificates: [],
    certificates: ["Not a certificate"],
  }]);
  account.errorCallback = () => undefined; // the error is reported, not thrown
  let person = (await search("bucksch", account)).first;
  await person.fetchEncryptionKeys();
  expect(person.encryptionPublicKeys.length).toBe(0);
});

test("Broken `userSMIMECertificate` falls back to `userCertificate`", async () => {
  let account = fakeAccount([{
    name: "Ben Bucksch",
    firstName: "Ben",
    lastName: "Bucksch",
    emailAddresses: ["ben@example.com"],
    smimeCertificates: ["Not a PKCS#7 blob"],
    certificates: [kCertificate],
  }]);
  account.errorCallback = () => undefined; // the error is reported, not thrown
  let person = (await search("bucksch", account)).first;
  await person.fetchEncryptionKeys();
  expect(person.encryptionPublicKeys.length).toBe(1);
  expect(person.encryptionPublicKeys.first.userIDs.first).toBe(kCertificateEmailAddress);
});
