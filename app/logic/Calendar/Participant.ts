import { PersonUID, findPerson } from "../Abstract/PersonUID";
import { InvitationResponse, kInviteeResponses } from "./Invitation/InvitationStatus";
import { notifyChangedProperty } from "../util/Observable";

export class Participant extends PersonUID {
  @notifyChangedProperty
  response: InvitationResponse;
  /** DTSTAMP when the status was sent that is captured in this object.
   * Used during auto-update to avoid overwriting with older info.
   * We don't need to track local changes, only those sent by others.
   * Local changes sent to others will always get the current timestamp in `ICalGenerator` */
  lastUpdateTime: Date | null;

  constructor(emailAddress: string, name: string, response: InvitationResponse) {
    let person = findPerson(emailAddress);
    super(emailAddress, name ?? person?.name ?? emailAddress);
    this.person = person;
    this.response = response;
  }

  get isInvitee(): boolean {
    return kInviteeResponses.includes(this.response);
  }
}
