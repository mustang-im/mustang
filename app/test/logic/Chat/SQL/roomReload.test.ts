// app first, to resolve the import cycle around Abstract/Account.ts
import { appGlobal } from "../../../../logic/app";
import { ChatAccount } from "../../../../logic/Chat/ChatAccount";
import { SQLChatRoom } from "../../../../logic/Chat/SQL/SQLChatRoom";
import { getDatabase as getChatDatabase } from "../../../../logic/Chat/SQL/SQLDatabase";
import { getDatabase as getContactsDatabase } from "../../../../logic/Contacts/SQL/SQLDatabase";
import { SQLPerson } from "../../../../logic/Contacts/SQL/SQLPerson";
import { SQLGroup } from "../../../../logic/Contacts/SQL/SQLGroup";
import { Addressbook } from "../../../../logic/Contacts/Addressbook";
import { DummyAddressbookStorage } from "../../../../logic/Contacts/SQL/DummyAddressbookStorage";
import { Person, ContactEntry } from "../../../../logic/Abstract/Person";
import { Group } from "../../../../logic/Abstract/Group";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { beforeAll, expect, test } from "vitest";
import sql from "../../../../../lib/rs-sqlite";
// @ts-ignore Using the backend's SQLite in-process, instead of via JPC
import { Database } from "../../../../../desktop/backend/node_modules/@radically-straightforward/sqlite/build/index.mjs";

const kAliceJID = "491761111111@s.whatsapp.net";
const kGroupJID = "12345-67890@g.us";

beforeAll(async () => {
  let tempDir = mkdtempSync(path.join(tmpdir(), "room-reload-test-"));
  appGlobal.remoteApp = {
    getSQLiteDatabase(filename: string, options?: any, buffer?: Uint8Array) {
      if (buffer) {
        return new Database(Buffer.from(buffer), options);
      }
      return new Database(path.join(tempDir, filename), options);
    },
  };
  // The chat and contacts databases lazily create + migrate themselves in the
  // fresh temp dir on first use (getDatabase()).
});

/** Reproduces the startup load-order race: chat rooms are read from SQL before
 * the addressbooks' contacts are loaded into memory. The rooms must still load
 * (their contact fetched from the DB), not be silently dropped. */
test("rooms whose contacts aren't in memory yet are loaded from the DB, not dropped", async () => {
  let addressbook = new Addressbook();
  addressbook.name = "Test addressbook";
  addressbook.storage = new DummyAddressbookStorage();
  let abRow = await (await getContactsDatabase()).run(sql`
    INSERT INTO addressbook (idStr, protocol) VALUES (${addressbook.id}, ${"test"})`);
  addressbook.dbID = abRow.lastInsertRowid;
  appGlobal.addressbooks.add(addressbook);
  appGlobal.personalAddressbook = addressbook;

  let alice = addressbook.newPerson();
  alice.name = "Alice Example";
  alice.chatAccounts.add(new ContactEntry(kAliceJID, "WhatsApp", "whatsapp"));
  addressbook.persons.add(alice);
  await SQLPerson.save(alice);

  let bob = addressbook.newPerson();
  bob.name = "Bob Example";
  addressbook.persons.add(bob);
  await SQLPerson.save(bob);

  let group = addressbook.newGroup();
  group.name = "Project Group";
  group.participants.add(bob);
  addressbook.groups.add(group);
  await SQLGroup.save(group);

  let account = new ChatAccount();
  account.name = "Test chat";
  let accRow = await (await getChatDatabase()).run(sql`
    INSERT INTO chatAccount (idStr, protocol) VALUES (${account.id}, ${account.protocol})`);
  account.dbID = accRow.lastInsertRowid;
  appGlobal.chatAccounts.add(account);

  let dm = account.newRoom();
  dm.id = kAliceJID;
  dm.contact = alice;
  await SQLChatRoom.save(dm);

  let groupRoom = account.newRoom();
  groupRoom.id = kGroupJID;
  groupRoom.contact = group;
  await SQLChatRoom.save(groupRoom);

  // Simulate the race: rooms read before the addressbook's contacts are loaded.
  account.rooms.clear();
  addressbook.persons.clear();
  addressbook.groups.clear();
  expect(appGlobal.persons.length).toBe(0);

  await SQLChatRoom.readAll(account);

  // Both rooms came back, with their contacts loaded from the DB.
  expect(account.rooms.length).toBe(2);
  let dmLoaded = account.rooms.contents.find(room => room.id == kAliceJID);
  expect(dmLoaded).toBeDefined();
  expect(dmLoaded.contact).toBeInstanceOf(Person);
  expect(dmLoaded.contact.name).toBe("Alice Example");
  let groupLoaded = account.rooms.contents.find(room => room.id == kGroupJID);
  expect(groupLoaded).toBeDefined();
  expect(groupLoaded.contact).toBeInstanceOf(Group);
  expect(groupLoaded.name).toBe("Project Group");

  // The loaded contacts were registered back into the addressbook (so they
  // appear in appGlobal.persons and a later bulk load dedups against them).
  expect(addressbook.persons.some(person => person.dbID == alice.dbID)).toBe(true);
  expect(addressbook.groups.some(g => g.dbID == group.dbID)).toBe(true);
});
