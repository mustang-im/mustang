// @vitest-environment happy-dom
// app first, to resolve the import cycle around Abstract/Account.ts
import "../../../../logic/app";
import { Addressbook } from "../../../../logic/Contacts/Addressbook";
import { ContactEntry, Person } from "../../../../logic/Abstract/Person";
import { PersonUID } from "../../../../logic/Abstract/PersonUID";
import { SelectNames, SelectNamesField, RecipientField, type Recipients } from "../../../Mail/Composer/SelectNames";
import { ArrayColl } from "svelte-collections";
import { beforeEach, expect, test } from "vitest";

let personal: Addressbook;
let work: Addressbook;
let anna: Person;
let bert: Person;
let carla: Person;
let dora: Person;

function newPerson(addressbook: Addressbook, name: string, ...emailAddresses: ContactEntry[]): Person {
  let person = new Person(addressbook);
  person.name = name;
  person.emailAddresses.addAll(emailAddresses);
  addressbook.persons.add(person);
  return person;
}

function newRecipients(): Recipients {
  return {
    to: new ArrayColl<PersonUID>(),
    cc: new ArrayColl<PersonUID>(),
    bcc: new ArrayColl<PersonUID>(),
  } as Recipients;
}

beforeEach(() => {
  personal = new Addressbook();
  personal.name = "Personal";
  work = new Addressbook();
  work.name = "Work";
  bert = newPerson(personal, "Bert Meier", new ContactEntry("bert@example.com", "work"));
  anna = newPerson(personal, "Anna Schmidt",
    new ContactEntry("anna@home.example", "home", null, 50),
    new ContactEntry("anna@work.example", "work", null, 10));
  carla = newPerson(personal, "Carla Diaz");
  dora = newPerson(work, "Dora Klein", new ContactEntry("dora@corp.example", "work"));
});

test("Lists only persons with an email address, sorted by name", () => {
  let persons = SelectNames.persons([personal], "");
  expect(persons.contents).toEqual([anna, bert]);
});

test("Lists persons of all given address books", () => {
  let persons = SelectNames.persons([personal, work], "");
  expect(persons.contents).toEqual([anna, bert, dora]);
});

test("Search matches name and email address", () => {
  expect(SelectNames.persons([personal, work], "MEIER").contents).toEqual([bert]);
  expect(SelectNames.persons([personal, work], "corp.example").contents).toEqual([dora]);
  expect(SelectNames.persons([personal, work], "  anna ").contents).toEqual([anna]);
  expect(SelectNames.persons([personal, work], "nobody").contents).toEqual([]);
});

test("Adds the preferred email address, without duplicates", () => {
  let selectNames = new SelectNames(newRecipients());
  selectNames.field(RecipientField.To).add([anna, bert, anna, carla]);
  let to = selectNames.field(RecipientField.To).picks.contents;
  expect(to.map(recipient => recipient.emailAddress)).toEqual(["anna@work.example", "bert@example.com"]);
  expect(to[0].name).toBe("Anna Schmidt");
  expect(to[0].person).toBe(anna);
});

test("Starts with the recipients of the mail and applies the picks", () => {
  let recipients = newRecipients();
  let existing = new PersonUID("eve@example.com", "Eve");
  recipients.to.add(existing);
  let selectNames = new SelectNames(recipients);
  expect(selectNames.field(RecipientField.To).picks.contents).toEqual([existing]);
  expect(selectNames.fields.map(field => field.label)).toEqual(["To", "Cc", "Bcc"]);

  selectNames.field(RecipientField.Cc).add([bert]);
  selectNames.field(RecipientField.Bcc).add([dora]);
  selectNames.field(RecipientField.To).remove(existing);
  // Nothing changes before apply()
  expect(recipients.to.contents).toEqual([existing]);
  expect(recipients.cc.isEmpty).toBe(true);

  selectNames.apply(recipients);
  expect(recipients.to.isEmpty).toBe(true);
  expect(recipients.cc.contents.map(recipient => recipient.emailAddress)).toEqual(["bert@example.com"]);
  expect(recipients.bcc.contents.map(recipient => recipient.emailAddress)).toEqual(["dora@corp.example"]);
});

test("Name only searches only the name", () => {
  dora.position = "Anna's assistant";
  expect(SelectNames.persons([personal, work], "anna").contents).toEqual([anna]);
  expect(SelectNames.persons([personal, work], "work.example", true).contents).toEqual([]);
  expect(SelectNames.persons([personal, work], "schmidt", true).contents).toEqual([anna]);
});

test("A single pick field keeps only the last pick", () => {
  let from = new SelectNamesField("From", [], true);
  from.add([anna]);
  from.add([bert, dora]);
  expect(from.picks.contents.map(pick => pick.emailAddress)).toEqual(["bert@example.com"]);
});

test("A pick field starts with the given picks and adds without duplicates", () => {
  let eve = new PersonUID("eve@example.com", "Eve");
  let users = new SelectNamesField("Add", [eve]);
  users.add([bert, bert]);
  expect(users.picks.contents.map(pick => pick.emailAddress)).toEqual(["eve@example.com", "bert@example.com"]);
});

test("Business phone prefers the work number", () => {
  bert.phoneNumbers.add(new ContactEntry("+49 1", "mobile", null, 10));
  bert.phoneNumbers.add(new ContactEntry("+49 2", "work", null, 50));
  expect(SelectNames.businessPhone(bert)).toBe("+49 2");
  expect(SelectNames.businessPhone(dora)).toBe("");
});
