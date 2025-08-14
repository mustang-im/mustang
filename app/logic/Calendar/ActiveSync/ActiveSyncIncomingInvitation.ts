import { IncomingInvitation } from "../Invitation/IncomingInvitation";
import { InvitationMessage, InvitationResponse, type InvitationResponseInMessage } from "../Invitation/InvitationStatus";
import type { ActiveSyncCalendar } from "./ActiveSyncCalendar";
import type { ActiveSyncEMail } from "../../Mail/ActiveSync/ActiveSyncEMail";
import { assert } from "../../util/util";

const ActiveSyncResponse: Record<InvitationResponseInMessage, number> = {
  [InvitationResponse.Accept]: 1,
  [InvitationResponse.Tentative]: 2,
  [InvitationResponse.Decline]: 3,
};

export class ActiveSyncIncomingInvitation extends IncomingInvitation {
  declare readonly calendar: ActiveSyncCalendar;
  declare readonly message: ActiveSyncEMail;

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
    await this.calendar.listEvents(); // Exchange will have created a calendar item if there wasn't one already
  }

  async updateCancelled() {
    await this.updateFromOtherInvitationMessage();
  }
  async updateParticipantReply() {
    await this.updateFromOtherInvitationMessage();
  }
  /** Exchange server auto-processes these */
  async updateFromOtherInvitationMessage() {
    await this.calendar.listEvents();
  }
}
