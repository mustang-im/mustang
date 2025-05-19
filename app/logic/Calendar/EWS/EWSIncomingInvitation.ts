import type { Event } from "../Event";
import { InvitationMessage, InvitationResponse, type InvitationResponseInMessage } from "../Invitation/InvitationStatus";
import type { EWSCalendar } from "./EWSCalendar";
import type { EWSEMail } from "../../Mail/EWS/EWSEMail";
import EWSCreateItemRequest from "../../Mail/EWS/Request/EWSCreateItemRequest";
import { assert } from "../../util/util";

const ResponseTypes: Record<InvitationResponseInMessage, string> = {
  [InvitationResponse.Accept]: "AcceptItem",
  [InvitationResponse.Tentative]: "TentativelyAcceptItem",
  [InvitationResponse.Decline]: "DeclineItem",
};

export class EWSIncomingInvitation {
  readonly calendar: EWSCalendar;
  readonly message: EWSEMail;
  readonly invitationMessage: InvitationMessage;
  readonly event: Event;
  myParticipation: InvitationResponse;

  constructor(calendar: EWSCalendar, message: EWSEMail) {
    this.calendar = calendar;
    this.message = message;
    this.invitationMessage = message.invitationMessage;
    this.event = message.event;
    let event = calendar.events.find(event => event.calUID == this.event.calUID);
    this.myParticipation = event?.myParticipation || InvitationResponse.NoResponseReceived;
  }

  async respondToInvitation(response: InvitationResponseInMessage) {
    assert(this.invitationMessage == InvitationMessage.Invitation, "Only invitations can be responded to");
    let request = new EWSCreateItemRequest({MessageDisposition: "SendAndSaveCopy"});
    request.addField(ResponseTypes[response], "ReferenceItemId", { Id: this.message.itemID });
    await this.calendar.account.callEWS(request);
    await this.message.deleteMessageLocally(); // Exchange deletes the message from the inbox
    await this.calendar.listEvents(); // Exchange will have created a calendar item if there wasn't one already
  }

  async updateFromOtherInvitationMessage() {
    await this.calendar.listEvents();
  }
}
