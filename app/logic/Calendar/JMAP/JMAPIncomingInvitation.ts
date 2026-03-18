import { IncomingInvitation } from "../Invitation/IncomingInvitation";
import { InvitationMessage, InvitationResponse, type InvitationResponseInMessage } from "../Invitation/InvitationStatus";
import type { JMAPCalendar } from "./JMAPCalendar";
import type { JMAPEMail } from "../../Mail/JMAP/JMAPEMail";

export class JMAPIncomingInvitation extends IncomingInvitation {
  declare readonly calendar: JMAPCalendar;
  declare readonly message: JMAPEMail;

  async respondToInvitationFromMail(response: InvitationResponseInMessage) {
    // ...
    await this.calendar.listEvents(); // Check what the server did
  }

  async updateCancelled() {
    // Auto-processed by server?
  }
  async updateParticipantReply() {
    // Auto-processed by server?
  }
  async updateFromOtherInvitationMessage() {
    // ??
  }
}
