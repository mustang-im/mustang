import type { Contact } from "../../logic/Abstract/Contact";
import { Person } from "../../logic/Abstract/Person";
import type { Addressbook } from "../../logic/Contacts/Addressbook";
import { ArrayColl, mergeColls, type Collection } from "svelte-collections";
import { ContactSearchScope, type ContactSearchOptions } from "./Person/Selected";

export class ContactSearch {
  static defaultOptions(scope: ContactSearchScope): ContactSearchOptions {
    return {
      term: null,
      scope,
      hasPhoneNumber: false,
      hasAddress: false,
      hasEMailAddress: false,
    };
  }

  static hasRefiners(options: ContactSearchOptions): boolean {
    return options.hasPhoneNumber || options.hasAddress || options.hasEMailAddress;
  }

  static search(addressbooks: Iterable<Addressbook>, searchTerm: string): Collection<Contact> {
    searchTerm = searchTerm.toLowerCase();
    let results = new ArrayColl<Collection<Contact>>();
    for (let addressbook of addressbooks) {
      results.add(addressbook.quickSearch(searchTerm, true));
      results.add(addressbook.groups.filterOnce(group => group.name?.toLowerCase().includes(searchTerm)));
    }
    return mergeColls(results);
  }

  static matchesRefiners(contact: Contact, options: ContactSearchOptions): boolean {
    if (!(contact instanceof Person)) {
      return false;
    }
    return (!options.hasPhoneNumber || contact.phoneNumbers.hasItems) &&
      (!options.hasAddress || contact.streetAddresses.hasItems) &&
      (!options.hasEMailAddress || contact.emailAddresses.hasItems);
  }
}
