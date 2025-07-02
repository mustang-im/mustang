import { PersonUID, findPerson } from "../Abstract/PersonUID";
import { InvitationResponse } from "./Invitation/InvitationStatus";
import { notifyChangedProperty } from "../util/Observable";

export class Participant extends PersonUID {
  @notifyChangedProperty
  _response: InvitationResponse;
  /** DTSTAMP when the status was sent that is captured in this object.
   * Used during auto-update to avoid overwriting with older info. */
  lastUpdateTime: Date | null;

  constructor(emailAddress: string, name: string, response: InvitationResponse) {
    let person = findPerson(emailAddress);
    super(emailAddress, name ?? person?.name ?? emailAddress);
    this.person = person;
    this._response = response;
  }

  get response(): InvitationResponse {
    return this._response;
  }
  set response(val: InvitationResponse) {
    this._response = val;
    this.lastUpdateTime = new Date();
  }
}
