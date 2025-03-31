import type { PersonOrGroup } from "../../frontend/Shared/Person/PersonOrGroup";
import { Group } from "./Group";
import { ContactEntry, Person } from "./Person";
import { appGlobal } from "../app";
import { Observable, notifyChangedProperty } from "../util/Observable";
import { ArrayColl } from "svelte-collections";

export class PersonUID extends Observable {
  @notifyChangedProperty
  name: string;
  /** or user ID, for chat and other systems (despite the property name) */
  @notifyChangedProperty
  emailAddress: string;
  @notifyChangedProperty
  person?: Person;
  // Used so that autocompleted meeting participants have a default value.
  // They should really be Participant objects, but I'm cheating for now.
  @notifyChangedProperty
  protected response = 0;

  constructor(emailAddress?: string, name?: string) {
    super();
    this.emailAddress = emailAddress ?? kDummyPerson.emailAddress;
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
    return this.person = findPerson(this.emailAddress);
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

  matchesPerson(person: Person): boolean {
    return person && !!person.emailAddresses.find(e => e.value == this.emailAddress);
  }

  /** The email address does not belong to the end user,
   * but a mailling list or messaging system */
  get isProxyAddress(): boolean {
    return this.name?.includes(" via ") || this.name?.endsWith("@invalid");
  }

  toString() {
    return this.name + " <" + this.emailAddress + ">";
  }
}

export function findOrCreatePersonUID(emailAddress: string, realname: string): PersonUID {
  /* TODO what if the person or email address is later added to the personal address book?
    How to replace the existing Person object references? */
  let existing = findPerson(emailAddress);
  let uid = new PersonUID(emailAddress, realname ?? existing?.name ?? emailAddress);
  if (existing) {
    uid.person = existing;
  }
  return uid;
}

export function findPerson(emailAddress: string): Person | undefined {
  if (!emailAddress) {
    return undefined;
  }
  emailAddress = emailAddress.toLowerCase();
  for (let ab of appGlobal.addressbooks) {
    let existing = ab.persons.find(p => p.emailAddresses.some(e => e.value?.toLowerCase() == emailAddress));
    if (existing) {
      return existing;
    }
  }
  return undefined;
}

export function findPersonsWithName(name: string): ArrayColl<Person> {
  if (!name) {
    return undefined;
  }
  name = name.toLowerCase();
  let results = new ArrayColl<Person>();
  for (let ab of appGlobal.addressbooks) {
    results.addAll(ab.persons.contents.filter(p => p.name?.toLowerCase() == name));
  }
  return results;
}

export function personDisplayName(person: PersonOrGroup | PersonUID) {
  if (!person) {
    return "";
  } else if (person instanceof Person || person instanceof Group) {
    return person.name;
  } else if (person instanceof PersonUID) {
    person.findPerson();
    if (person.person?.name) {
      return person.person.name;
    }
    if (!person.name) {
      return person.emailAddress?.replace(/@.*/, "") ?? "";
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

export function nameFromEmailAddress(emailAddress: string): string {
  let name = emailAddress.split("@")[0];
  name = name.replace(/\./g, " ");
  name = name.split(" ").map(n => n[0].toUpperCase() + n.substring(1)).join(" "); // Capitalize
  return name;
}

export const kDummyPerson = new PersonUID("unknown@invalid", "");
