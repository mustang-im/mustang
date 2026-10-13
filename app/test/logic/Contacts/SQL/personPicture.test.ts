// app first, to resolve the import cycle around Abstract/Account.ts
import { appGlobal } from "../../../../logic/app";
import { Addressbook } from "../../../../logic/Contacts/Addressbook";
import { getDatabase } from "../../../../logic/Contacts/SQL/SQLDatabase";
import { SQLPerson } from "../../../../logic/Contacts/SQL/SQLPerson";
import { DummyAddressbookStorage } from "../../../../logic/Contacts/SQL/DummyAddressbookStorage";
import { InProcessSQLiteDatabase } from "../../util/inProcessSQLite";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { beforeAll, expect, test } from "vitest";
import sql from "../../../../../lib/rs-sqlite";

/** A picture that the user picked from a file, here a 1x1 PNG */
const kFilePicture = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVR4nGP4DwABAQEANl9ngAAAAABJRU5ErkJggg==";
const kNetworkPicture = "https://example.com/bob.jpg";

let addressbook: Addressbook;

beforeAll(async () => {
  let tempDir = mkdtempSync(path.join(tmpdir(), "person-picture-test-"));
  appGlobal.remoteApp = {
    getSQLiteDatabase: (filename: string) =>
      new InProcessSQLiteDatabase(path.join(tempDir, filename)),
  };

  addressbook = new Addressbook();
  addressbook.name = "Test addressbook";
  addressbook.storage = new DummyAddressbookStorage();
  let abRow = await (await getDatabase()).run(sql`
    INSERT INTO addressbook (idStr, protocol) VALUES (${addressbook.id}, ${"test"})`);
  addressbook.dbID = abRow.lastInsertRowid;
});

test("a picture picked from a file survives the DB round-trip", async () => {
  let person = addressbook.newPerson();
  person.name = "Alice Example";
  person.picture = kFilePicture;
  await SQLPerson.save(person);

  let readPerson = await SQLPerson.read(person.dbID, addressbook.newPerson());
  expect(readPerson.picture).toEqual(kFilePicture);
});

test("a picture downloaded from the network survives the DB round-trip", async () => {
  let person = addressbook.newPerson();
  person.name = "Bob Example";
  person.picture = kNetworkPicture;
  await SQLPerson.save(person);

  let readPerson = await SQLPerson.read(person.dbID, addressbook.newPerson());
  expect(readPerson.picture).toEqual(kNetworkPicture);
});
