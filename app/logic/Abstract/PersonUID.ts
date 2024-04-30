import type { PersonOrGroup } from "../../frontend/Shared/Person/PersonOrGroup";
import { Group } from "./Group";
import { ContactEntry, Person } from "./Person";
import { appGlobal } from "../app";
import { nameFromEmailAddress } from "../Mail/AutoConfig/saveConfig";
import { Observable, notifyChangedProperty } from "../util/Observable";
import { sanitize } from "../../../lib/util/sanitizeDatatypes";

export class PersonUID extends Observable {
  @notifyChangedProperty
  name: string;
  /** or user ID, for chat and other systems (despite the property name) */
  @notifyChangedProperty
  emailAddress: string;
  @notifyChangedProperty
  person?: Person;

  constructor(emailAddress?: string, name?: string) {
    super();
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

  createPerson() {
    this.person = this.findPerson();
    if (this.person) {
      return this.person;
    }
    this.person = new Person();
    this.person.name = this.name || nameFromEmailAddress(this.emailAddress);
    this.person.emailAddresses.add(new ContactEntry(this.emailAddress, "primary"));
    return this.person;
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
  for (let ab of appGlobal.addressbooks) {
    let existing = ab.persons.find(p => p.emailAddresses.some(e => e.value == emailAddress));
    if (existing) {
      return existing;
    }
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

export function getDomainForEmailAddress(emailAddress): string {
  // Do not throw, because this function is used in {UI code}
  return sanitize.hostname(emailAddress.split("@").pop(), "unknown");
}
