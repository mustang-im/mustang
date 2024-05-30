import { Group } from '../../Abstract/Group';
import { Person, ContactEntry } from '../../Abstract/Person';
import { findPerson } from '../../Abstract/PersonUID';
import type { EWSAddressbook } from './EWSAddressbook';
import { ensureArray } from "../../Mail/EWS/EWSEMail";
import { SQLGroup } from '../SQL/SQLGroup';
import { NotImplemented } from '../../util/util';
import { appGlobal } from "../../app";

export class EWSGroup extends Group {
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
    if (xmljs.Body) {
      this.description = xmljs.Body.Value;
    }
    if (xmljs.Members?.Member) {
      // `replaceAll` doesn't work for a `SetColl`
      this.participants.clear();
      this.participants.addAll(ensureArray(xmljs.Members.Member).map(member => findOrCreatePerson(member.Mailbox.EmailAddress, member.Mailbox.Name)));
    }
  }

  async save() {
    // XXX untested due to no UI yet
    if (this.itemID) {
      await this.update();
    } else {
      await this.create();
    }
    await SQLGroup.save(this);
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
    this.addUpdate(updates, "t$Body", this.description && { BodyType: "Text", _TextContent_: this.description }, "item:Body");
    this.addUpdate(updates, "t$DisplayName", this.name, "contacts:DisplayName");
    this.addUpdate(updates, "t$Members", this.participants.hasItems && {
      t$Member: this.participants.contents.map(entry => ({
        t$Mailbox: {
         t$EmailAddress: entry.emailAddress,
         t$Name: entry.name,
        },
      })),
    }, "distributionlist:Members");
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
      field.t$DistributionList = { [key]: value };
      updates.t$SetItemField.push(field);
    }
  }

  async create() {
    let request = {
      m$CreateItem: {
        m$Items: {
          t$DistributionList: {
            t$Body: this.description ? {
              BodyType: "Text",
              _TextContent_: this.description,
            } : "",
            t$DisplayName: this.name,
            t$Members: this.participants.hasItems ? {
              t$Member: this.participants.contents.map(entry => ({
                t$Mailbox: {
                 t$EmailAddress: entry.emailAddress,
                 t$Name: entry.name,
                },
              })),
            } : "",
          },
        },
      },
    };
    let response = await this.addressbook.account.callEWS(request);
    this.itemID = response.Items.DistributionList.ItemId.Id;
  }
}

function findOrCreatePerson(emailAddress: string, name:string): Person {
  let person = findPerson(emailAddress);
  if (person) {
    return person;
  }
  person = new Person(appGlobal.collectedAddressbook);
  person.name = name;
  person.emailAddresses.add(new ContactEntry(emailAddress, null, "mailto"));
  return person;
}
