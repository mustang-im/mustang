import type { Addressbook } from "../../logic/Contacts/Addressbook";
import { newPerson, selectedPerson } from "./Person/Selected";
import { appGlobal } from "../../logic/app";
import { assert } from "../../logic/util/util";
import { gt } from "../../l10n/l10n";
import { get } from "svelte/store";

export class ContactsActions {
  static newPerson(addressbook: Addressbook | null) {
    addressbook ??= appGlobal.addressbooks.first;
    assert(addressbook, gt`Please add an addressbook first`);
    let person = get(newPerson);
    if (!person) {
      person = addressbook.newPerson();
      person.name = "";
      person.addressbook = addressbook;
      newPerson.set(person);
    }
    selectedPerson.set(person);
  }
}
