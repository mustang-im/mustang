import type { Group } from './Group';
import type { Person } from './Person';

export type Contact = Person | Group;

export class ContactBase {
  id: string;
  name: string;
  picture: string; // URL
}
