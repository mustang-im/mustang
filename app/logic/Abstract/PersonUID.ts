import type { Person } from "../Abstract/Person";
import { appGlobal } from "../app";

export class PersonUID {
  name: string;
  /** or user ID, for chat and other systems (despite the property name) */
  emailAddress: string;
  person?: Person;

  static fromPerson(person: Person) {
    let puid = new PersonUID();
    puid.name = person.name;
    puid.emailAddress = person.emailAddresses.first?.value;
    puid.person = person;
    return puid;
  }

  findPerson() {
    if (this.person) {
      return;
    }
    this.person = findPerson(this.emailAddress, this.name);
  }

  toString() {
    return this.name + " <" + this.emailAddress + ">";
  }
}

export function findOrCreatePersonUID(emailAddress: string, realname: string): PersonUID {
  /* TODO what if the person or email address is later added to the personal address book?
    How to replace the existing Person object references? */
  let existing = findPerson(emailAddress, realname);
  if (existing) {
    return PersonUID.fromPerson(existing);
  }
  let puid = new PersonUID();
  puid.emailAddress = emailAddress;
  puid.name = realname ?? emailAddress;
  return puid;
}

export function findPerson(emailAddress: string, realname: string): Person | undefined {
  let existing = appGlobal.persons.find(p => p.emailAddresses.some(e => e.value == emailAddress));
  if (existing) {
    return existing;
  }
  return undefined;
}
