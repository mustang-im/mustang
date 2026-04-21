import type { Person } from "../Abstract/Person";
import { PersonUID } from "../Abstract/PersonUID";
import { ArrayColl, type Collection } from "svelte-collections";
import { appGlobal } from "../app";

/** Search all address books and server-based query-only address books for
 * a person whose name or email address matches the search string.
 * @throws in case of error */
export async function searchContacts(searchStr: string, skip: Collection<PersonUID>): Promise<PersonUID[]> {
  if (!searchStr || searchStr.length < 2) {
    return [];
  }
  let searchStrParts = searchStr.toLowerCase().split(" ");
  let persons: Person[] = [];
  for (let ab of appGlobal.addressbooks) {
    persons.push(...ab.persons.filterOnce(person => searchStrParts.every(inputPart =>
      person.name?.toLowerCase().includes(inputPart) ||
      person.emailAddresses.some(c => c.value?.toLowerCase().includes(inputPart)))));
  }
  await Promise.all(appGlobal.searchOnlyAddressbooks.map(async ab => {
    let results = new ArrayColl<Person>;
    await ab.quickSearchAsync(searchStr.toLowerCase(), results);
    persons = persons.concat(results.contents);
  }));
  let emailAddresses: PersonUID[] = [];
  for (let person of persons) {
    for (let c of person.emailAddresses.sortBy(c => c.preference)) {
      let n = new PersonUID(c.value, person.name);
      n.person = person;
      if (emailAddresses.find(e => e.emailAddress == n.emailAddress && e.name == n.name) ||
        skip.find(e => e.emailAddress == n.emailAddress)) {
        continue;
      }
      emailAddresses.push(n);
    }
  }
  console.log("Got", persons.length, "persons with ", emailAddresses.length, "email addresses for", searchStr);
  return emailAddresses;
}
