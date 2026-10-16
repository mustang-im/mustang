// @vitest-environment happy-dom
// app first, to resolve the import cycle around Abstract/Account.ts
import "../../../logic/app";
import { appGlobal } from "../../../logic/app";
import { Addressbook, SearchOnlyAddressbook } from "../../../logic/Contacts/Addressbook";
import { ContactEntry, Person } from "../../../logic/Abstract/Person";
import { Group } from "../../../logic/Abstract/Group";
import { ContactActions } from "../../Contacts/ContactActions";
import { ContactSearch, ContactSearchScope } from "../../Contacts/ContactSearch";
import { beforeEach, expect, test } from "vitest";

class TestGAL extends SearchOnlyAddressbook {
  readonly protocol: string = "gal-test";
}

let addressbook: Addressbook;
let anna: Person;
let bert: Person;
let carla: Person;

function newPerson(name: string, ...emailAddresses: ContactEntry[]): Person {
  let person = new Person(addressbook);
  person.name = name;
  person.emailAddresses.addAll(emailAddresses);
  addressbook.persons.add(person);
  return person;
}

function newGroup(name: string, ...members: Person[]): Group {
  let group = new Group(addressbook);
  group.name = name;
  group.participants.addAll(members);
  addressbook.groups.add(group);
  return group;
}

beforeEach(() => {
  addressbook = new Addressbook();
  addressbook.name = "Personal";
  appGlobal.addressbooks.replaceAll([addressbook]);
  appGlobal.searchOnlyAddressbooks.clear();
  anna = newPerson("Anna Schmidt",
    new ContactEntry("anna@home.example", "home", null, 50),
    new ContactEntry("anna@work.example", "work", null, 10));
  bert = newPerson("Bert Meier", new ContactEntry("bert@example.com", "work"));
  carla = newPerson("Carla Diaz");
  carla.phoneNumbers.add(new ContactEntry("+49 30 555", "work"));
  carla.notes = "Met at the fair";
});

test("Recipients use the preferred email address", () => {
  let recipients = ContactActions.recipientsOf([anna]);
  expect(recipients.map(recipient => recipient.emailAddress)).toEqual(["anna@work.example"]);
  expect(recipients[0].name).toBe("Anna Schmidt");
  expect(recipients[0].person).toBe(anna);
});

test("Recipients skip persons without email address", () => {
  expect(ContactActions.recipientsOf([carla])).toEqual([]);
  expect(ContactActions.hasEmailAddress([carla])).toBe(false);
  expect(ContactActions.hasEmailAddress([carla, bert])).toBe(true);
});

test("Groups expand to their members, without duplicates", () => {
  let team = newGroup("Team", anna, bert, carla);
  expect(ContactActions.expandGroups([team, anna])).toEqual([anna, bert, carla]);
  let recipients = ContactActions.recipientsOf([anna, team]);
  expect(recipients.map(recipient => recipient.emailAddress)).toEqual(["anna@work.example", "bert@example.com"]);
  expect(ContactActions.hasEmailAddress([team])).toBe(true);
  expect(ContactActions.hasEmailAddress([newGroup("Empty")])).toBe(false);
});

test("Unsaved contacts are not in their address book yet", () => {
  let person = ContactActions.createPerson(addressbook);
  expect(person.addressbook).toBe(addressbook);
  expect(ContactActions.isUnsaved(person)).toBe(true);
  expect(ContactActions.isUnsaved(anna)).toBe(false);
  let group = ContactActions.createGroup(addressbook);
  expect(ContactActions.isUnsaved(group)).toBe(true);
  expect(ContactActions.isUnsaved(newGroup("Saved"))).toBe(false);
});

test("New contacts go into the selected address book, unless it is a directory", () => {
  let second = new Addressbook();
  appGlobal.addressbooks.add(second);
  let gal = new TestGAL();
  appGlobal.searchOnlyAddressbooks.add(gal);
  expect(ContactActions.targetAddressbook(second)).toBe(second);
  expect(ContactActions.targetAddressbook(null)).toBe(addressbook);
  expect(ContactActions.targetAddressbook(gal)).toBe(addressbook);
});

test("New contacts need an address book", () => {
  appGlobal.addressbooks.clear();
  expect(() => ContactActions.targetAddressbook(null)).toThrow();
});

test("Search finds persons by name, email address, phone number and notes", () => {
  let names = (term: string) => ContactSearch.search([addressbook], term).contents.map(contact => contact.name).sort();
  expect(names("anna")).toEqual(["Anna Schmidt"]);
  expect(names("example.com")).toEqual(["Bert Meier"]);
  expect(names("30 555")).toEqual(["Carla Diaz"]);
  expect(names("fair")).toEqual(["Carla Diaz"]);
  expect(names("e")).toEqual(["Anna Schmidt", "Bert Meier", "Carla Diaz"]);
  expect(names("nobody")).toEqual([]);
});

test("Search finds groups by name", () => {
  newGroup("Project team", anna);
  let results = ContactSearch.search([addressbook], "team").contents;
  expect(results.length).toBe(1);
  expect(results[0]).toBeInstanceOf(Group);
});

test("Search covers all given address books", () => {
  let second = new Addressbook();
  let dora = new Person(second);
  dora.name = "Dora Anders";
  second.persons.add(dora);
  let names = ContactSearch.search([addressbook, second], "an").contents.map(contact => contact.name).sort();
  expect(names).toEqual(["Anna Schmidt", "Dora Anders"]);
});

test("Search refiners keep persons with a phone number, an address or an email address", () => {
  let options = { ...ContactSearch.defaultOptions(ContactSearchScope.AllContactItems), hasPhoneNumber: true };
  expect(ContactSearch.isActive(options)).toBe(true);
  let withPhone = ContactSearch.results([addressbook], addressbook.contacts, options).contents.map(contact => contact.name);
  expect(withPhone).toEqual(["Carla Diaz"]);
  options = { ...options, hasPhoneNumber: false, hasEMailAddress: true };
  let withEMail = ContactSearch.results([addressbook], addressbook.contacts, options).contents.map(contact => contact.name).sort();
  expect(withEMail).toEqual(["Anna Schmidt", "Bert Meier"]);
  expect(ContactSearch.isActive(ContactSearch.defaultOptions(ContactSearchScope.CurrentFolder))).toBe(false);
});
