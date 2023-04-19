import { ArrayColl } from 'svelte-collections';

export class Person {
  name: string;
  firstName: string;
  lastName: string;
  emailAddresses = new ArrayColl<string>();
  phoneNumbers = new ArrayColl<string>();
  notes: string;
  picture: string; // URL
}
