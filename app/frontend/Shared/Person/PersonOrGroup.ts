import type { Person } from "../../../logic/Abstract/Person";
import type { IObservable } from "../../../logic/util/Observable";
import { writable } from "svelte/store";

export interface PersonOrGroup extends IObservable {
  id: string;
  name: string;
  picture: string; /** URL */
}

export const selectedPerson = writable<Person>(null);
