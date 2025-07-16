import type { Calendar } from "../Calendar";
import type { Event } from "../Event";
import { InvitationMessage, InvitationResponse, type InvitationResponseInMessage } from "../Invitation/InvitationStatus";
import type { EMail } from "../../Mail/EMail";
import { AbstractFunction, NotReached, assert } from "../../util/util";

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
    this.myParticipation = event?.myParticipation || (this.amIOrganizer() ? InvitationResponse.Organizer : InvitationResponse.NoResponseReceived);
  }

  amIOrganizer(): boolean {
    let organizer = this.event.participants.find(participant => participant.response == InvitationResponse.Organizer);
    return this.message.folder.account.isMyEMailAddress(organizer.emailAddress);
  }

  /** `this.event` is from the invitation email, but `calEvent` is the event in the calendar */
  calEvent(): Event | null {
    return this.calendar.events.find(event => event.calUID == this.event.calUID);
  }

  async respondToInvitationFromMail(response: InvitationResponseInMessage) {
    throw new AbstractFunction();
  }

  /** CancelledEvent: the organiser cancelled an incoming meeting */
  async updateCancelled() {
    assert(this.invitationMessage == InvitationMessage.CancelledEvent, "Not a cancellation");
    let event = this.calEvent();
    assert(event, "Cannot process invitation update: The event was not found in your calendar");
    if (this.event?.lastUpdateTime <= event?.lastUpdateTime) {
      return;
    }
    event.isCancelled = true;
    let organizer = event.participants.find(participant => participant.response == InvitationResponse.Organizer);
    if (organizer) {
      organizer.response = InvitationResponse.Decline;
    }
    event.lastUpdateTime = this.event.lastUpdateTime;
    await event.save();
  }

  /** ParticpantReply: an invitee replied to your outgoing invitation */
  async updateParticipantReply() {
    assert(this.invitationMessage == InvitationMessage.ParticipantReply, "Not a reply");
    let event = this.calEvent();
    assert(event, "Cannot process invitation update: The event was not found in your calendar");
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
    if (this.invitationMessage == InvitationMessage.CancelledEvent) {
      await this.updateCancelled();
    } else if (this.invitationMessage == InvitationMessage.ParticipantReply) {
      await this.updateParticipantReply();
    } else {
      throw new NotReached();
    }
  }
}
