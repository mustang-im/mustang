import type { Group } from './Group';
import type { Person } from './Person';

export class Contact {
  isGroup = false;
  person: Person;
  group: Group;
  get id() {
    return this.isGroup ? this.group.id : this.person.id;
  }
  get name() {
    return this.isGroup ? this.group.name : this.person.name;
  }
  get picture() {
    return this.isGroup ? this.group.icon : this.person.picture;
  }
}
