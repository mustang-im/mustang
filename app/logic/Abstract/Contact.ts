import type { Group } from './Group';
import type { Person } from './Person';
import { Observable, notifyChangedProperty } from '../util/Observable';

export type Contact = Person | Group;

export class ContactBase extends Observable {
  id: string;
  @notifyChangedProperty
  name: string;
  @notifyChangedProperty
  picture: string; // URL
}
