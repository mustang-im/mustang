import { ArrayColl } from 'svelte-collections';

export class Person {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  emailAddresses = new ArrayColl<ContactEntry>();
  phoneNumbers = new ArrayColl<ContactEntry>();
  notes: string;
  picture: string; // URL
}

export class ContactEntry {
  purpose: string; // "work", "home", "mobile", "other", or any other text
  value: string; // email address, or phone number etc.

  constructor(value: string, purpose: string) {
    this.value = value;
    this.purpose = purpose;
  }
}
