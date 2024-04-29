import type { PersonOrGroup } from "../../frontend/Shared/Person/PersonOrGroup";
import { Group } from "./Group";
import { Person } from "./Person";
import { appGlobal } from "../app";

export class PersonUID {
  name: string;
  /** or user ID, for chat and other systems (despite the property name) */
  emailAddress: string;
  person?: Person;

  constructor(emailAddress?: string, name?: string) {
    this.emailAddress = emailAddress;
    this.name = name;
  }

  static fromPerson(person: Person) {
    let puid = new PersonUID(person.emailAddresses.first?.value, person.name);
    puid.person = person;
    return puid;
  }

  findPerson() {
    if (this.person) {
      return this.person;
    }
    return this.person = findPerson(this.emailAddress, this.name);
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
  return new PersonUID(emailAddress, realname ?? emailAddress);
}

export function findPerson(emailAddress: string, realname: string): Person | undefined {
  let existing = appGlobal.persons.find(p => p.emailAddresses.some(e => e.value == emailAddress));
  if (existing) {
    return existing;
  }
  return undefined;
}

export function personDisplayName(person: PersonOrGroup | PersonUID) {
  if (!person) {
    return "";
  } else if (person instanceof Person || person instanceof Group) {
    return person.name;
  } else if (person instanceof PersonUID) {
    person.findPerson();
    if (person.person) {
      return person.name;
    }
    if (!person.name) {
      return person.emailAddress;
    }
    return person.name?.
      replace(/@.*/, "").
      replace(/ via .*/, "").
      substring(0, 30);
    /* Show domain - but too cluttered
    let domain = getBaseDomainFromHost(getDomainForEmailAddress(person.emailAddress));
    return person.name.substring(0, 20) + " @" + domain; */
  } else {
    return "Unknown contact type";
  }
}
