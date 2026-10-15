import type { EMail } from "../../../logic/Mail/EMail";
import type { Event } from "../../../logic/Calendar/Event";
import type { Calendar } from "../../../logic/Calendar/Calendar";
import type { Participant } from "../../../logic/Calendar/Participant";
import type { IncomingInvitation } from "../../../logic/Calendar/Invitation/IncomingInvitation";
import { InvitationMessage, InvitationResponse, type InvitationResponseInMessage } from "../../../logic/Calendar/Invitation/InvitationStatus";
import { CalendarActions } from "../CalendarActions";
import { EventFormInfo } from "./EventFormInfo";
import { calendarMustangApp } from "../../../frontend/Calendar/CalendarMustangApp";
import { selectedDate, selectedEvent, startDate } from "../../../frontend/Calendar/selected";
import { openApp } from "../../../frontend/AppsBar/selectedApp";
import { gt } from "../../../l10n/l10n";

export type MailInvitationKind = "invitation" | "cancellation" | "reply";

export class MailInvitation {
  readonly message: EMail;
  readonly calendar: Calendar | null;
  readonly incoming: IncomingInvitation | null;
  myResponse: InvitationResponse;

  constructor(message: EMail) {
    this.message = message;
    this.calendar = message.event ? MailInvitation.findCalendar(message) : null;
    this.incoming = this.calendar?.getIncomingInvitationForEMail(message) ?? null;
    this.myResponse = this.incoming?.myParticipation ?? InvitationResponse.NoResponseReceived;
  }

  static isInvitationMail(message: EMail | null): boolean {
    return !!message?.event || !!message?.invitationMessage;
  }

  // <copied from="../../../frontend/Calendar/Invitation/IncomingInvitationInMail.svelte" initCalendar()>
  protected static findCalendar(message: EMail): Calendar | null {
    let account = message.folder?.account;
    if (!account) {
      return null;
    }
    for (let calendar of account.calendarsAvailable) {
      if (calendar.hasMatchingEvent(message.event)) {
        return calendar;
      }
    }
    return account.calendar;
  }
  // </copied>

  get event(): Event | null {
    return this.message.event;
  }

  get kind(): MailInvitationKind {
    switch (this.message.invitationMessage) {
    case InvitationMessage.CancelledEvent:
      return "cancellation";
    case InvitationMessage.ParticipantReply:
      return "reply";
    }
    return "invitation";
  }

  get canRespond(): boolean {
    return this.kind == "invitation" && !!this.incoming && this.myResponse != InvitationResponse.Organizer;
  }

  calEvent(): Event | null {
    return this.incoming?.calEvent() ?? null;
  }

  async respond(response: InvitationResponseInMessage) {
    await this.incoming.respondToInvitationFromMail(response);
    this.myResponse = response;
  }

  async removeFromCalendar() {
    let event = this.calEvent();
    if (event) {
      await CalendarActions.deleteOccurrence(event);
    }
  }

  showInCalendar() {
    let event = this.calEvent();
    let day = new Date((event ?? this.event).startTime);
    selectedEvent.set(event);
    selectedDate.set(day);
    startDate.set(day);
    openApp(calendarMustangApp, {});
  }

  replyParticipant(): Participant | null {
    return this.event?.participants.find(participant => participant.matches(this.message.from)) ?? null;
  }

  statusText(): string {
    if (this.kind == "cancellation") {
      return gt`This meeting has been cancelled by the organizer.`;
    }
    if (this.kind == "reply") {
      return this.replyText();
    }
    if (this.myResponse == InvitationResponse.Organizer) {
      return gt`You are the organizer of this meeting.`;
    }
    if (!this.incoming) {
      return gt`There is no calendar for this meeting in this account.`;
    }
    if (this.calEvent()?.isCancelled) {
      return gt`This meeting has been cancelled by the organizer.`;
    }
    return EventFormInfo.myResponseText(this.myResponse);
  }

  protected replyText(): string {
    let participant = this.replyParticipant();
    let name = participant?.name || participant?.emailAddress || this.message.from?.name || this.message.from?.emailAddress || "";
    if (this.message.outgoing) {
      return EventFormInfo.myResponseText(participant?.response);
    }
    switch (participant?.response) {
    case InvitationResponse.Accept:
      return gt`${name} has accepted this meeting.`;
    case InvitationResponse.Tentative:
      return gt`${name} has tentatively accepted this meeting.`;
    case InvitationResponse.Decline:
      return gt`${name} has declined this meeting.`;
    }
    return gt`${name} has responded to this meeting.`;
  }
}
