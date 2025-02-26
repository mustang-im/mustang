import { Person, ContactEntry } from '../../Abstract/Person';
import type { OWAAddressbook } from './OWAAddressbook';
import OWACreatePersonaRequest from "./Request/OWACreatePersonaRequest";
import OWADeletePersonaRequest from "./Request/OWADeletePersonaRequest";
import OWAUpdatePersonaRequest from "./Request/OWAUpdatePersonaRequest";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";

const PhysicalAddressElements = ["Street", "City", "State", "PostalCode", "Country"];
const PhysicalAddressPurposes = { Business: "work", Home: "home", Other: "other" };
const PhoneMapping: [string, string, string, string?][] = [
  ["work", "tel", "BusinessPhoneNumbers", "BusinessPhoneNumbers2"],
  ["home", "tel", "HomePhones", "HomePhones2"],
  ["mobile", "tel", "MobilePhones", "CarPhones"],
  ["other", "tel", "OtherTelephones"],
  ["work", "fax", "WorkFaxes"],
  ["home", "fax", "HomeFaxes"],
  ["other", "fax", "OtherFaxes"],
];

export class OWAPerson extends Person {
  addressbook: OWAAddressbook | null;
  fields: Record<string, string> = this.toFields();

  get personaID() {
    return this.id;
  }
  set personaID(val) {
    this.id = val;
  }

  fromJSON(json: any): OWAPerson {
    this.personaID = sanitize.nonemptystring(json.PersonaId.Id);
    this.name = sanitize.nonemptystring(json.DisplayName, "");
    this.firstName = sanitize.nonemptystring(json.GivenName, "");
    this.lastName = sanitize.nonemptystring(json.Surname, "");
    this.emailAddresses.replaceAll(json.EmailAddresses?.filter(address => !address.RoutingType || address.RoutingType == "SMTP").map(address => new ContactEntry(sanitize.nonemptystring(address.EmailAddress), "work", "mailto")) || []);
    this.phoneNumbers.replaceAll(PhoneMapping.flatMap(([purpose, protocol, ...keys]) => keys.map(key => json[key + "Array"]?.[0]?.Value?.Number).filter(Boolean).map(number => new ContactEntry(number, purpose, protocol))));
    this.chatAccounts.replaceAll(json.ImAddress ? [new ContactEntry(sanitize.string(json.ImAddress), "other")] : []);
    this.streetAddresses.replaceAll(Object.keys(PhysicalAddressPurposes).flatMap(purpose => json[purpose + "AddressesArray"]?.filter(entry => entry?.Value).map(entry => new ContactEntry(PhysicalAddressElements.map(element => sanitize.nonemptystring(entry.Value[element], "")).join("\n"), PhysicalAddressPurposes[purpose])) || []));
    this.notes = sanitize.nonemptystring(json.Notes, "");
    this.company = sanitize.nonemptystring(json.CompanyName, "");
    this.department = sanitize.nonemptystring(json.Department, "");
    this.position = sanitize.nonemptystring(json.Title, "");
    this.fields = this.toFields();
    return this;
  }

  async saveToServer() {
    let fields = this.toFields();
    if (Object.keys(fields).every(key => fields[key] == this.fields[key])) {
      return;
    }
    let request = this.personaID ? new OWAUpdatePersonaRequest(this.personaID, this.fields, fields) : new OWACreatePersonaRequest(this.fields, fields);
    let response = await this.addressbook.account.callOWA(request);
    this.name = sanitize.nonemptystring(response.DisplayName, "");
    this.personaID = sanitize.nonemptystring(response.PersonaId.Id);
    this.fields = fields;
  }

  protected toFields(): Record<string, string> {
    let fields: Record<string, string> = {};
    //fields.PersonaDisplayName = this.name;
    fields.PersonaGivenNames = this.firstName;
    fields.PersonaSurnames = this.lastName;
    for (let i = 1; i <= 3; i++) {
      let value = this.emailAddresses.getIndex(i - 1)?.value || "";
      fields[`PersonaEmails${i}OriginalDisplayNames`] = fields[`PersonaEmails${i}`] = value;
    }
    for (let [purpose, protocol, ...keys] of PhoneMapping) {
      let values = this.phoneNumbers.contents.filter(entry => entry.purpose == purpose && (entry.protocol || "tel") == protocol).map(entry => entry.value);
      for (let i = 0; i < keys.length; i++) {
        fields["Persona" + keys[i]] = values[i] || "";
      }
    }
    fields.PersonaImAddresses = this.chatAccounts.getIndex(0)?.value || "";
    fields.PersonaTitles = this.position || "";
    fields.PersonaDepartments = this.department || "";
    fields.PersonaCompanyNames = this.company || "";
    fields.PersonaBusinessAddresses = (this.streetAddresses.find(entry => entry.purpose == "work")?.value || "\n\n\n\n").replace(/\n/g, "$#$");
    fields.PersonaHomeAddresses = (this.streetAddresses.find(entry => entry.purpose == "home")?.value || "\n\n\n\n").replace(/\n/g, "$#$");
    fields.PersonaOtherAddresses = (this.streetAddresses.find(entry => entry.purpose == "other")?.value || "\n\n\n\n").replace(/\n/g, "$#$");
    fields.PersonaBodies = this.notes;
    return fields;
  }

  async deleteFromServer() {
    let request = new OWADeletePersonaRequest(this.personaID);
    await this.addressbook.account.callOWA(request);
    this.addressbook.persons.remove(this);
  }
}
