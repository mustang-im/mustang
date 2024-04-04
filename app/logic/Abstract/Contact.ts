import type { Group } from './Group';
import type { Person } from './Person';
import type { Addressbook } from '../Contacts/Addressbook';
import { Observable, notifyChangedProperty } from '../util/Observable';
import type { URLString } from '../util/util';

export type Contact = Person | Group;

export class ContactBase extends Observable {
  id: string;
  dbID: number;
  addressbook: Addressbook | null;
  @notifyChangedProperty
  name: string;
  @notifyChangedProperty
  picture: URLString | null; /** URL */
}
