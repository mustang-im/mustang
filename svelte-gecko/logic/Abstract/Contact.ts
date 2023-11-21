import type { Group } from './Group';
import type { Person } from './Person';

export class Contact {
  person: Person;
  group: Group;
  get id() {
    return this.group ? this.group.id : this.person.id;
  }
  get name() {
    return this.group ? this.group.name : this.person.name;
  }
  get picture() {
    return this.group ? this.group.icon : this.person.picture;
  }
}
