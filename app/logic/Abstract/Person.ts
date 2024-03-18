import { ContactBase } from './Contact';
import { notifyChangedProperty } from '../util/Observable';
import { ArrayColl } from 'svelte-collections';

export class Person extends ContactBase {
  dbID: number;
  @notifyChangedProperty
  firstName: string;
  @notifyChangedProperty
  lastName: string;
  readonly emailAddresses = new ArrayColl<ContactEntry>();
  readonly phoneNumbers = new ArrayColl<ContactEntry>();
  readonly chatAccounts = new ArrayColl<ContactEntry>();
  readonly groups = new ArrayColl<ContactEntry>();
  readonly streetAddresses = new ArrayColl<ContactEntry>();
  @notifyChangedProperty
  notes = "";

  @notifyChangedProperty
  company: string;
  @notifyChangedProperty
  department: string;
  @notifyChangedProperty
  position: string;

  toString() {
    return this.name;
  }
}

export class ContactEntry {
  purpose: string; // "work", "home", "mobile", "other", "Teams", "WhatsApp", or any other text
  value: string; // email address, or phone number etc.
  preferred = false;

  constructor(value: string, purpose: string) {
    this.value = value;
    this.purpose = purpose;
  }
}
