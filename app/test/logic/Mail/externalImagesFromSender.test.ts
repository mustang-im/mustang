// @vitest-environment happy-dom
// app first, to resolve the import cycle around Abstract/Account.ts
import { appGlobal } from "../../../logic/app";
import { setUpAccount } from "./TestMailAccount";
import { SpecialFolder } from "../../../logic/Mail/Folder";
import { PersonUID } from "../../../logic/Abstract/PersonUID";
import { Addressbook } from "../../../logic/Contacts/Addressbook";
import { DummyAddressbookStorage } from "../../../logic/Contacts/SQL/DummyAddressbookStorage";
import { ContactEntry, type Person } from "../../../logic/Abstract/Person";
import { beforeEach, expect, test } from "vitest";

/* The user allowed pictures from the Internet for a sender.
 * All mails from that sender then load them, until the user stops it. */

/** Remembers the saved contacts */
class CountingStorage extends DummyAddressbookStorage {
  readonly saved: Person[] = [];
  async savePerson(person: Person): Promise<void> {
    this.saved.push(person);
  }
}
let storage: CountingStorage;

beforeEach(() => {
  localStorage.clear();
  appGlobal.addressbooks.clear();
  appGlobal.collectedAddressbook = new Addressbook();
  appGlobal.collectedAddressbook.storage = storage = new CountingStorage();
  appGlobal.addressbooks.add(appGlobal.collectedAddressbook);
});

/** A contact that the user has in the addressbook, maybe synced from another device */
function addContact(emailAddress: string, loadExternalImages: boolean | null): Person {
  let person = appGlobal.collectedAddressbook.newPerson();
  person.name = "News";
  person.emailAddresses.add(new ContactEntry(emailAddress, "work", "mailto"));
  person.loadExternalImages = loadExternalImages;
  appGlobal.collectedAddressbook.persons.add(person);
  return person;
}

function newMail(fromAddress: string | null, specialFolder = SpecialFolder.Inbox) {
  let account = setUpAccount();
  let folder = account.getSpecialFolder(specialFolder) ?? account.newFolder();
  folder.specialFolder = specialFolder;
  let mail = folder.newEMail();
  mail.from = fromAddress ? new PersonUID(fromAddress, "News") : new PersonUID();
  return mail;
}

test("Pictures are allowed in all mails from that sender, and only from that sender", async () => {
  await newMail("news@example.com").setLoadExternalImagesFromSender(true);

  expect(newMail("news@example.com").loadExternalImagesFromSender).toBe(true);
  expect(newMail("News@Example.COM").loadExternalImagesFromSender).toBe(true);
  expect(newMail("other@example.com").loadExternalImagesFromSender).toBe(false);
});

test("The user stops pictures from the sender", async () => {
  await newMail("news@example.com").setLoadExternalImagesFromSender(true);
  await newMail("news@example.com").setLoadExternalImagesFromSender(false);

  expect(newMail("news@example.com").loadExternalImagesFromSender).toBe(false);
});

test("The sender is not added to the contacts", async () => {
  await newMail("noreply@example.com").setLoadExternalImagesFromSender(true);

  expect(appGlobal.collectedAddressbook.persons.isEmpty).toBe(true);
});

test("Junk does not load pictures, because spammers forge the sender address", async () => {
  await newMail("news@example.com").setLoadExternalImagesFromSender(true);

  expect(newMail("news@example.com", SpecialFolder.Spam).loadExternalImagesFromSender).toBe(false);
  let markedAsJunk = newMail("news@example.com");
  markedAsJunk.isSpam = true;
  expect(markedAsJunk.loadExternalImagesFromSender).toBe(false);
});

test("A mail without sender allows nothing for other mails without sender", async () => {
  await newMail(null).setLoadExternalImagesFromSender(true);

  expect(newMail(null).loadExternalImagesFromSender).toBe(false);
});

test("Allowing pictures from a contact saves it in the contact, which syncs it to the other devices", async () => {
  let person = addContact("news@example.com", null);

  await newMail("news@example.com").setLoadExternalImagesFromSender(true);

  expect(person.loadExternalImages).toBe(true);
  expect(storage.saved).toContain(person);
});

test("The decision of another device in the contact counts", async () => {
  addContact("news@example.com", true);
  addContact("other@example.com", false);

  expect(newMail("news@example.com").loadExternalImagesFromSender).toBe(true);
  expect(newMail("other@example.com").loadExternalImagesFromSender).toBe(false);
});

test("Another device that stopped pictures in the contact wins over this device", async () => {
  await newMail("news@example.com").setLoadExternalImagesFromSender(true);
  addContact("news@example.com", false);

  expect(newMail("news@example.com").loadExternalImagesFromSender).toBe(false);
});

test("A contact without decision leaves it to this device", async () => {
  await newMail("news@example.com").setLoadExternalImagesFromSender(true);
  addContact("news@example.com", null);

  expect(newMail("news@example.com").loadExternalImagesFromSender).toBe(true);
});
