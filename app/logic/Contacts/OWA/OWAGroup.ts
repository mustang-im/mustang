import { ExchangeGroup } from '../EWS/ExchangeGroup';
import { findOrCreatePerson } from '../../Abstract/PersonUID';
import type { OWAAddressbook } from './OWAAddressbook';
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { NotImplemented } from '../../util/util';

export class OWAGroup extends ExchangeGroup {
  declare addressbook: OWAAddressbook | null;

  /** The Exchange PersonaId,
   * or the empty string if the item has not been saved to the server. */
  personaID = "";

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

  fromExtraJSON(json: any) {
    super.fromExtraJSON(json);
    // Old existing contacts saved the personaID in the id
    this.personaID = sanitize.string(json.personaID, this.id);
  }

  toExtraJSON(): any {
    let json = super.toExtraJSON();
    json.personaID = this.personaID;
    return json;
  }
}
