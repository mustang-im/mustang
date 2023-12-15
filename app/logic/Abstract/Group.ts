import { ContactBase } from './Contact';
import type { Person } from './Person';
import { SetColl } from 'svelte-collections';

export class Group extends ContactBase {
  description = "";
  participants = new SetColl<Person>();
}
