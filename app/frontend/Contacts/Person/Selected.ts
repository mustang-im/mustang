import type { Person, ContactEntry } from "../../../logic/Abstract/Person";
import { AppWindow } from "../../MainWindow/AppWindow";
import { ArrayColl } from "svelte-collections";
import { writable } from "svelte/store";

export function getContactsSelection(appWindow = AppWindow.current()) {
  return appWindow.uiState(createContactsSelection);
}

function createContactsSelection() {
  return {
    selectedPerson: writable<Person>(null),
    selectedContactEntry: writable<ContactEntry>(null),
    newPerson: writable<Person>(null),
    lastPersons: new ArrayColl<Person>(),
  };
}
/*selectedPerson.subscribe(person => {
  lastPersons.remove(person);
  lastPersons.add(person);
});*/
