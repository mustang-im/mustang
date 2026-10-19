import { expect, test } from "vitest";
import { appGlobal } from "../../../../logic/app.ts"; // defeats circular import
import { Person, ContactEntry } from "../../../../logic/Abstract/Person";
import { JSContact } from "../../../../logic/Contacts/JMAP/JSContact";
import type { TJSContact } from "../../../../logic/Contacts/JMAP/TJSContact";

test("A website entered without https:// is saved as a URI", () => {
  // `<input type="url">` lets the user type just the host name
  let person = new Person();
  person.urls.add(new ContactEntry("erika.example", "work"));
  person.urls.add(new ContactEntry("https://blog.erika.example/", "home"));
  let jscontact = {} as TJSContact;
  JSContact.fromPerson(person, jscontact);
  expect(Object.values(jscontact.links).map(link => link.uri)).toEqual(["https://erika.example", "https://blog.erika.example/"]);

  let readBack = new Person();
  JSContact.toPerson(jscontact, readBack);
  expect(readBack.urls.contents.map(entry => entry.value)).toEqual(["https://erika.example", "https://blog.erika.example/"]);
});

test("A website that an older version saved without https:// is shown", () => {
  let person = new Person();
  JSContact.toPerson({ "@type": "Card", version: "1.0", name: { full: "Erika" }, links: { l1: { uri: "erika.example" } } } as TJSContact, person);
  expect(person.urls.contents.map(entry => entry.value)).toEqual(["https://erika.example"]);
});

test("A malformed link from a buggy server keeps the rest of the contact", () => {
  let person = new Person();
  JSContact.toPerson({
    "@type": "Card", version: "1.0", name: { full: "Erika" },
    links: { l1: { uri: { evil: true } as any }, l2: { uri: "https://erika.example/" } },
    notes: { n1: { note: "Still here" } },
  } as TJSContact, person);
  expect(person.urls.contents.map(entry => entry.value)).toContain("https://erika.example/");
  expect(person.notes).toBe("Still here");
});
