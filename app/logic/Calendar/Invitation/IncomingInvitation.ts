import type { Calendar } from "../Calendar";
import { RecurrenceCase, type Event } from "../Event";
import { InvitationMessage, InvitationResponse, type InvitationResponseInMessage } from "../Invitation/InvitationStatus";
import type { EMail } from "../../Mail/EMail";
import { assert } from "../../util/util";

export class IncomingInvitation {
  readonly calendar: Calendar;
  readonly message: EMail;
  readonly invitationMessage: InvitationMessage;
  readonly event: Event;
  myParticipation: InvitationResponse;

  constructor(calendar: Calendar, message: EMail) {
    this.calendar = calendar;
    this.message = message;
    this.invitationMessage = message.invitationMessage;
    this.event = message.event;
    let event = calendar.events.find(event => event.calUID == this.event.calUID);
    this.myParticipation = event?.myParticipation || InvitationResponse.NoResponseReceived;
  }

  async respondToInvitation(response: InvitationResponseInMessage) {
    assert(this.invitationMessage == InvitationMessage.Invitation, "Only invitations can be responded to");
    let event = this.calendar.events.find(event => event.calUID == this.event.calUID);
    if (!event) {
      event = this.calendar.newEvent();
      event.copyFrom(this.event);
      event.recurrenceRule = this.event.recurrenceRule;
      event.recurrenceCase = RecurrenceCase.Master;
      this.calendar.events.add(event);
      if (event.recurrenceRule) {
        event.fillRecurrences();
      }
    }
    let { myParticipant } = event.participantMe(this.message.folder.account);
    event.myParticipation = myParticipant.response = response;
    await event.save();
    await event.sendInvitationResponse(myParticipant, this.message.folder.account);
    /* else add participant? */
  }

  /** Handle the other two InvitationMessage cases:
   *  CancelledEvent: the organiser cancelled an incoming meeting
   *  ParticpantReply: an invitee replied to your outgoing invitation */
  async updateFromOtherInvitationMessage() {
    assert(this.invitationMessage && this.invitationMessage != InvitationMessage.Invitation, "can't update from an invitation");
    let event = this.calendar.events.find(p => p.calUID == this.event.calUID);
    if (this.invitationMessage == InvitationMessage.CancelledEvent) {
      let organizer = event.participants.find(participant => participant.response == InvitationResponse.Organizer);
      if (organizer) {
        organizer.response = InvitationResponse.Decline;
        await event.save();
      }
    } else {
      let invitee = this.event.participants.find(participant => participant.response != InvitationResponse.Organizer);
      let participant = event.participants.find(participant => participant.emailAddress == invitee.emailAddress);
      if (participant) {
        participant.response = invitee.response;
        await event.save();
      }
    }
  }
}
