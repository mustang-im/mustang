import { ContactBase } from './Contact';
import type { Person } from './Person';
import { notifyChangedProperty } from '../util/Observable';
import { SetColl } from 'svelte-collections';

export class Group extends ContactBase {
  @notifyChangedProperty
  description = "";
  readonly participants = new SetColl<Person>();
}
