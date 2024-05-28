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
    throw new NotImplemented();
    /* Don't allow the local DB to get out of step with the server
    await SQLGroup.save(this);
    */
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
