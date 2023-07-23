import { Person } from './Person';
import { SetColl } from 'svelte-collections';

export class Group {
  id: string;
  name: string;
  description = "";
  participants = new SetColl<Person>();
  icon: string; // URL
}
