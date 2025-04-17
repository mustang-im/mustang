import type { Event } from "../Event";
import { Scheduling, ResponseType, type Responses } from "../Invitation";
import type { EWSCalendar } from "./EWSCalendar";
import type { EWSEMail } from "../../Mail/EWS/EWSEMail";
import EWSCreateItemRequest from "../../Mail/EWS/Request/EWSCreateItemRequest";
import { assert } from "../../util/util";

const ResponseTypes: Record<Responses, string> = {
  [ResponseType.Accept]: "AcceptItem",
  [ResponseType.Tentative]: "TentativelyAcceptItem",
  [ResponseType.Decline]: "DeclineItem",
};

export class EWSIncomingActions {
  readonly calendar: EWSCalendar;
  readonly message: EWSEMail;
  readonly scheduling: Scheduling;
  readonly event: Event;
  myResponse: ResponseType;

  constructor(calendar: EWSCalendar, message: EWSEMail) {
    this.calendar = calendar;
    this.message = message;
    this.scheduling = message.scheduling;
    this.event = message.event;
    let event = calendar.events.find(event => event.calUID == this.event.calUID);
    this.myResponse = event?.response || ResponseType.NoResponseReceived;
  }

  async respondToInvitation(response: Responses) {
    assert(this.scheduling == Scheduling.Request, "Only invitations can be responded to");
    let request = new EWSCreateItemRequest({MessageDisposition: "SendAndSaveCopy"});
    request.addField(ResponseTypes[response], "ReferenceItemId", { Id: this.message.itemID });
    await this.calendar.account.callEWS(request);
    await this.message.deleteMessageLocally(); // Exchange deletes the message from the inbox
  }

  async updateFromResponse() {
    await this.calendar.listEvents();
  }
}
