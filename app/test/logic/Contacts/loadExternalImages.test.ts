// @vitest-environment happy-dom
// app first, to resolve the import cycle around Abstract/Account.ts
import "../../../logic/app";
import { Person } from "../../../logic/Abstract/Person";
import { convertVCardToPerson, getUpdatedVCard, parseContact, personToVCard } from "../../../logic/Contacts/VCard/VCard";
import { JSContact } from "../../../logic/Contacts/JMAP/JSContact";
import type { TJSContact } from "../../../logic/Contacts/JMAP/TJSContact";
import { EWSAddressbook } from "../../../logic/Contacts/EWS/EWSAddressbook";
import { EWSPerson } from "../../../logic/Contacts/EWS/EWSPerson";
import { OWAAddressbook } from "../../../logic/Contacts/OWA/OWAAddressbook";
import { OWAPerson } from "../../../logic/Contacts/OWA/OWAPerson";
import { OWAAccount } from "../../../logic/Mail/OWA/OWAAccount";
import { DummyAddressbookStorage } from "../../../logic/Contacts/SQL/DummyAddressbookStorage";
import { describe, expect, test } from "vitest";

/* The user allowed or refused pictures from the Internet for a contact.
 * Other devices of the user get that via the contact on the server. */

const kVCard = "BEGIN:VCARD\r\nVERSION:4.0\r\nUID:alice\r\nFN:Alice Example\r\nX-OTHER-APP:keep\r\nEND:VCARD\r\n";

function newPerson(loadExternalImages: boolean | null): Person {
  let person = new Person();
  person.name = "Alice Example";
  person.loadExternalImages = loadExternalImages;
  return person;
}

describe("CardDAV", () => {
  test.each([true, false])("another device reads %s", loadExternalImages => {
    let otherDevice = new Person();
    convertVCardToPerson(personToVCard(newPerson(loadExternalImages)), otherDevice);
    expect(otherDevice.loadExternalImages).toBe(loadExternalImages);
  });

  test("a contact from another app has no decision", () => {
    let person = new Person();
    convertVCardToPerson(kVCard, person);
    expect(person.loadExternalImages).toBe(null);
  });

  test("a change replaces the value on the server, and keeps the rest", () => {
    let fromServer = getUpdatedVCard(newPerson(true), parseContact(kVCard));
    let person = new Person();
    convertVCardToPerson(fromServer, person);
    person.loadExternalImages = false;

    let toServer = getUpdatedVCard(person, parseContact(fromServer));

    expect(toServer.match(/^X-MUSTANG-LOAD-EXTERNAL-IMAGES[;:]/gm)?.length).toBe(1);
    let otherDevice = new Person();
    convertVCardToPerson(toServer, otherDevice);
    expect(otherDevice.loadExternalImages).toBe(false);
    expect(toServer).toContain("X-OTHER-APP:keep");
  });
});

describe("JMAP", () => {
  test.each([true, false])("another device reads %s", loadExternalImages => {
    let jscontact = { version: "1.0" } as TJSContact;
    JSContact.fromPerson(newPerson(loadExternalImages), jscontact);
    let otherDevice = new Person();
    JSContact.toPerson(jscontact, otherDevice);
    expect(otherDevice.loadExternalImages).toBe(loadExternalImages);
  });

  test("a contact from another app has no decision", () => {
    let person = new Person();
    JSContact.toPerson({ version: "1.0", name: { full: "Alice Example" } } as TJSContact, person);
    expect(person.loadExternalImages).toBe(null);
  });
});

const kNamedProperty = {
  DistinguishedPropertySetId: "PublicStrings",
  PropertyName: "mustang.im:loadExternalImages",
  PropertyType: "Boolean",
};

describe("EWS", () => {
  /** Answers like Exchange does, and remembers the requests */
  function newAddressbook(contact: any): EWSAddressbook {
    let addressbook = new EWSAddressbook();
    addressbook.mainAccount = {
      errorCallback: (ex: Error) => { throw ex; },
      requests: [] as any[],
      async callEWS(request: any) {
        this.requests.push(request);
        if (request.m$GetItem) {
          return { Items: { Contact: contact } };
        }
        return { Items: { Contact: { ItemId: { Id: "contact-item" } } } };
      },
    } as any;
    addressbook.storage = new DummyAddressbookStorage();
    addressbook.folderID = "contacts-folder";
    return addressbook;
  }

  function contactXML(value?: string): any {
    let contact: any = { ItemId: { Id: "contact-item" }, DisplayName: "Alice Example" };
    if (value) {
      contact.ExtendedProperty = { ExtendedFieldURI: kNamedProperty, Value: value };
    }
    return contact;
  }

  test.each([[true, "true"], [false, "false"], [null, undefined]])("reads %s from the contact", async (loadExternalImages, value) => {
    let addressbook = newAddressbook(contactXML(value));

    await addressbook.listPersons([{ ItemId: { Id: "contact-item" } }]);

    let getItem = (addressbook.account as any).requests[0].m$GetItem;
    expect(getItem.m$ItemShape.t$AdditionalProperties.t$ExtendedFieldURI).toEqual(kNamedProperty);
    expect(addressbook.persons.first.loadExternalImages).toBe(loadExternalImages);
  });

  test("a new contact gets it, where the schema wants it", async () => {
    let addressbook = newAddressbook(contactXML());
    let person = new EWSPerson(addressbook);
    person.name = "Alice Example";
    person.notes = "Met at the conference";
    person.loadExternalImages = true;

    await person.saveToServer();

    let contact = (addressbook.account as any).requests[0].m$CreateItem.m$Items.t$Contact;
    expect(contact.t$ExtendedProperty).toEqual({ t$ExtendedFieldURI: kNamedProperty, t$Value: true });
    let fields = Object.keys(contact);
    expect(fields.indexOf("t$Body")).toBeLessThan(fields.indexOf("t$ExtendedProperty"));
    expect(fields.indexOf("t$ExtendedProperty")).toBeLessThan(fields.indexOf("t$DisplayName"));
  });

  test("a changed contact gets it", async () => {
    let addressbook = newAddressbook(contactXML());
    let person = new EWSPerson(addressbook);
    person.itemID = "contact-item";
    person.loadExternalImages = false;

    await person.saveToServer();

    let updates = (addressbook.account as any).requests[0].m$UpdateItem.m$ItemChanges.t$ItemChange.t$Updates.t$SetItemField;
    let update = updates.find(field => field.t$ExtendedFieldURI);
    expect(update.t$ExtendedFieldURI).toEqual(kNamedProperty);
    expect(update.t$Contact.t$ExtendedProperty.t$Value).toBe(false);
  });

  test("a contact without decision doesn't touch it on the server", async () => {
    let addressbook = newAddressbook(contactXML());
    let person = new EWSPerson(addressbook);
    person.itemID = "contact-item";

    await person.saveToServer();

    let updates = (addressbook.account as any).requests[0].m$UpdateItem.m$ItemChanges.t$ItemChange.t$Updates.t$SetItemField;
    expect(updates.some(field => field.t$ExtendedFieldURI)).toBe(false);
  });
});

describe("OWA", () => {
  function personaJSON(): any {
    return {
      PersonaId: { Id: "contact-persona" },
      DisplayName: "Alice Example",
      EmailAddresses: [{ EmailAddress: "alice@example.com" }],
      AttributionsArray: [{ SourceId: { Id: "contact-item" }, IsWritable: true }],
    };
  }

  /** Answers like Exchange does, and remembers the requests */
  function newAddressbook(value?: string): OWAAddressbook {
    let addressbook = new OWAAddressbook();
    addressbook.mainAccount = {
      errorCallback: (ex: Error) => { throw ex; },
      itemsFromResponses: OWAAccount.prototype.itemsFromResponses,
      requests: [] as any[],
      async callOWA(request: any) {
        this.requests.push(request);
        switch (request.action) {
        case "GetPersona":
          return { Persona: personaJSON() };
        case "GetNotesForPersona":
          return {};
        case "GetItem":
          return {
            ResponseClass: "Success",
            Items: [{
              ItemId: { Id: "contact-item" },
              ExtendedProperty: value ? [{ ExtendedFieldURI: kNamedProperty, Value: value }] : undefined,
            }],
          };
        default: // CreatePersona, UpdatePersona, UpdateItem
          return { PersonaId: { Id: "contact-persona" }, DisplayName: "Alice Example" };
        }
      },
    } as any;
    addressbook.storage = new DummyAddressbookStorage();
    addressbook.folderID = "contacts-folder";
    return addressbook;
  }

  function requestsOfAction(addressbook: OWAAddressbook, action: string): any[] {
    return (addressbook.account as any).requests.filter(request => request.action == action);
  }

  test.each([[true, "true"], [false, "false"], [null, undefined]])("reads %s from the contact behind the persona", async (loadExternalImages, value) => {
    let addressbook = newAddressbook(value);

    await addressbook.listPersons([personaJSON()]);

    let getItem = requestsOfAction(addressbook, "GetItem")[0];
    expect(getItem.Body.ItemShape.AdditionalProperties).toContainEqual(expect.objectContaining(kNamedProperty));
    expect(addressbook.persons.first.loadExternalImages).toBe(loadExternalImages);
  });

  test("saves it on the contact behind the persona", async () => {
    let addressbook = newAddressbook();
    let person = new OWAPerson(addressbook);
    person.fromJSON(personaJSON());
    person.loadExternalImages = true;

    await person.saveToServer();

    let updateItem = requestsOfAction(addressbook, "UpdateItem")[0];
    let change = updateItem.Body.ItemChanges[0];
    expect(change.ItemId.Id).toBe("contact-item");
    expect(change.Updates[0].Path).toEqual(expect.objectContaining(kNamedProperty));
    expect(change.Updates[0].Item.ExtendedProperty[0].Value).toBe("true");
  });

  test("a contact without decision doesn't touch it on the server", async () => {
    let addressbook = newAddressbook();
    let person = new OWAPerson(addressbook);
    person.fromJSON(personaJSON());

    await person.saveToServer();

    expect(requestsOfAction(addressbook, "UpdateItem").length).toBe(0);
  });
});
