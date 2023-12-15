import type { Person } from "../../../logic/Abstract/Person";
import { writable } from "svelte/store";

export interface PersonOrGroup {
  id: string;
  name: string;
  picture: string; /** URL */
}

export const selectedPerson = writable<Person>(null);
