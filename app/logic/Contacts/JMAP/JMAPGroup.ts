import { Group } from '../../Abstract/Group';
import { Person, ContactEntry } from '../../Abstract/Person';
import { findPerson } from '../../Abstract/PersonUID';
import type { JMAPAddressbook } from './JMAPAddressbook';
import { appGlobal } from "../../app";
import { ensureArray } from "../../util/util";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";

export class JMAPGroup extends Group {
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
    this.description = sanitize.nonemptystring(jmap.Body?.Value, "");
    this.participants.replaceAll(ensureArray(jmap.Members?.Member).map(member => findOrCreatePerson(sanitize.emailAddress(member.Mailbox.EmailAddress), sanitize.nonemptystring(member.Mailbox.Name, null))));
    */
  }

  async saveToServer() {
  }

  async deleteFromServer() {
  }
}

function findOrCreatePerson(emailAddress: string, name:string): Person {
  let person = findPerson(emailAddress);
  if (person) {
    return person;
  }
  person = appGlobal.collectedAddressbook.newPerson();
  person.name = name;
  person.emailAddresses.add(new ContactEntry(emailAddress, null, "mailto"));
  return person;
}
