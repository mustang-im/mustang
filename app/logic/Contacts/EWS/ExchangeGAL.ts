import { SearchOnlyAddressbook } from "../Addressbook";
import type { Person } from "../../Abstract/Person";
import { AbstractFunction } from "../../util/util";
import type { ArrayColl } from "svelte-collections";

/** The Global Address List (GAL) of an Exchange server */
export class ExchangeGAL extends SearchOnlyAddressbook {
  /** Exchange matches the start of first name, last name, display name,
   * alias and office, but not reliably the email addresses.
   * With an `smtp:` prefix, it matches the start of all email addresses instead.
   * No Exchange API searches both in one call. */
  async quickSearchAsync(searchTerm: string, results: ArrayColl<Person>) {
    let found = await Promise.all([
      this.searchGAL(searchTerm),
      this.searchGAL("smtp:" + searchTerm),
    ]);
    for (let person of found.flat()) {
      // Dedup
      if (results.find(existing => existing.name == person.name &&
          existing.emailAddresses.first?.value == person.emailAddresses.first?.value)) {
        continue;
      }
      results.add(person);
    }
  }

  /** @returns the persons whose fields start with `searchTerm`,
   *   without their S/MIME certificates */
  protected async searchGAL(searchTerm: string): Promise<Person[]> {
    throw new AbstractFunction();
  }
}
