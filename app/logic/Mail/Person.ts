import { MapColl } from "svelte-collections";
import { ContactEntry, Person } from "../Abstract/Person";
import { appGlobal } from "../app";
import { PersonEmailAddress } from "./EMail";

export class MailPerson extends Person {
  constructor(emailAddress: string, realname: string) {
    super();
    this.name = realname || emailAddress;
    if (realname.includes(" ")) {
      let names = realname.split(" ");
      this.firstName = names.shift() ?? "";
      this.lastName = names.join(" ");
    }
    this.emailAddresses.add(new ContactEntry(emailAddress, "mail"));
  }
}

export function findOrCreatePersonEmailAddress(emailAddress: string, realname: string): PersonEmailAddress {
  /* TODO what if the person or email address is later added to the personal address book?
    How to replace the existing Person object references? */
  let existing = findPerson(emailAddress, realname);
  if (existing) {
    return PersonEmailAddress.fromPerson(existing);
  }
  let pe = new PersonEmailAddress();
  pe.emailAddress = emailAddress;
  pe.name = realname ?? emailAddress;
  return pe;
}

let mailPersons = new MapColl<string, MailPerson>();

export function findOrCreatePerson(emailAddress: string, realname: string): Person {
  /* TODO what if the person or email address is later added to the personal address book?
    How to replace the existing Person object references? */
  let existing = findPerson(emailAddress, realname);
  if (existing) {
    return existing;
  }
  let newPerson = new MailPerson(emailAddress, realname ?? emailAddress);
  mailPersons.add(newPerson);
  return newPerson;
}

export function findPerson(emailAddress: string, realname: string): Person {
  let existing = appGlobal.persons.find(p => p.emailAddresses.some(e => e.value == emailAddress));
  if (existing) {
    return existing;
  }
  existing = mailPersons.find(p => p.name == realname && p.emailAddresses.some(e => e.value == emailAddress));
  if (existing) {
    return existing;
  }
  return null;
}
