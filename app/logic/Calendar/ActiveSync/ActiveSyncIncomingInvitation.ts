import type { Event } from "../Event";
import { InvitationMessage, InvitationResponse, type InvitationResponseInMessage } from "../Invitation/InvitationStatus";
import type { ActiveSyncCalendar } from "./ActiveSyncCalendar";
import type { ActiveSyncEMail } from "../../Mail/ActiveSync/ActiveSyncEMail";
import { assert } from "../../util/util";

const ActiveSyncResponse: Record<InvitationResponseInMessage, number> = {
  [InvitationResponse.Accept]: 1,
  [InvitationResponse.Tentative]: 2,
  [InvitationResponse.Decline]: 3,
};

export class ActiveSyncIncomingInvitation {
  readonly calendar: ActiveSyncCalendar;
  readonly message: ActiveSyncEMail;
  readonly invitationMessage: InvitationMessage;
  readonly event: Event;
  myParticipation: InvitationResponse;

  constructor(calendar: ActiveSyncCalendar, message: ActiveSyncEMail) {
    this.calendar = calendar;
    this.message = message;
    this.invitationMessage = message.invitationMessage;
    this.event = message.event;
    let event = calendar.events.find(event => event.calUID == this.event.calUID);
    this.myParticipation = event?.myParticipation || InvitationResponse.NoResponseReceived;
  }

  async respondToInvitation(response: InvitationResponseInMessage) {
    assert(this.invitationMessage == InvitationMessage.Invitation, "Only invitations can be responded to");
    let request = {
      Request: {
        UserResponse: ActiveSyncResponse[response],
        CollectionId: this.message.folder.id,
        RequestId: this.message.serverID,
      },
    };
    await this.calendar.account.callEAS("MeetingResponse", request);
    this.event.myParticipation = response;
    await this.event.respondToInvitation(response, this.calendar.account); // needs 16.x to do this automatically
    await this.message.deleteMessageLocally(); // Exchange deletes the message from the inbox
  }

  async updateFromOtherInvitationMessage() {
    await this.calendar.listEvents();
  }
}
