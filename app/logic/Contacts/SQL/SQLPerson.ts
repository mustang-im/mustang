import { ContactEntry, Person } from "../../Abstract/Person";
import { Addressbook } from "../Addressbook";
import { getDatabase } from "./SQLDatabase";
import { appGlobal } from "../../app";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assert } from "../../util/util";
import { ArrayColl, Collection } from "svelte-collections";
import sql from "../../../../lib/rs-sqlite";

export class SQLPerson {
  static async save(person: Person) {
    assert(person.addressbook?.dbID, "Need address book ID to save the person");
    if (!person.dbID) {
      let insert = await (await getDatabase()).run(sql`
        INSERT INTO person (
          name, firstName, lastName,
          picture, notes, addressbookID
        ) VALUES (
          ${person.name}, ${person.firstName}, ${person.lastName},
          ${person.picture}, ${person.notes}, ${person.addressbook?.dbID}
        )`);
      person.dbID = insert.lastInsertRowid;
    } else {
      await (await getDatabase()).run(sql`
        UPDATE person SET
          name = ${person.name},
          firstName = ${person.firstName},
          lastName = ${person.lastName},
          picture = ${person.picture},
          notes = ${person.notes},
          addressbookID = ${person.addressbook?.dbID}
        WHERE id = ${person.dbID}
        `);
    }
    SQLPerson.saveContacts(person, person.emailAddresses, ContactType.EMailAddress);
    SQLPerson.saveContacts(person, person.chatAccounts, ContactType.Chat);
    SQLPerson.saveContacts(person, person.phoneNumbers, ContactType.Phone);
    SQLPerson.saveContacts(person, person.streetAddresses, ContactType.StreetAddress);
  }

  protected static async saveContacts(person: Person, contacts: Collection<ContactEntry>, contactType: ContactType) {
    // TODO Use a more elegant way to remove deleted entries
    await (await getDatabase()).run(sql`
      DELETE FROM personContact
      WHERE personID = ${person.dbID}
      AND type = ${contactType}
      `);

    for (let contact of contacts) {
      SQLPerson.saveContact(person, contact, contactType);
    }
  }

  protected static async saveContact(person: Person, contact: ContactEntry, contactType: ContactType) {
    assert(person.dbID, "Need person ID to save the person");
    if (!contact.value) {
      return;
    }
    await (await getDatabase()).run(sql`
      INSERT INTO personContact (
        personID, type, value,
        protocol, purpose, preference
      ) VALUES (
        ${person.dbID}, ${contactType}, ${contact.value},
        ${contact.protocol}, ${contact.purpose}, ${contact.preference}
      )`);
  }

  static async read(dbID: number, person: Person, row?: any): Promise<Person> {
    if (!row) {
      row = await (await getDatabase()).get(sql`
        SELECT
          name, firstName, lastName,
          picture, notes, addressbookID
        FROM person
        WHERE id = ${dbID}
        `) as any;
    }
    person.dbID = sanitize.integer(dbID);
    person.name = sanitize.label(row.name);
    person.firstName = row.firstName ? sanitize.label(row.firstName) : null;
    person.lastName = row.lastName ? sanitize.stringOrNull(row.lastName) : null;
    person.picture = row.picture ? sanitize.url(row.picture) : null;
    person.notes = sanitize.stringOrNull(row.notes);
    if (row.addressbook) {
      let addressbookID = sanitize.integer(row.addressbookID);
      if (person.addressbook) {
        assert(person.addressbook.dbID == addressbookID, "Wrong addressbook");
      } else {
        person.addressbook = appGlobal.addressbooks.find(ab => ab.dbID == addressbookID);
      }
    }
    SQLPerson.readContacts(person);
    return person;
  }

  protected static async readContacts(person: Person) {
    assert(person.dbID, "Need person ID to read the person");
    let rows = await (await getDatabase()).all(sql`
      SELECT
        type, value,
        protocol, purpose, preference
      FROM personContact
      WHERE personID = ${person.dbID}
      `) as any;
    for (let row of rows) {
      let purpose = row.purpose ? sanitize.label(row.purpose) : null;
      let contactEntry = new ContactEntry(sanitize.string(row.value), purpose);
      contactEntry.preference = sanitize.integer(row.preference);
      contactEntry.protocol = sanitize.stringOrNull(row.protocol);
      let type = row.type;
      if (type == ContactType.EMailAddress) {
        person.emailAddresses.add(contactEntry);
      } else if (type == ContactType.Chat) {
        person.chatAccounts.add(contactEntry);
      } else if (type == ContactType.Phone) {
        person.phoneNumbers.add(contactEntry);
      } else if (type == ContactType.StreetAddress) {
        person.streetAddresses.add(contactEntry);
      } else {
        console.log("contact detail", row);
        return; // Forward compatibility. Do not throw.
      }
    }
  }

  static async deleteIt(person: Person) {
    assert(person.dbID, "Need Person DB ID to delete");
    await (await getDatabase()).run(sql`
      DELETE FROM person
      WHERE id = ${person.dbID}
      `);
  }

  static async readAll(addressbook: Addressbook): Promise<void> {
    let rows = await (await getDatabase()).all(sql`
      SELECT
        id, name, firstName, lastName,
        picture, notes
      FROM person
      WHERE addressbookID = ${addressbook.dbID}
      `) as any;
    let newPersons = new ArrayColl<Person>();
    for (let row of rows) {
      let personID = sanitize.integer(row.id);
      let person = addressbook.persons.find(person => person.dbID == personID);
      if (!person) {
        person = addressbook.newPerson();
        newPersons.add(person);
      }
      person.addressbook = addressbook;
      await SQLPerson.read(row.id, person, row);
    }
    addressbook.persons.addAll(newPersons);
  }
}

enum ContactType {
  EMailAddress = 1,
  Chat = 2,
  Phone = 3,
  StreetAddress = 4,
}
