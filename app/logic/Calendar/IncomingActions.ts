import type { Calendar } from "./Calendar";
import type { Event } from "./Event";
import { Scheduling, ResponseType, type Responses } from "./Invitation";
import type { EMail } from "../Mail/EMail";
import { assert } from "../util/util";

export class IncomingActions {
  readonly calendar: Calendar;
  readonly message: EMail;
  readonly scheduling: Scheduling;
  readonly event: Event;
  myResponse: ResponseType;

  constructor(calendar: Calendar, message: EMail) {
    this.calendar = calendar;
    this.message = message;
    this.scheduling = message.scheduling;
    this.event = message.event;
    let event = calendar.events.find(event => event.calUID == this.event.calUID);
    this.myResponse = event?.response || ResponseType.NoResponseReceived;
  }

  async respondToInvitation(response: Responses) {
    assert(this.scheduling == Scheduling.Request, "Only invitations can be responded to");
    let event = this.calendar.events.find(event => event.calUID == this.event.calUID);
    if (!event) {
      event = this.calendar.newEvent();
      event.copyFrom(this.event);
      event.repeat = this.event.repeat;
      event.recurrenceRule = this.event.recurrenceRule;
      event.response = ResponseType.NoResponseReceived;
      this.calendar.events.add(event);
      if (event.recurrenceRule) {
        event.fillRecurrences(new Date(Date.now() + 1e11));
      }
    }
    let participant = event.participants.find(participant => participant.emailAddress == this.message.folder.account.emailAddress);
    if (participant) {
      event.response = participant.response = response;
      await event.save();
      await this.message.folder.account.sendInvitationResponse(this.event, response);
    }
    /* else add participant? */
  }

  async updateFromResponse() {
    assert(this.scheduling && this.scheduling != Scheduling.Request, "can't update from an invitation");
    let event = this.calendar.events.find(p => p.calUID == this.event.calUID);
    if (this.scheduling == Scheduling.Cancellation) {
      let organizer = event.participants.find(participant => participant.response == ResponseType.Organizer);
      if (organizer) {
        organizer.response = ResponseType.Decline;
        await event.save();
      }
    } else {
      let invitee = this.event.participants.find(participant => participant.response != ResponseType.Organizer);
      let participant = event.participants.find(participant => participant.emailAddress == invitee.emailAddress);
      if (participant) {
        participant.response = invitee.response;
        await event.save();
      }
    }
  }
}
