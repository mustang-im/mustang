import { Contact } from './Contact';
import { Person } from './Person';
import { SetColl } from 'svelte-collections';

export class Group extends Contact {
  description = "";
  participants = new SetColl<Person>();
}
