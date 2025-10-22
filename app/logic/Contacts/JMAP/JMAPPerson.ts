import { Person, ContactEntry } from '../../Abstract/Person';
import { StreetAddress } from '../StreetAddress';
import type { JMAPAddressbook } from './JMAPAddressbook';
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { ensureArray } from "../../util/util";

export class JMAPPerson extends Person {
  declare addressbook: JMAPAddressbook | null;

  get itemID() {
    return this.id;
  }
  set itemID(val) {
    this.id = val;
  }

  fromJMAP(jmap: any) {
    /*
    this.itemID = sanitize.nonemptystring(jmap.ItemId.Id);
    this.name = sanitize.nonemptystring(jmap.DisplayName, "");
    this.firstName = sanitize.nonemptystring(jmap.GivenName, "");
    this.lastName = sanitize.nonemptystring(jmap.Surname, "");
    if (jmap.EmailAddresses?.Entry) {
      this.emailAddresses.replaceAll(ensureArray(jmap.EmailAddresses.Entry).filter(entry => entry.Value && (!entry.RoutingType || entry.RoutingType == "SMTP")).map(entry => new ContactEntry(sanitize.nonemptystring(entry.Value), "work", "mailto")));
    }
    if (jmap.PhoneNumbers?.Entry) {
      for (let entry of ensureArray(jmap.PhoneNumbers.Entry)) {
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
    if (jmap.ImAddresses?.Entry) {
      this.chatAccounts.replaceAll(ensureArray(jmap.ImAddresses.Entry).filter(entry => entry.Value).map(entry => new ContactEntry(sanitize.nonemptystring(entry.Value), "other")));
    }
    if (jmap.PhysicalAddresses?.Entry) {
      this.streetAddresses.replaceAll(ensureArray(jmap.PhysicalAddresses.Entry).map(entry =>
        new ContactEntry(JMAPPerson.jmapToStreetAddress(entry).toString(), PhysicalAddressPurposes[entry.Key])));
    }
    this.notes = sanitize.nonemptystring(jmap.Body?.Value, "");
    this.company = sanitize.nonemptystring(jmap.CompanyName, "");
    this.department = sanitize.nonemptystring(jmap.Department, "");
    this.position = sanitize.nonemptystring(jmap.JobTitle, "");
    */
  }

  protected static jmapToStreetAddress(entry: any): StreetAddress {
    /*
    let streetAddress = new StreetAddress();
    for (let ourProp in PhysicalAddressElements) {
      let jmapProp = PhysicalAddressElements[ourProp];
      streetAddress[ourProp] = sanitize.nonemptystring(entry[jmapProp], null);
    }
    return streetAddress;
    */
  }

  async saveToServer() {
  }

  async deleteFromServer() {
  }
}
