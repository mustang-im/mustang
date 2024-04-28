import type { Person } from "../../../logic/Abstract/Person";
import { writable } from "svelte/store";

export const selectedPerson = writable<Person>(null);
