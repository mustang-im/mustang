import { expect, test } from "vitest";
import { appGlobal } from "../../../../logic/app.ts"; // defeats circular import
import { Person, ContactEntry } from "../../../../logic/Abstract/Person";
import { JSContact } from "../../../../logic/Contacts/JMAP/JSContact";
import type { TJSContact } from "../../../../logic/Contacts/JMAP/TJSContact";

/** Stalwart's JSContact for a vCard with `IMPP;TYPE=work:xmpp:erika@chat.example`,
 * and an entry of another JMAP client with only a user name */
function serverCard(): TJSContact {
  return {
    "@type": "Card",
    version: "1.0",
    uid: "urn:uuid:7f6c1e2a-1111-4c5e-9d0a-000000000001",
    name: { full: "Erika Mustermann" },
    onlineServices: {
      k1: { uri: "xmpp:erika@chat.example", contexts: { work: true } },
      k2: { user: "erika.m", service: "Signal" },
    },
  } as TJSContact;
}

test("Chat accounts from other clients", () => {
  let person = new Person();
  JSContact.toPerson(serverCard(), person);
  expect(person.chatAccounts.contents.map(entry => [entry.value, entry.protocol])).toEqual([
    ["erika@chat.example", "xmpp"],
    ["erika.m", "signal"],
  ]);
});

test("Saving leaves chat accounts that the user didn't change as they are", () => {
  let jscontact = serverCard();
  let person = new Person();
  JSContact.toPerson(jscontact, person);
  person.notes = "Changed something else";
  JSContact.fromPerson(person, jscontact);
  let { k1, k2 } = jscontact.onlineServices;
  expect([k1.uri, k1.user, k1.service]).toEqual(["xmpp:erika@chat.example", undefined, undefined]);
  expect([k2.uri, k2.user, k2.service]).toEqual([undefined, "erika.m", "Signal"]);
});

test("Editing a chat account that has only a URI", () => {
  let jscontact = serverCard();
  let person = new Person();
  JSContact.toPerson(jscontact, person);
  person.chatAccounts.first.value = "erika@other.example";
  JSContact.fromPerson(person, jscontact);
  expect(jscontact.onlineServices.k1.uri).toBe("xmpp:erika@other.example");

  let readBack = new Person();
  JSContact.toPerson(jscontact, readBack);
  expect(readBack.chatAccounts.first.value).toBe("erika@other.example");
});

test("New chat accounts get a URI, where the protocol has one", () => {
  // Stalwart drops chat accounts without URI
  let person = new Person();
  person.chatAccounts.add(new ContactEntry("fred@chat.example", "work", "xmpp"));
  person.chatAccounts.add(new ContactEntry("+49 170 1234567", "home", "signal"));
  let jscontact = {} as TJSContact;
  JSContact.fromPerson(person, jscontact);
  let written = Object.values(jscontact.onlineServices);
  expect(written.map(service => [service.uri, service.user, service.service])).toEqual([
    ["xmpp:fred@chat.example", "fred@chat.example", "xmpp"],
    [undefined, "+49 170 1234567", "signal"],
  ]);

  let readBack = new Person();
  JSContact.toPerson(jscontact, readBack);
  expect(readBack.chatAccounts.contents.map(entry => [entry.value, entry.protocol])).toEqual([
    ["fred@chat.example", "xmpp"],
    ["+49 170 1234567", "signal"],
  ]);
});
