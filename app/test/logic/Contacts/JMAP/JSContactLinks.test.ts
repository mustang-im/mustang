import { expect, test } from "vitest";
import { appGlobal } from "../../../../logic/app.ts"; // defeats circular import
import { Person, ContactEntry } from "../../../../logic/Abstract/Person";
import { JSContact } from "../../../../logic/Contacts/JMAP/JSContact";
import type { TJSContact } from "../../../../logic/Contacts/JMAP/TJSContact";

/** The URLs in any order, and with or without a trailing `/`, which are equally correct */
function normalized(urls: string[]): string[] {
  return urls.map(url => url.replace(/\/$/, "")).sort();
}

test("A website entered without https:// is saved as a URI", () => {
  // `<input type="url">` lets the user type just the host name
  let person = new Person();
  person.urls.add(new ContactEntry("erika.example", "work"));
  person.urls.add(new ContactEntry("https://blog.erika.example/", "home"));
  let jscontact = {} as TJSContact;
  JSContact.fromPerson(person, jscontact);
  expect(normalized(Object.values(jscontact.links).map(link => link.uri))).toEqual(["https://blog.erika.example", "https://erika.example"]);

  let readBack = new Person();
  JSContact.toPerson(jscontact, readBack);
  expect(normalized(readBack.urls.contents.map(entry => entry.value))).toEqual(["https://blog.erika.example", "https://erika.example"]);
});

test("A website that an older version saved without https:// is shown", () => {
  let person = new Person();
  JSContact.toPerson({ "@type": "Card", version: "1.0", name: { full: "Erika" }, links: { l1: { uri: "erika.example" } } } as TJSContact, person);
  expect(normalized(person.urls.contents.map(entry => entry.value))).toEqual(["https://erika.example"]);
});

test("A malformed link from a buggy server keeps the rest of the contact", () => {
  let person = new Person();
  JSContact.toPerson({
    "@type": "Card", version: "1.0", name: { full: "Erika" },
    links: { l1: { uri: "https://exa mple/" }, l2: { uri: { evil: true } as any }, l3: { uri: "https://erika.example/" } },
    notes: { n1: { note: "Still here" } },
  } as TJSContact, person);
  expect(normalized(person.urls.contents.map(entry => entry.value))).toContain("https://erika.example");
  expect(person.notes).toBe("Still here");
});
