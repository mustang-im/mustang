import { Person, ContactEntry } from '../../Abstract/Person';
import type { EWSAddressbook } from './EWSAddressbook';
import { ensureArray } from "../../Mail/EWS/EWSEMail";

const PhysicalAddressElements = ["Street", "City", "State", "PostalCode", "CountryOrRegion"];
const PhysicalAddressPurposes = { Business: "work", Home: "home", Other: "other" };

export class EWSPerson extends Person {
  addressbook: EWSAddressbook | null;

  get itemID() {
    return this.id;
  }
  set itemID(val) {
    this.id = val;
  }

  fromXML(xmljs: any) {
    this.itemID = xmljs.ItemId.Id;
    if (xmljs.DisplayName) {
      this.name = xmljs.DisplayName;
    }
    if (xmljs.GivenName) {
      this.firstName = xmljs.GivenName;
    }
    if (xmljs.Surname) {
      this.lastName = xmljs.Surname;
    }
    if (xmljs.EmailAddresses?.Entry) {
      this.emailAddresses.replaceAll(ensureArray(xmljs.EmailAddresses.Entry).filter(entry => entry.Value && (!entry.RoutingType || entry.RoutingType == "SMTP")).map(entry => new ContactEntry(entry.Value, null, "mailto")));
    }
    if (xmljs.PhoneNumbers?.Entry) {
      for (let entry of ensureArray(xmljs.PhoneNumbers.Entry).filter(entry => entry.Value)) {
        switch (entry.Key) {
        case "HomePhone":
        case "HomePhone2":
          this.phoneNumbers.add(new ContactEntry(entry.Value, "home", "tel"));
          break;
        case "BusinessPhone":
        case "BusinessPhone2":
          this.phoneNumbers.add(new ContactEntry(entry.Value, "work", "tel"));
          break;
        case "HomeFax":
          this.phoneNumbers.add(new ContactEntry(entry.Value, "home", "fax"));
          break;
        case "BusinessFax":
          this.phoneNumbers.add(new ContactEntry(entry.Value, "work", "fax"));
          break;
        case "OtherFax":
          this.phoneNumbers.add(new ContactEntry(entry.Value, "other", "fax"));
          break;
        case "MobilePhone":
          this.phoneNumbers.add(new ContactEntry(entry.Value, "mobile", "tel"));
          break;
        }
      }
    }
    if (xmljs.ImAddresses?.Entry) {
      this.chatAccounts.replaceAll(ensureArray(xmljs.ImAddresses.Entry).filter(entry => entry.Value).map(entry => new ContactEntry(entry.Value)));
    }
    if (xmljs.PhysicalAddresses?.Entry) {
      this.streetAddresses.replaceAll(ensureArray(xmljs.PhysicalAddresses.Entry).map(entry => new ContactEntry(PhysicalAddressElements.map(element => entry[element] || "").join("\n"), PhysicalAddressPurposes[entry.Key])));
    }
    if (xmljs.Body) {
      this.notes = xmljs.Body.Value;
    }
    if (xmljs.CompanyName) {
      this.company = xmljs.CompanyName;
    }
    if (xmljs.Department) {
      this.department = xmljs.Department;
    }
    if (xmljs.JobTitle) {
      this.position = xmljs.JobTitle;
    }
  }

  async save() {
    throw new Error("Not yet implemetned");
  }
}
