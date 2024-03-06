import { MapColl } from "svelte-collections";
import { ContactEntry, Person } from "../Abstract/Person";
import { appGlobal } from "../app";

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

let mailPersons = new MapColl<string, MailPerson>();

export function findOrCreatePerson(emailAddress: string, realname: string): Person {
  let existing = appGlobal.persons.find(p => p.emailAddresses.some(e => e.value == emailAddress));
  if (existing) {
    return existing;
  }
  existing = mailPersons.find(p => p.emailAddresses.some(e => e.value == emailAddress));
  if (existing) {
    return existing;
  }
  let newPerson = new MailPerson(emailAddress, realname);
  mailPersons.add(newPerson);
  return newPerson;
}
