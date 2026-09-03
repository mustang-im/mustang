// app first, to resolve the import cycle around Abstract/Account.ts
import "../../../../logic/app";
import { OWAGAL } from "../../../../logic/Contacts/OWA/OWAGAL";
import type { OWAPerson } from "../../../../logic/Contacts/OWA/OWAPerson";
import { SMIMEPublicKey } from "../../../../logic/Mail/Encryption/SMIME/SMIMEPublicKey";
import { kCertificate, kCertificateEmailAddress, kSMIMECertificate, kSMIMECertificateEmailAddress } from "../testCertificate";
import { ArrayColl } from "svelte-collections";
import { expect, test } from "vitest";

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

const kPersons = [{
  DisplayName: "Ben Bucksch",
  GivenName: "Ben",
  Surname: "Bucksch",
  emailAddress: "Ben@Example.com", // FindPeople and ResolveNames may differ in case
}, {
  DisplayName: "Sally Smith",
  GivenName: "Sally",
  Surname: "Smith",
  emailAddress: "sally@example.com",
}];

/** An account stub which returns the given GAL entries for any search term, and
 * the certificates that `certificates` and `smimeCertificates` list per person. */
function fakeAccount(
  certificates: Record<string, string[]> = { "ben@example.com": [kCertificate] },
  smimeCertificates: Record<string, string[]> = {},
): any {
  return {
    errorCallback: (ex: Error) => { throw ex; },
    actions: [] as string[],
    async callOWA(request: any) {
      this.actions.push(request.action);
      this.lastRequest = request;
      if (request.action == "FindPeople") {
        return {
          ResultSet: kPersons.map(person => ({
            PersonaId: { Id: person.emailAddress },
            DisplayName: person.DisplayName,
            GivenName: person.GivenName,
            Surname: person.Surname,
            EmailAddresses: [{ EmailAddress: person.emailAddress, RoutingType: "SMTP" }],
          })),
        };
      }
      expect(request.action).toBe("ResolveNames");
      expect(request.Body.ContactDataShape).toBe("AllProperties");
      return {
        ResolutionSet: kPersons.map(person => ({
          Mailbox: {
            Name: person.DisplayName,
            EmailAddress: person.emailAddress.toLowerCase(),
            RoutingType: "SMTP",
          },
          Contact: {
            DisplayName: person.DisplayName,
            UserSMIMECertificate: smimeCertificates[person.emailAddress.toLowerCase()],
            MSExchangeCertificate: certificates[person.emailAddress.toLowerCase()],
          },
        })),
      };
    },
  };
}

async function search(searchTerm: string, account = fakeAccount()): Promise<ArrayColl<OWAPerson>> {
  let gal = new OWAGAL(account);
  let results = new ArrayColl<OWAPerson>();
  await gal.quickSearchAsync(searchTerm, results);
  return results;
}

test("The search itself costs only 1 request, and returns no certificates", async () => {
  let account = fakeAccount();
  let results = await search("bucksch", account);
  expect(account.actions).toEqual(["FindPeople"]);
  expect(results.length).toBe(2);
  expect(results.first.encryptionPublicKeys.length).toBe(0);
});

test("Read the `userCertificate` of the person that the user picked", async () => {
  let account = fakeAccount();
  let person = (await search("bucksch", account)).first;
  await person.fetchEncryptionKeys();
  expect(account.actions).toEqual(["FindPeople", "ResolveNames"]);
  expect(account.lastRequest.Body.UnresolvedEntry).toBe(person.emailAddresses.first.value);
  let key = person.encryptionPublicKeys.first;
  expect(key).toBeInstanceOf(SMIMEPublicKey);
  expect(key.userIDs.first).toBe(kCertificateEmailAddress);
});

test("Prefer `userSMIMECertificate` over `userCertificate`, as RFC 2798 says", async () => {
  let account = fakeAccount(
    { "ben@example.com": [kCertificate] },
    { "ben@example.com": [kSMIMECertificate] });
  let person = (await search("bucksch", account)).first;
  await person.fetchEncryptionKeys();
  expect(person.encryptionPublicKeys.length).toBe(1);
  let key = person.encryptionPublicKeys.first as SMIMEPublicKey;
  expect(key.userIDs.first).toBe(kSMIMECertificateEmailAddress);
  expect(key.chain.length).toBe(1); // the CA which issued the certificate
});

test("Person without a certificate in the GAL", async () => {
  let person = (await search("smith")).getIndex(1);
  expect(person.name).toBe("Sally Smith");
  await person.fetchEncryptionKeys();
  expect(person.encryptionPublicKeys.length).toBe(0);
});

test("Search term which matches no GAL entry at all", async () => {
  let account = fakeAccount();
  account.callOWA = async () => ({ ResultSet: [] });
  expect((await search("nobody", account)).length).toBe(0);
});

test("Certificates are optional, and their failure does not disturb the user", async () => {
  let errors: Error[] = [];
  let account = fakeAccount();
  let findPeople = account.callOWA;
  account.errorCallback = (ex: Error) => errors.push(ex);
  account.callOWA = async function(request: any) {
    if (request.action == "ResolveNames") {
      throw new Error("The operation is not supported");
    }
    return await findPeople.call(this, request);
  };
  let person = (await search("bucksch", account)).first;
  await person.fetchEncryptionKeys();
  expect(person.encryptionPublicKeys.length).toBe(0);
  expect(errors.map(ex => ex.message)).toEqual(["The operation is not supported"]);
});

test("The person is no longer in the GAL", async () => {
  let account = fakeAccount();
  let findPeople = account.callOWA;
  account.callOWA = async function(request: any) {
    if (request.action == "ResolveNames") {
      throw { type: "ErrorNameResolutionNoResults" }; // expected, and not an error for us
    }
    return await findPeople.call(this, request);
  };
  let person = (await search("bucksch", account)).first;
  await person.fetchEncryptionKeys(); // the error callback would throw
  expect(person.encryptionPublicKeys.length).toBe(0);
});
