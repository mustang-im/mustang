import { ArrayColl } from 'svelte-collections';

export class Person {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  emailAddresses = new ArrayColl<ContactEntry>();
  phoneNumbers = new ArrayColl<ContactEntry>();
  chatAccount = new ArrayColl<ContactEntry>();
  groups = new ArrayColl<ContactEntry>();
  notes = "";
  picture: string; // URL

  toString() {
    return this.name;
  }
}

export class ContactEntry {
  purpose: string; // "work", "home", "mobile", "other", or any other text
  value: string; // email address, or phone number etc.
  preferred = false;

  constructor(value: string, purpose: string) {
    this.value = value;
    this.purpose = purpose;
  }
}
