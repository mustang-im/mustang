// app first, to resolve the import cycle around Abstract/Account.ts
import "../../../../logic/app";
import { EWSGAL } from "../../../../logic/Contacts/EWS/EWSGAL";
import type { EWSPerson } from "../../../../logic/Contacts/EWS/EWSPerson";
import { ArrayColl } from "svelte-collections";
import { expect, test } from "vitest";

const kPersons = [{
  name: "Ben Bucksch",
  firstName: "Ben",
  lastName: "Bucksch",
  emailAddresses: ["ben@example.com", "sales@example.com"],
}, {
  name: "Sally Smith",
  firstName: "Sally",
  lastName: "Smith",
  emailAddresses: ["sally@example.com"],
}];

/** An account stub which resolves names like Exchange does:
 * Without routing type prefix, it matches the names and the primary email address,
 * with an `smtp:` prefix, it matches all email addresses. Both match only the start. */
function fakeAccount(persons = kPersons): any {
  return {
    errorCallback: (ex: Error) => { throw ex; },
    async callEWS(query: any) {
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

test("Find by an email address which is not the primary one", async () => {
  let results = await search("sales");
  expect(results.length).toBe(1);
  expect(results.first.name).toBe("Ben Bucksch");
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
