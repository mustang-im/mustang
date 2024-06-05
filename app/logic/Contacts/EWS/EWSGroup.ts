import { Group } from '../../Abstract/Group';
import { Person, ContactEntry } from '../../Abstract/Person';
import { findPerson } from '../../Abstract/PersonUID';
import type { EWSAddressbook } from './EWSAddressbook';
import { ensureArray } from "../../Mail/EWS/EWSEMail";
import EWSCreateItemRequest from "../../Mail/EWS/EWSCreateItemRequest";
import EWSUpdateItemRequest from "../../Mail/EWS/EWSUpdateItemRequest";
import { SQLGroup } from '../SQL/SQLGroup';
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
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
    this.itemID = sanitize.nonemptystring(xmljs.ItemId.Id);
    this.name = sanitize.nonemptystring(xmljs.DisplayName, "");
    this.description = sanitize.nonemptystring(xmljs.Body?.Value, "");
    if (xmljs.Members?.Member) {
      // `replaceAll` doesn't work for a `SetColl`
      this.participants.clear();
      this.participants.addAll(ensureArray(xmljs.Members.Member).map(member => findOrCreatePerson(sanitize.emailAddress(member.Mailbox.EmailAddress), sanitize.nonemptystring(member.Mailbox.Name, null))));
    }
  }

  async save() {
    // XXX untested due to no UI yet
    let request = this.itemID ? new EWSUpdateItemRequest(this.itemID) : new EWSCreateItemRequest();
    request.addField("DistributionList", "Body", this.description && { BodyType: "Text", _TextContent_: this.description }, "item:Body");
    request.addField("DistributionList", "DisplayName", this.name, "contacts:DisplayName");
    request.addField("DistributionList", "Members", this.participants.hasItems ? {
      t$Member: this.participants.contents.map(entry => ({
        t$Mailbox: {
         t$EmailAddress: entry.emailAddress,
         t$Name: entry.name,
        },
      })),
    } : "", "distributionlist:Members");
    let response = await this.addressbook.account.callEWS(request);
    this.itemID = sanitize.nonemptystring(response.Items.DistributionList.ItemId.Id);
    await SQLGroup.save(this);
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
