import { ContactEntry, Person } from "../../Abstract/Person";
import { StreetAddress } from "../../Contacts/StreetAddress";
import { appGlobal } from "../../app";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assert } from "../../util/util";
import { ArrayColl, Collection } from "svelte-collections";

export class JSONPerson {
  static save(person: Person): any {
    assert(person.addressbook?.id, "Need address book ID to save the person");
    let json: any = {};
    json.id = person.id;
    json.name = person.name;
    json.firstName = person.firstName;
    json.lastName = person.lastName;
    json.picture = person.picture;
    json.notes = person.notes;
    json.company = person.company;
    json.department = person.department;
    json.position = person.position;
    json.popularity = person.popularity;
    json.addressbookID = person.addressbook?.id;
    return json;
  }

  static saveContacts(person: Person, json: any): any {
    json.emailAddresses = this.saveContactsOfType(person.emailAddresses);
    json.chatAccounts = this.saveContactsOfType(person.chatAccounts);
    json.phoneNumbers = this.saveContactsOfType(person.phoneNumbers);
    json.streetAddresses = this.saveStreetAddresses(person.streetAddresses);
    json.urls = this.saveContactsOfType(person.urls);
    json.custom = this.saveContactsOfType(person.custom);
    return json;
  }

  static saveContactsOfType(contacts: Collection<ContactEntry>): any[] {
    return contacts.contents.map(c => this.saveContact(c));
  }

  static saveContact(contact: ContactEntry): any {
    let json: any = {};
    json.value = contact.value;
    json.protocol = contact.protocol;
    json.purpose = contact.purpose;
    json.preference = contact.preference;
    return json;
  }

  static saveStreetAddresses(addresses: Collection<ContactEntry>): any[] {
    return addresses.contents.map(c => this.saveAddress(c));
  }

  static saveAddress(contact: ContactEntry): any {
    let json: any = new StreetAddress(contact.value).toJSON();
    json.protocol = contact.protocol;
    json.purpose = contact.purpose;
    json.preference = contact.preference;
    return json;
  }

  static read(person: Person, json: any): Person {
    person.id = sanitize.string(json.id, null);
    person.name = sanitize.label(json.name);
    person.firstName = sanitize.label(json.firstName, null);
    person.lastName = sanitize.string(json.lastName, null);
    person.picture = sanitize.url(json.picture, null);
    person.notes = sanitize.string(json.notes, null);
    person.company = sanitize.string(person.company, null);
    person.department = sanitize.string(person.department, null);
    person.position = sanitize.string(person.position, null);
    person.popularity = sanitize.integer(json.popularity, 0);
    if (json.addressbookID) {
      let addressbookID = sanitize.nonemptystring(json.addressbookID);
      if (person.addressbook) {
        assert(person.addressbook.id == addressbookID, "Wrong addressbook");
      } else {
        person.addressbook = appGlobal.addressbooks.find(ab => ab.id == addressbookID);
      }
    }
    JSONPerson.readContacts(person, json);
    return person;
  }

  protected static readContacts(person: Person, json: any) {
    assert(person.id, "Need person ID to read the person");
    if (json.emailAddresses) {
      person.emailAddresses.addAll(this.readContactsOfType(json.emailAddresses));
    }
    if (json.chatAccounts) {
      person.chatAccounts.addAll(this.readContactsOfType(json.chatAccounts));
    }
    if (json.phoneNumbers) {
      person.phoneNumbers.addAll(this.readContactsOfType(json.phoneNumbers));
    }
    if (json.streetAddresses) {
      person.streetAddresses.addAll(this.readStreetAddresses(json.streetAddresses));
    }
    if (json.urls) {
      person.urls.addAll(this.readContactsOfType(json.urls));
    }
    if (json.custom) {
      person.custom.addAll(this.readContactsOfType(json.custom));
    }
  }

  protected static readContactsOfType(contacts: any[]): ArrayColl<ContactEntry> {
    return new ArrayColl(contacts.map(c => this.readContact(c)));
  }

  protected static readContact(json: any): ContactEntry {
    let purpose = sanitize.label(json.purpose);
    let contact = new ContactEntry(sanitize.string(json.value), purpose);
    contact.preference = sanitize.integer(json.preference, 100);
    contact.protocol = sanitize.string(json.protocol, null);
    return contact;
  }

  protected static readStreetAddresses(addresses: any[]): ArrayColl<ContactEntry> {
    return new ArrayColl(contacts.map(c => this.readAddress(c)));
  }

  protected static readAddress(json: any): ContactEntry {
    let purpose = sanitize.label(json.purpose);
    let address = new StreetAddress();
    address.fromJSON(json);
    let contact = new ContactEntry(address.toString(), purpose);
    contact.preference = sanitize.integer(json.preference, 100);
    contact.protocol = sanitize.string(json.protocol, null);
    return contact;
  }
}
