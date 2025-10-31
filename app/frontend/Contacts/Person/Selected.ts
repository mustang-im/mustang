import type { Person, ContactEntry } from "../../../logic/Abstract/Person";
import { ArrayColl } from "svelte-collections";
import { writable } from "svelte/store";

export const selectedPerson = writable<Person>(null);
export const selectedContactEntry = writable<ContactEntry>(null);

export const lastPersons = new ArrayColl<Person>();
/*selectedPerson.subscribe(person => {
  lastPersons.remove(person);
  lastPersons.add(person);
});*/
