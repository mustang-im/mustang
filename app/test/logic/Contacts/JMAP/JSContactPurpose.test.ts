import { expect, test } from "vitest";
import { appGlobal } from "../../../../logic/app.ts"; // defeats circular import
import { Person, ContactEntry } from "../../../../logic/Abstract/Person";
import { JSContact } from "../../../../logic/Contacts/JMAP/JSContact";
import type { TJSContact } from "../../../../logic/Contacts/JMAP/TJSContact";

/** As Stalwart returns a vCard with
 * `TEL;VALUE=uri;TYPE=work,voice:tel:+49-30-1234567`, `TEL;VALUE=uri;TYPE=cell,voice:tel:+49-170-1234567`,
 * `TEL;VALUE=uri;TYPE=home,fax:tel:+49-30-7654321`, `EMAIL;TYPE=work;PREF=1:...` and `EMAIL:...` */
function stalwartCard(): TJSContact {
  return {
    "@type": "Card",
    version: "1.0",
    uid: "urn:uuid:7f6c1e2a-1111-4c5e-9d0a-000000000001",
    name: { full: "Erika Mustermann" },
    phones: {
      k1: { number: "tel:+49-30-1234567", contexts: { work: true }, features: { voice: true } },
      k2: { number: "tel:+49-170-1234567", features: { mobile: true, voice: true } },
      k3: { number: "tel:+49-30-7654321", contexts: { private: true }, features: { fax: true } },
    },
    emails: {
      k1: { address: "erika@work.example", contexts: { work: true }, pref: 1 },
      k2: { address: "erika@other.example" },
    },
  } as TJSContact;
}

test("Phone types from another client", () => {
  let person = new Person();
  JSContact.toPerson(stalwartCard(), person);
  expect(person.phoneNumbers.contents.map(entry => [entry.value, entry.purpose])).toEqual([
    ["+49-30-1234567", "work"],
    ["+49-170-1234567", "mobile"],
    ["+49-30-7654321", "home"],
  ]);
  expect(person.emailAddresses.contents.map(entry => [entry.value, entry.purpose])).toEqual([
    ["erika@work.example", "work"],
    ["erika@other.example", "other"],
  ]);
});

test("Saving keeps the types of entries that the user didn't change", () => {
  let jscontact = stalwartCard();
  let person = new Person();
  JSContact.toPerson(jscontact, person);
  person.notes = "Changed something else";
  JSContact.fromPerson(person, jscontact);
  expect(jscontact.phones.k2.features).toEqual({ mobile: true, voice: true });
  expect(jscontact.phones.k2.contexts).toBeUndefined();
  expect(jscontact.phones.k3.features).toEqual({ fax: true });
  expect(jscontact.phones.k3.contexts).toEqual({ private: true });
  expect(jscontact.emails.k2.contexts).toBeUndefined();
});

test("Phone types entered by the user", () => {
  let person = new Person();
  person.phoneNumbers.add(new ContactEntry("+49 170 1", "mobile"));
  person.phoneNumbers.add(new ContactEntry("+49 30 2", "work"));
  person.phoneNumbers.add(new ContactEntry("+49 30 3", "home"));
  person.phoneNumbers.add(new ContactEntry("+49 30 4", "other"));
  person.phoneNumbers.add(new ContactEntry("+49 30 5"));
  let jscontact = {} as TJSContact;
  JSContact.fromPerson(person, jscontact);
  expect(Object.values(jscontact.phones).map(phone => [phone.number, phone.contexts, phone.features])).toEqual([
    ["+49 170 1", undefined, { mobile: true }],
    ["+49 30 2", { work: true }, undefined],
    ["+49 30 3", { private: true }, undefined],
    ["+49 30 4", undefined, undefined],
    ["+49 30 5", undefined, undefined],
  ]);

  let readBack = new Person();
  JSContact.toPerson(jscontact, readBack);
  expect(readBack.phoneNumbers.contents.map(entry => entry.purpose)).toEqual(["mobile", "work", "home", "other", "other"]);
});

test("Changing a mobile number to a work number", () => {
  let jscontact = stalwartCard();
  let person = new Person();
  JSContact.toPerson(jscontact, person);
  person.phoneNumbers.getIndex(1).purpose = "work";
  JSContact.fromPerson(person, jscontact);
  expect(jscontact.phones.k2.contexts).toEqual({ work: true });
  expect(jscontact.phones.k2.features).toEqual({ voice: true });
});

test("Entries that we saved without a purpose before", () => {
  let jscontact = stalwartCard();
  jscontact.emails.k2.contexts = { null: true } as any;
  let person = new Person();
  JSContact.toPerson(jscontact, person);
  expect(person.emailAddresses.getIndex(1).purpose).toBe("other");
});

test("A phone number that a buggy server sends as a number keeps the rest of the contact", () => {
  let jscontact = stalwartCard();
  (jscontact.phones.k1 as any).number = 49301234567;
  let person = new Person();
  JSContact.toPerson(jscontact, person);
  expect(person.phoneNumbers.contents.map(entry => entry.value)).toEqual(["49301234567", "+49-170-1234567", "+49-30-7654321"]);
  expect(person.emailAddresses.length).toBe(2);
});
