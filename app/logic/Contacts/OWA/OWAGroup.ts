import { Group } from '../../Abstract/Group';
import { Person, ContactEntry } from '../../Abstract/Person';
import { findPerson } from '../../Abstract/PersonUID';
import type { OWAAddressbook } from './OWAAddressbook';
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { NotImplemented } from '../../util/util';
import { appGlobal } from "../../app";

export class OWAGroup extends Group {
  declare addressbook: OWAAddressbook | null;

  get personaID() {
    return this.pID;
  }
  set personaID(val) {
    this.pID = val;
  }

  fromJSON(json: any): OWAGroup {
    this.personaID = sanitize.nonemptystring(json.PersonaId.Id);
    this.name = sanitize.nonemptystring(json.DisplayName, "");
    this.description = sanitize.nonemptystring(json.Notes, "");
    this.participants.replaceAll((json.Members || []).map(member => findOrCreatePerson(sanitize.emailAddress(member.EmailAddress.EmailAddress), sanitize.nonemptystring(member.EmailAddress.Name, null))));
    return this;
  }

  async saveToServer() {
    throw new NotImplemented();
  }

  async deleteFromServer() {
    throw new NotImplemented();
    /* Don't know whether this works
    let request = new OWADeletePersonaRequest(this.personaID);
    await this.addressbook.callOWA(request);
    //await super.deleteIt();
    */
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
