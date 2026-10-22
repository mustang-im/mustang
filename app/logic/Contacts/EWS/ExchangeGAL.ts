import { SearchOnlyAddressbook } from "../Addressbook";
import { ContactEntry, type Person } from "../../Abstract/Person";
import type { PublicKey } from "../../Mail/Encryption/PublicKey";
import { AbstractFunction } from "../../util/util";
import type { ArrayColl, Collection } from "svelte-collections";

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
    for (let persons of found) {
      for (let person of persons) {
        // Dedup
        if (results.find(existing => existing.name == person.name &&
            existing.emailAddresses.first?.value == person.emailAddresses.first?.value)) {
          continue;
        }
        results.add(person);
      }
    }
  }

  /** @returns the persons whose fields start with `searchTerm`,
   *   without their S/MIME certificates */
  protected async searchGAL(searchTerm: string): Promise<ArrayColl<Person>> {
    throw new AbstractFunction();
  }

  /** The entries that `findEncryptionKeys()` asked for, by lowercase email address */
  protected readonly certificateLookups = new Map<string, Person>();

  /** Costs a server round trip only once per email address */
  async findEncryptionKeys(emailAddress: string): Promise<Collection<PublicKey>> {
    emailAddress = emailAddress.toLowerCase();
    let person = this.certificateLookups.get(emailAddress);
    if (!person) {
      person = this.newPerson();
      person.emailAddresses.add(new ContactEntry(emailAddress, "work", "mailto"));
      this.certificateLookups.set(emailAddress, person);
    }
    await person.fetchEncryptionKeys();
    return person.encryptionPublicKeys;
  }
}
