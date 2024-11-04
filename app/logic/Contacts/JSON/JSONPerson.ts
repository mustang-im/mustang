import { ContactEntry, Person } from "../../Abstract/Person";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { appGlobal } from "../../app";
import { assert } from "../../util/util";
import { Collection } from "svelte-collections";


export class JSONPerson {
  static save(person: Person): any {
    assert(person.addressbook?.dbID, "Need address book ID to save the person");
    let json: any = {};
    json.name = person.name;
    json.firstName = person.firstName;
    json.lastName = person.lastName;
    json.picture = person.picture;
    json.notes = person.notes;
    json.popularity = person.popularity;
    json.pID = person.id;
    json.addressbookID = person.addressbook?.dbID;
    this.saveContacts(person, json);
    return json;
  }

  protected static saveContacts(person: Person, json: any) {
    json.emailAddresses = this.saveContactsOfType(person.emailAddresses);
    json.chatAccounts = this.saveContactsOfType(person.chatAccounts);
    json.phoneNumbers = this.saveContactsOfType(person.phoneNumbers);
    json.streetAddresses = this.saveContactsOfType(person.streetAddresses);
    json.urls = this.saveContactsOfType(person.urls);
    json.custom = this.saveContactsOfType(person.custom);
  }

  protected static saveContactsOfType(contacts: Collection<ContactEntry>) {
    return contacts.map(c => this.saveContact(c));
  }

  protected static saveContact(contact: ContactEntry): any {
    let json: any = {};
    json.value = contact.value;
    json.protocol = contact.protocol;
    json.purpose = contact.purpose;
    json.preference = contact.preference;
    return json;
  }

  static read(dbID: number, person: Person, json: any): Person {
    person.dbID = sanitize.integer(dbID);
    person.name = sanitize.label(json.name);
    person.firstName = sanitize.label(json.firstName, null);
    person.lastName = sanitize.label(json.lastName, null);
    person.picture = sanitize.url(json.picture, null);
    person.notes = sanitize.string(json.notes, null);
    person.popularity = sanitize.integer(json.popularity, null);
    person.id = sanitize.string(json.pID, null);
    if (json.addressbookID) {
      let addressbookID = sanitize.integer(json.addressbookID);
      if (person.addressbook) {
        assert(person.addressbook.dbID == addressbookID, "Wrong addressbook");
      } else {
        person.addressbook = appGlobal.addressbooks.find(ab => ab.dbID == addressbookID);
      }
    }
    return person;
  }

  protected static readContacts(person: Person, json: any) {
    assert(person.dbID, "Need person ID to read the person");
    person.emailAddresses.addAll(this.readContactsOfType(json.emailAddresses));
    person.chatAccounts.addAll(this.readContactsOfType(json.chatAccounts));
    person.phoneNumbers.addAll(this.readContactsOfType(json.phoneNumbers));
    person.streetAddresses.addAll(this.readContactsOfType(json.streetAddresses));
    person.urls.addAll(this.readContactsOfType(json.urls));
    person.custom.addAll(this.readContactsOfType(json.custom));
  }

  protected static readContactsOfType(json: any): Collection<ContactEntry> {
    let contacts = new Collection<ContactEntry>();
    for (let contact of json) {
      contacts.add(this.readContact(contact));
    }
    return contacts;
  }

  protected static readContact(json: any): ContactEntry {
    let purpose = sanitize.label(json.purpose);
    let contact: ContactEntry = new ContactEntry(sanitize.string(json.value), purpose);
    contact.preference = sanitize.integer(json.preference, 100);
    contact.protocol = sanitize.string(json.protocol, null);
    return contact;
  }
}