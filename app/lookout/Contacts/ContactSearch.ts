import type { Contact } from "../../logic/Abstract/Contact";
import type { Addressbook } from "../../logic/Contacts/Addressbook";
import { ArrayColl, mergeColls, type Collection } from "svelte-collections";

export class ContactSearch {
  static search(addressbooks: Iterable<Addressbook>, searchTerm: string): Collection<Contact> {
    searchTerm = searchTerm.toLowerCase();
    let results = new ArrayColl<Collection<Contact>>();
    for (let addressbook of addressbooks) {
      results.add(addressbook.quickSearch(searchTerm, true));
      results.add(addressbook.groups.filterOnce(group => group.name?.toLowerCase().includes(searchTerm)));
    }
    return mergeColls(results);
  }
}
