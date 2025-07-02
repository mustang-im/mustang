import type { Calendar } from "../Calendar";
import type { Event } from "../Event";
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

  /** `this.event` is from the invitation email, but `calEvent` is the event in the calendar */
  calEvent(): Event | null {
    return this.calendar.events.find(event => event.calUID == this.event.calUID);
  }

  async respondToInvitation(response: InvitationResponseInMessage) {
    assert(this.invitationMessage == InvitationMessage.Invitation, "Only invitations can be responded to");
    let event = this.calEvent();
    if (!event) {
      event = this.calendar.newEvent();
      event.copyFrom(this.event);
      this.calendar.events.add(event);
    }
    let { myParticipant } = event.participantMe(this.message.folder.account);
    event.myParticipation = myParticipant.response = response;
    await event.save();
    await event.sendInvitationResponse(myParticipant, this.message.folder.account);
    /* else add participant? */
  }

  /** CancelledEvent: the organiser cancelled an incoming meeting */
  async updateCancelled() {
    assert(this.invitationMessage && this.invitationMessage != InvitationMessage.Invitation, "Can't update from an invitation");
    let event = this.calEvent();
    // Is this action reversible? If so, need to check timestamp.
    let organizer = event.participants.find(participant => participant.response == InvitationResponse.Organizer);
    if (organizer) {
      organizer.response = InvitationResponse.Decline;
      await event.save();
    }
  }

  /** ParticpantReply: an invitee replied to your outgoing invitation */
  async updateParticipantReply() {
    assert(this.invitationMessage && this.invitationMessage != InvitationMessage.Invitation, "Can't update from an invitation");
    let event = this.calEvent();
    let invitee = this.event.participants.find(participant => participant.response != InvitationResponse.Organizer);
    let participant = event.participants.find(participant => participant.emailAddress == invitee.emailAddress);
    let timestamp = this.message.sent; // TODO Use DTSTAMP from ICS
    if (participant &&
      (!participant.lastUpdateTime || participant.lastUpdateTime < timestamp)) {
      participant.response = invitee.response;
      participant.lastUpdateTime = timestamp;
      await event.save();
    }
  }

  /** Handle CancelledEvent and ParticpantReply */
  async updateFromOtherInvitationMessage() {
    assert(this.invitationMessage && this.invitationMessage != InvitationMessage.Invitation, "Can't update from an invitation");
    if (this.invitationMessage == InvitationMessage.CancelledEvent) {
      await this.updateCancelled();
    } else {
      await this.updateParticipantReply();
    }
  }
}
