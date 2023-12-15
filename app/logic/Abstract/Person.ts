import { ContactBase } from './Contact';
import { ArrayColl } from 'svelte-collections';

export class Person extends ContactBase {
  firstName: string;
  lastName: string;
  emailAddresses = new ArrayColl<ContactEntry>();
  phoneNumbers = new ArrayColl<ContactEntry>();
  chatAccounts = new ArrayColl<ContactEntry>();
  groups = new ArrayColl<ContactEntry>();
  streetAddresses = new ArrayColl<ContactEntry>();
  notes = "";

  company: string;
  department: string;
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
