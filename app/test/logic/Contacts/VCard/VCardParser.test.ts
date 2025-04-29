import { expect, test } from "vitest";
import { appGlobal } from "../../../../logic/app.ts"; // defeats circular import
import { Person } from "../../../../logic/Abstract/Person";
import { JSONPerson } from "../../../../logic/Contacts/JSON/JSONPerson";
import VCard from "./VCard";
import * as fs from "node:fs/promises";

function toJSON(person: Person) {
  person.addressbook = { id: true };
  return JSONPerson.saveContacts(person, JSONPerson.save(person));
}

const dataDir = new URL("./TestData/", import.meta.url);
const allFiles = await fs.readdir(dataDir);
const testFiles = allFiles.filter(name => name.endsWith(".vcf")).map(name => name.slice(0, -4));
test.each(testFiles)("Parse %s", async name => {
  const card = VCard.parse(await fs.readFile(new URL(name + ".vcf", dataDir), { encoding: 'utf-8' }));
  const json = JSON.parse(await fs.readFile(new URL(name + ".json", dataDir, { encoding: 'utf-8' })));
  json.addressbookID = true;
  json.popularity = 0;
  const person = new Person();
  VCard.updatePerson(card, person);
  expect(toJSON(person)).toEqual(json);
});
