import type { Event } from "../Event";
import { InvitationMessage, InvitationResponse, type InvitationResponseInMessage } from "../Invitation/InvitationStatus";
import type { OWACalendar } from "./OWACalendar";
import type { OWAEvent } from "./OWAEvent";
import type { OWAEMail } from "../../Mail/OWA/OWAEMail";
import OWACreateItemRequest from "../../Mail/OWA/Request/OWACreateItemRequest";
import { assert } from "../../util/util";
import { ArrayColl } from "svelte-collections";

const ResponseTypes: Record<InvitationResponseInMessage, string> = {
  [InvitationResponse.Accept]: "AcceptItem",
  [InvitationResponse.Tentative]: "TentativelyAcceptItem",
  [InvitationResponse.Decline]: "DeclineItem",
};

export class OWAIncomingInvitation {
  readonly calendar: OWACalendar;
  readonly message: OWAEMail;
  readonly invitationMessage: InvitationMessage;
  readonly event: Event;
  readonly calEvent: OWAEvent;
  readonly itemID: string | void;
  myParticipation: InvitationResponse;

  constructor(calendar: OWACalendar, message: OWAEMail) {
    this.calendar = calendar;
    this.message = message;
    this.invitationMessage = message.invitationMessage;
    this.event = message.event;
    this.calEvent = calendar.events.find(event => event.calUID == this.event.calUID);
    this.itemID = this.calEvent?.itemID;
    this.myParticipation = this.calEvent?.myParticipation || InvitationResponse.NoResponseReceived;
  }

  async respondToInvitation(response: InvitationResponseInMessage) {
    assert(this.invitationMessage == InvitationMessage.Invitation, "Only invitations can be responded to");
    let request = new OWACreateItemRequest({MessageDisposition: "SendAndSaveCopy"});
    request.addField(ResponseTypes[response], "ReferenceItemId", {
      __type: "ItemId:#Exchange",
      Id: this.message.itemID,
    });
    let result = await this.calendar.account.callOWA(request);
    await this.message.deleteMessageLocally(); // Exchange deletes the message from the inbox
    // Exchange will have created a calendar item if there wasn't one already
    let itemID = result.Items.find(item => item?.__type == "CalendarItem:#Exchange")?.ItemId?.Id;
    if (itemID) {
      this.calendar.createOrUpdateEventFromServerByID(itemID);
    }
  }

  async updateCancelled() {
    await this.updateFromOtherInvitationMessage();
  }
  async updateParticipantReply() {
    await this.updateFromOtherInvitationMessage();
  }
  /** Exchange server auto-processes these */
  async updateFromOtherInvitationMessage() {
    assert(this.itemID, "UI should have been disabled");
    await this.calendar.getEvents([this.itemID], new ArrayColl<OWAEvent>());
  }
}
