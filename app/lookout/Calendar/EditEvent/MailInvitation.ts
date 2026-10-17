import type { EMail } from "../../../logic/Mail/EMail";
import type { Event } from "../../../logic/Calendar/Event";
import type { Calendar } from "../../../logic/Calendar/Calendar";
import type { IncomingInvitation } from "../../../logic/Calendar/Invitation/IncomingInvitation";
import { InvitationMessage, InvitationResponse } from "../../../logic/Calendar/Invitation/InvitationStatus";
import { EventFormInfo } from "./EventFormInfo";
import { gt } from "../../../l10n/l10n";

export type MailInvitationKind = "invitation" | "cancellation" | "reply";

export class MailInvitation {
  // <copied from="../../../frontend/Calendar/Invitation/IncomingInvitationInMail.svelte" initCalendar()>
  static findCalendar(message: EMail): Calendar | null {
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

  static kindOf(message: EMail): MailInvitationKind {
    switch (message.invitationMessage) {
    case InvitationMessage.CancelledEvent:
      return "cancellation";
    case InvitationMessage.ParticipantReply:
      return "reply";
    }
    return "invitation";
  }

  static statusText(message: EMail, incoming: IncomingInvitation | null, myResponse: InvitationResponse, calEvent: Event | null): string {
    let kind = MailInvitation.kindOf(message);
    if (kind == "cancellation") {
      return gt`This meeting has been cancelled by the organizer.`;
    }
    if (kind == "reply") {
      return MailInvitation.replyText(message);
    }
    if (myResponse == InvitationResponse.Organizer) {
      return gt`You are the organizer of this meeting.`;
    }
    if (!incoming) {
      return gt`There is no calendar for this meeting in this account.`;
    }
    if (calEvent?.isCancelled) {
      return gt`This meeting has been cancelled by the organizer.`;
    }
    return EventFormInfo.myResponseText(myResponse);
  }

  protected static replyText(message: EMail): string {
    let participant = message.event?.participants.find(participant => participant.matches(message.from)) ?? null;
    let name = participant?.name || participant?.emailAddress || message.from?.name || message.from?.emailAddress || "";
    if (message.outgoing) {
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
