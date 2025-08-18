import type { Person, ContactEntry } from "../../../logic/Abstract/Person";
import { writable } from "svelte/store";

export const selectedPerson = writable<Person>(null);
export const selectedContactEntry = writable<ContactEntry>(null);
