import { Person, ContactEntry } from '../../Abstract/Person';
import type { EWSAddressbook } from './EWSAddressbook';
import { SQLPerson } from '../SQL/SQLPerson';
import { ensureArray } from "../../Mail/EWS/EWSEMail";
import { assert } from "../../util/util";

const PhysicalAddressElements = ["Street", "City", "PostalCode", "State", "CountryOrRegion"];
const PhysicalAddressPurposes = { Business: "work", Home: "home", Other: "other" };
const PhoneMapping: [string, string, number, string][] = [
  ["home", "tel", 2, "HomePhone"],
  ["work", "tel", 2, "BusinessPhone"],
  ["home", "fax", 1, "HomeFax"],
  ["work", "fax", 1, "BusinessFax"],
  ["other", "fax", 1, "OtherFax"],
  ["mobile", "tel", 1, "MobilePhone"],
];

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
    if (this.itemID) {
      await this.update();
    } else {
      await this.create();
    }
    await SQLPerson.save(this);
  }

  async update() {
    let request = {
      m$UpdateItem: {
        m$ItemChanges: {
          t$ItemChange: {
            t$ItemId: {
              Id: this.itemID,
            },
            t$Updates: {
              t$SetItemField: [],
              t$DeleteItemField: [],
            },
          },
        },
        ConflictResolution: "AlwaysOverwrite",
      },
    };
    let updates = request.m$UpdateItem.m$ItemChanges.t$ItemChange.t$Updates;
    this.addUpdate(updates, "t$Body", this.notes && { BodyType: "Text", _TextContent_: this.notes }, "item:Body");
    this.addUpdate(updates, "t$DisplayName", this.name, "contacts:DisplayName");
    this.addUpdate(updates, "t$GivenName", this.firstName, "contacts:GivenName");
    this.addUpdate(updates, "t$CompanyName", this.company, "contacts:CompanyName");
    for (let i = 1; i <= 3; i++) {
      let entry = this.emailAddresses.getIndex(i - 1);
      this.addUpdate(updates, "t$EmailAddresses", entry && {
        t$Entry: {
          Key: "EmailAddress" + i,
          _TextContent_: entry.value,
        },
      }, "contacts:EmailAddress", "EmailAddress" + i);
    }
    for (let key in PhysicalAddressPurposes) {
      let entry = this.streetAddresses.find(entry => entry.purpose == PhysicalAddressPurposes[key]);
      if (entry) {
        let value: string | string[] = entry.value;
        if (value) {
          value = value.split("\n");
          assert(value.length == 5, "Street address must have exactly 5 lines: Street and house, City, ZIP Code, State, Country");
        }
        for (let i = 0; i < 5; i++) {
          this.addUpdate(updates, "t$PhysicalAddresses", value && value[i] && {
            t$Entry: {
              Key: key,
              ["t$" + PhysicalAddressElements[i]]: value[i],
            },
          }, "contacts:PhysicalAddress:" + PhysicalAddressElements[i], key);
        }
      }
    }
    for (let [purpose, protocol, count, key] of PhoneMapping) {
      let values = this.phoneNumbers.contents.filter(entry => entry.purpose == purpose && (entry.protocol || "tel") == protocol).map(entry => entry.value);
      for (let i = 0; i < count; i++) {
        this.addUpdate(updates, "t$PhoneNumbers", values[i] && {
          t$Entry: {
            Key: key,
            _TextContent_: values[i],
          },
        }, "contacts:PhoneNumber", key);
        key += "2";
      }
    }
    this.addUpdate(updates, "t$Department", this.department, "contacts:Department");
    for (let i = 1; i <= 3; i++) {
      let entry = this.chatAccounts.getIndex(i - 1);
      this.addUpdate(updates, "t$ImAddresses", entry && {
        t$Entry: {
          Key: "ImAddress" + i,
          _TextContent_: entry.value,
        },
      }, "contacts:ImAddress", "ImAddress" + i);
    }
    this.addUpdate(updates, "t$JobTitle", this.position, "contacts:JobTitle");
    this.addUpdate(updates, "t$Surname", this.lastName, "contacts:Surname");
    await this.addressbook.account.callEWS(request);
  }

  addUpdate(updates, key, value, FieldURI, FieldIndex?) {
    let field = {} as any;
    if (FieldIndex) {
      field.t$IndexedFieldURI = { FieldURI, FieldIndex };
    } else {
      field.t$FieldURI = { FieldURI };
    }
    if (!value) {
      updates.t$DeleteItemField.push(field);
    } else {
      field.t$Contact = { [key]: value };
      updates.t$SetItemField.push(field);
    }
  }

  async create() {
    let phoneNumbers = { t$Entry: PhoneMapping.flatMap(([purpose, protocol, count, key]) => this.phoneNumbers.contents.filter(entry => entry.purpose == purpose && (entry.protocol || "tel") == protocol).slice(0, count).map((entry, i) => ({ Key: key + (i ? "2" : ""), _TextContent_: entry.value }))) };
    let physicalAddresses = { t$Entry: [] };
    for (let key in PhysicalAddressPurposes) {
      let entry = this.streetAddresses.find(entry => entry.purpose == PhysicalAddressPurposes[key]);
      if (entry?.value) {
        let value = entry.value.split("\n");
        assert(value.length == 5, "Street address must have exactly five lines: Street and house, City, ZIP Code, State, Country");
        physicalAddresses.t$Entry.push({
          Key: key,
          t$Street: value[0],
          t$City: value[1],
          t$State: value[4],
          t$CountryOrRegion: value[6],
          t$PostalCode: value[3],
        });
      }
    }
    let request = {
      m$CreateItem: {
        m$Items: {
          t$Contact: {
            t$Body: this.notes ? {
              BodyType: "Text",
              _TextContent_: this.notes,
            } : "",
            t$DisplayName: this.name,
            t$GivenName: this.firstName || "",
            t$CompanyName: this.company || "",
            t$EmailAddresses: this.emailAddresses.hasItems ? {
              t$Entry: this.emailAddresses.getIndexRange(0, 3).map((entry, i) => ({
                Key: "EmailAddress" + ++i,
                _TextContent_: entry.value,
              })),
            } : "",
            t$PhysicalAddresses: physicalAddresses.t$Entry.length ? physicalAddresses : "",
            t$PhoneNumbers: phoneNumbers.t$Entry.length ? phoneNumbers : "",
            t$Department: this.department || "",
            t$ImAddresses: this.chatAccounts.hasItems ? {
              t$Entry: this.chatAccounts.getIndexRange(0, 3).map((entry, i) => ({
                Key: "ImAddress" + ++i,
                _TextContent_: entry.value,
              })),
            } : "",
            t$JobTitle: this.position || "",
            t$Surname: this.lastName || "",
          },
        },
      },
    };
    let response = await this.addressbook.account.callEWS(request);
    this.itemID = response.Items.Contact.ItemId.Id;
  }
}
