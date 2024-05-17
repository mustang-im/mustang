import { Group } from '../../Abstract/Group';
import { Person, ContactEntry } from '../../Abstract/Person';
import type { EWSAddressbook } from './EWSAddressbook';
import { ensureArray } from "../../Mail/EWS/EWSEMail";

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
      this.participants.addAll(ensureArray(xmljs.Members.Member).map(member => createPerson(member.Mailbox.EmailAddress, member.Mailbox.Name)));
    }
  }

  async save() {
    throw new Error("Not yet implemetned");
  }
}

function createPerson(emailAddress: string, name:string): Person {
  let person = new Person();
  person.name = name;
  person.emailAddresses.add(new ContactEntry(emailAddress, null, "mailto"));
  return person;
}
