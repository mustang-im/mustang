import { PersonUID, findPerson } from "../Abstract/PersonUID";
import { ResponseType } from "./Invitation";
import { notifyChangedProperty } from "../util/Observable";

export class Participant extends PersonUID {
  @notifyChangedProperty
  response: ResponseType;

  constructor(emailAddress: string, name: string, response: ResponseType) {
    let person = findPerson(emailAddress);
    super(emailAddress, name ?? person?.name ?? emailAddress);
    this.person = person;
    this.response = response;
  }
}
