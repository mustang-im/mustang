import { Person, ContactEntry } from '../../Abstract/Person';
import type { ActiveSyncAddressbook } from './ActiveSyncAddressbook';
import { SQLPerson } from '../SQL/SQLPerson';
import { EASError } from "../../Mail/ActiveSync/ActiveSyncAccount";
import { assert } from "../../util/util";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { parseOneAddress, type ParsedMailbox } from "email-addresses";

const PhysicalAddressElements = ["Street", "City", "PostalCode", "State", "Country"];
const PhoneMapping: [string, string, number][] = [
  ["home", "tel", 2],
  ["work", "tel", 2],
  ["home", "fax", 1],
  ["work", "fax", 1],
  ["mobile", "tel", 1],
];

enum ContactElements {
  home = "Home",
  work = "Business",
  other = "Other",
  mobile = "Mobile",
  tel = "Phone",
  fax = "Fax",
};

export class ActiveSyncPerson extends Person {
  addressbook: ActiveSyncAddressbook | null;

  get serverID() {
    return this.id;
  }
  set serverID(val) {
    this.id = val;
  }

  fromWBXML(wbxmljs: any) {
    this.firstName = sanitize.nonemptystring(wbxmljs.FirstName, "");
    this.lastName = sanitize.nonemptystring(wbxmljs.LastName, "");
    this.name = this.firstName ? this.lastName ? `${this.firstName} ${this.lastName}` : this.firstName : this.lastName;
    this.emailAddresses.replaceAll([wbxmljs.Email1Address, wbxmljs.Email2Address, wbxmljs.Email3Address].filter(Boolean).map(address => new ContactEntry((parseOneAddress(address) as ParsedMailbox).address, "work", "mailto")));
    this.phoneNumbers.replaceAll(PhoneMapping.flatMap(([purpose, protocol, count]) => ["", "2"].slice(0, count).map(index => wbxmljs[`${ContactElements[purpose]}${index}${ContactElements[protocol]}Number`]).filter(Boolean).map(value => new ContactEntry(value, purpose, protocol))));
    this.chatAccounts.replaceAll([wbxmljs.IMAddress, wbxmljs.IMAddress2, wbxmljs.IMAddress3].filter(Boolean).map(address => new ContactEntry(address, "other")));
    this.streetAddresses.replaceAll(["home", "work", "other"].filter(purpose => PhysicalAddressElements.some(element => wbxmljs[`${ContactElements[purpose]}Address${element}`])).map(purpose => new ContactEntry(PhysicalAddressElements.map(element => sanitize.nonemptystring(wbxmljs[`${ContactElements[purpose]}Address${element}`], "")).join("\n"), purpose)));
    this.notes = sanitize.nonemptystring(wbxmljs.Body?.Data, "");
    this.company = sanitize.nonemptystring(wbxmljs.CompanyName, "");
    this.department = sanitize.nonemptystring(wbxmljs.Department, "");
    this.position = sanitize.nonemptystring(wbxmljs.JobTitle, "");
  }

  async save() {
    let fields: Record<string, string | { Type: string, Data: string | {} }> = {
      FirstName: this.firstName,
      LastName: this.lastName,
      Body: {
        Type: "1",
        Data: this.notes || {}, // Special case for empty notes
      },
      JobTitle: this.position || "",
      Department: this.department || "",
      CompanyName: this.company || "",
    }
    this.emailAddresses.contents.slice(0, 3).forEach((entry, i) => fields[`Email${i+1}Address`] = entry.value);
    for (let [purpose, protocol, count] of PhoneMapping) {
      this.phoneNumbers.contents.filter(entry => entry.purpose == purpose && (entry.protocol || "tel") == protocol).slice(0, count).forEach((entry, i) => fields[`${ContactElements[purpose]}${"2".slice(0, i)}${ContactElements[protocol]}Number`] = entry.value);
    }
    this.chatAccounts.contents.slice(0, 3).forEach((entry, i) => fields[`IMAddress${i ? i + 1 : ""}`] = entry.value);
    for (let entry of this.streetAddresses) {
      if (entry.purpose in ContactElements && entry.value) {
        let values = entry.value.split("\n");
        assert(values.length == 5, "Street address must have exactly 5 lines: Street and house, City, ZIP Code, State, Country");
        PhysicalAddressElements.forEach((element, index) => fields[`${ContactElements[entry.purpose]}Address${element}`] = values[index]);
      }
    }
    let data = this.serverID ? {
      GetChanges: "0",
      Commands: {
        Change: {
          ServerId: this.serverID,
          ApplicationData: fields,
        },
      },
    } : {
      GetChanges: "0",
      Commands: {
        Add: {
          ClientId: await this.addressbook.account.nextClientID(),
          ApplicationData: fields,
        },
      },
    };
    let response = await this.addressbook.queuedSyncRequest(data);
    if (response.Responses) {
      if (response.Responses.Change) {
        throw new EASError("Sync", response.Responses.Change.Status);
      }
      if (response.Responses.Add) {
        if (response.Responses.Add.Status != "1") {
          throw new EASError("Sync", response.Responses.Add.Status);
        }
        this.serverID = response.Responses.Add.ServerId;
      }
    }
    await SQLPerson.save(this);
  }

  async deleteIt() {
    let data = {
      DeletesAsMoves: "1",
      GetChanges: "0",
      Commands: {
        Delete: {
          ServerId: this.serverID,
        },
      },
    };
    let response = await this.addressbook.queuedSyncRequest(data);
    if (response.Responses) {
      throw new EASError("Sync", response.Responses.Delete.Status);
    }
    await super.deleteIt();
  }
}
