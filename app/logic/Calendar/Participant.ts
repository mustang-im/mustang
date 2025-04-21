import { PersonUID, findPerson } from "../Abstract/PersonUID";
import { InvitationResponse } from "./Invitation/InvitationStatus";
import { notifyChangedProperty } from "../util/Observable";

export class Participant extends PersonUID {
  @notifyChangedProperty
  response: InvitationResponse;

  constructor(emailAddress: string, name: string, response: InvitationResponse) {
    let person = findPerson(emailAddress);
    super(emailAddress, name ?? person?.name ?? emailAddress);
    this.person = person;
    this.response = response;
  }
}
