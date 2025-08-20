import { Person, ContactEntry } from '../../Abstract/Person';
import { StreetAddress } from '../StreetAddress';
import type { EWSAddressbook } from './EWSAddressbook';
import { EWSCreateItemRequest } from "../../Mail/EWS/Request/EWSCreateItemRequest";
import { EWSDeleteItemRequest } from "../../Mail/EWS/Request/EWSDeleteItemRequest";
import { EWSUpdateItemRequest } from "../../Mail/EWS/Request/EWSUpdateItemRequest";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { ensureArray } from "../../util/util";

export class EWSPerson extends Person {
  declare addressbook: EWSAddressbook | null;

  get itemID() {
    return this.id;
  }
  set itemID(val) {
    this.id = val;
  }

  fromXML(xmljs: any) {
    this.itemID = sanitize.nonemptystring(xmljs.ItemId.Id);
    this.name = sanitize.nonemptystring(xmljs.DisplayName, "");
    this.firstName = sanitize.nonemptystring(xmljs.GivenName, "");
    this.lastName = sanitize.nonemptystring(xmljs.Surname, "");
    if (xmljs.EmailAddresses?.Entry) {
      this.emailAddresses.replaceAll(ensureArray(xmljs.EmailAddresses.Entry).filter(entry => entry.Value && (!entry.RoutingType || entry.RoutingType == "SMTP")).map(entry => new ContactEntry(sanitize.nonemptystring(entry.Value), "work", "mailto")));
    }
    if (xmljs.PhoneNumbers?.Entry) {
      for (let entry of ensureArray(xmljs.PhoneNumbers.Entry)) {
        let value = sanitize.nonemptystring(entry.Value, null);
        switch (value && entry.Key) { // Key may have other unsupported values
        case "HomePhone":
        case "HomePhone2":
          this.phoneNumbers.add(new ContactEntry(value, "home", "tel"));
          break;
        case "BusinessPhone":
        case "BusinessPhone2":
          this.phoneNumbers.add(new ContactEntry(value, "work", "tel"));
          break;
        case "HomeFax":
          this.phoneNumbers.add(new ContactEntry(value, "home", "fax"));
          break;
        case "BusinessFax":
          this.phoneNumbers.add(new ContactEntry(value, "work", "fax"));
          break;
        case "OtherFax":
          this.phoneNumbers.add(new ContactEntry(value, "other", "fax"));
          break;
        case "MobilePhone":
          this.phoneNumbers.add(new ContactEntry(value, "mobile", "tel"));
          break;
        }
      }
    }
    if (xmljs.ImAddresses?.Entry) {
      this.chatAccounts.replaceAll(ensureArray(xmljs.ImAddresses.Entry).filter(entry => entry.Value).map(entry => new ContactEntry(sanitize.nonemptystring(entry.Value), "other")));
    }
    if (xmljs.PhysicalAddresses?.Entry) {
      this.streetAddresses.replaceAll(ensureArray(xmljs.PhysicalAddresses.Entry).map(entry =>
        new ContactEntry(EWSPerson.ewsToStreetAddress(entry).toString(), PhysicalAddressPurposes[entry.Key])));
    }
    this.notes = sanitize.nonemptystring(xmljs.Body?.Value, "");
    this.company = sanitize.nonemptystring(xmljs.CompanyName, "");
    this.department = sanitize.nonemptystring(xmljs.Department, "");
    this.position = sanitize.nonemptystring(xmljs.JobTitle, "");
  }

  protected static ewsToStreetAddress(entry: any): StreetAddress {
    let streetAddress = new StreetAddress();
    for (let ourProp in PhysicalAddressElements) {
      let ewsProp = PhysicalAddressElements[ourProp];
      streetAddress[ourProp] = sanitize.nonemptystring(entry[ewsProp], null);
    }
    return streetAddress;
  }

  async saveToServer() {
    let request = this.itemID ? new EWSUpdateItemRequest(this.itemID) : new EWSCreateItemRequest({ m$SavedItemFolderId: { t$FolderId: { Id: this.addressbook.folderID } } });
    request.addField("Contact", "Body", this.notes && { BodyType: "Text", _TextContent_: this.notes }, "item:Body");
    request.addField("Contact", "DisplayName", this.name, "contacts:DisplayName");
    request.addField("Contact", "GivenName", this.firstName, "contacts:GivenName");
    request.addField("Contact", "CompanyName", this.company, "contacts:CompanyName");
    for (let i = 1; i <= 3; i++) {
      let entry = this.emailAddresses.getIndex(i - 1);
      request.addField("Contact", "EmailAddresses", entry && {
        t$Entry: {
          Key: "EmailAddress" + i,
          _TextContent_: entry.value,
        },
      }, "contacts:EmailAddress", "EmailAddress" + i);
    }
    for (let key in PhysicalAddressPurposes) {
      let entry = this.streetAddresses.find(entry => entry.purpose == PhysicalAddressPurposes[key]);
      let streetAddress = new StreetAddress(entry?.value);
      for (let ourProp in PhysicalAddressElements) {
        let ewsProp = PhysicalAddressElements[ourProp];
        let value = streetAddress[ourProp];
        request.addField("Contact", "PhysicalAddresses", value ? {
          t$Entry: {
            Key: key,
            ["t$" + ewsProp]: value,
          },
        } : null, "contacts:PhysicalAddress:" + ewsProp, key);
      }
    }
    for (let [purpose, protocol, count, key] of PhoneMapping) {
      let values = this.phoneNumbers.contents.filter(entry => entry.purpose == purpose && (entry.protocol || "tel") == protocol).map(entry => entry.value);
      for (let i = 0; i < count; i++) {
        request.addField("Contact", "PhoneNumbers", values[i] && {
          t$Entry: {
            Key: key,
            _TextContent_: values[i],
          },
        }, "contacts:PhoneNumber", key);
        key += "2";
      }
    }
    request.addField("Contact", "Department", this.department, "contacts:Department");
    for (let i = 1; i <= 3; i++) {
      let entry = this.chatAccounts.getIndex(i - 1);
      request.addField("Contact", "ImAddresses", entry && {
        t$Entry: {
          Key: "ImAddress" + i,
          _TextContent_: entry.value,
        },
      }, "contacts:ImAddress", "ImAddress" + i);
    }
    request.addField("Contact", "JobTitle", this.position, "contacts:JobTitle");
    request.addField("Contact", "Surname", this.lastName, "contacts:Surname");
    // console.log("EWSPerson.save()", request);
    let response = await this.addressbook.account.callEWS(request);
    this.itemID = sanitize.nonemptystring(response.Items.Contact.ItemId.Id);
  }

  async deleteFromServer() {
    let request = new EWSDeleteItemRequest(this.itemID);
    await this.addressbook.account.callEWS(request);
  }
}

const PhysicalAddressElements = {
  street: "Street",
  city: "City",
  postalCode: "PostalCode",
  state: "State",
  country: "CountryOrRegion",
};
const PhysicalAddressPurposes = { Business: "work", Home: "home", Other: "other" };
const PhoneMapping: [string, string, number, string][] = [
  ["home", "tel", 2, "HomePhone"],
  ["work", "tel", 2, "BusinessPhone"],
  ["home", "fax", 1, "HomeFax"],
  ["work", "fax", 1, "BusinessFax"],
  ["other", "fax", 1, "OtherFax"],
  ["mobile", "tel", 1, "MobilePhone"],
];
