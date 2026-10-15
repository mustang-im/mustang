import type { Event } from "../../../logic/Calendar/Event";
import type { Participant } from "../../../logic/Calendar/Participant";
import { InvitationResponse } from "../../../logic/Calendar/Invitation/InvitationStatus";
import { RecurrencePattern } from "./RecurrencePattern";
import { gt } from "../../../l10n/l10n";

export type InfoKind = "info" | "warning" | "cancelled" | "recurrence";

export interface InfoMessage {
  kind: InfoKind;
  text: string;
}

export interface ResponseCounts {
  accepted: number;
  tentative: number;
  declined: number;
  none: number;
}

export class EventFormInfo {
  static isMeeting(event: Event): boolean {
    return event.participants.hasItems;
  }

  static isSaved(event: Event): boolean {
    return !(event.parentEvent ?? event).isNew;
  }

  static tabLabel(event: Event): string {
    let isMeeting = event.isIncomingMeeting || EventFormInfo.isMeeting(event);
    if (event.parentEvent) {
      return isMeeting ? gt`Meeting Occurrence` : gt`Appointment Occurrence`;
    }
    if (event.recurrenceRule) {
      return isMeeting ? gt`Meeting Series` : gt`Appointment Series`;
    }
    return isMeeting ? gt`Meeting` : gt`Appointment`;
  }

  static responseCounts(event: Event): ResponseCounts {
    let counts: ResponseCounts = { accepted: 0, tentative: 0, declined: 0, none: 0 };
    for (let participant of event.participants) {
      switch (participant.response) {
      case InvitationResponse.Organizer:
        break;
      case InvitationResponse.Accept:
        counts.accepted++;
        break;
      case InvitationResponse.Tentative:
        counts.tentative++;
        break;
      case InvitationResponse.Decline:
        counts.declined++;
        break;
      default:
        counts.none++;
      }
    }
    return counts;
  }

  static responseSummary(event: Event): string {
    let counts = EventFormInfo.responseCounts(event);
    if (!counts.accepted && !counts.tentative && !counts.declined) {
      return gt`No responses have been received for this meeting.`;
    }
    return gt`Attendee responses: ${counts.accepted} accepted, ${counts.tentative} tentatively accepted, ${counts.declined} declined.`;
  }

  static whenText(event: Event, locale: string): string {
    const kDay: Intl.DateTimeFormatOptions = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    let start = event.startTime;
    let end = event.endTime;
    if (event.allDay) {
      let lastDay = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 1);
      if (lastDay <= start) {
        return new Intl.DateTimeFormat(locale, kDay).format(start) + " " + gt`(all day)`;
      }
      return new Intl.DateTimeFormat(locale, kDay).formatRange(start, lastDay) + " " + gt`(all day)`;
    }
    return new Intl.DateTimeFormat(locale, { ...kDay, hour: "numeric", minute: "2-digit" }).formatRange(start, end);
  }

  static attendanceLabel(participant: Participant): string {
    return participant.response == InvitationResponse.Organizer
      ? gt`Meeting Organizer`
      : gt`Required Attendee`;
  }

  static responseLabel(participant: Participant): string {
    return EventFormInfo.responseText(participant.response);
  }

  static responseText(response: InvitationResponse): string {
    switch (response) {
    case InvitationResponse.Accept:
      return gt`Accepted`;
    case InvitationResponse.Tentative:
      return gt`Tentative`;
    case InvitationResponse.Decline:
      return gt`Declined`;
    default:
      return gt`None *=> No response`;
    }
  }

  static trackingText(event: Event): string {
    return event.participants.contents.map(participant => [
      participant.name || participant.emailAddress,
      EventFormInfo.attendanceLabel(participant),
      EventFormInfo.responseLabel(participant),
    ].join("\t")).join("\n");
  }

  static myResponseText(response: InvitationResponse): string {
    switch (response) {
    case InvitationResponse.Accept:
      return gt`You accepted this meeting.`;
    case InvitationResponse.Tentative:
      return gt`You tentatively accepted this meeting.`;
    case InvitationResponse.Decline:
      return gt`You declined this meeting.`;
    default:
      return gt`Please respond.`;
    }
  }

  static blocksTime(event: Event): boolean {
    return !event.allDay && !event.isCancelled && event.myParticipation != InvitationResponse.Decline;
  }

  static conflict(event: Event, events: Iterable<Event>): "conflict" | "adjacent" | null {
    if (!event.startTime || !event.endTime || !EventFormInfo.blocksTime(event)) {
      return null;
    }
    let start = event.startTime.getTime();
    let end = event.endTime.getTime();
    let result: "adjacent" | null = null;
    for (let existing of events) {
      if (existing == event || existing.parentEvent == event || existing == event.unedited || existing == event.parentEvent ||
          !existing.startTime || !existing.endTime || !EventFormInfo.blocksTime(existing)) {
        continue;
      }
      let existingStart = existing.startTime.getTime();
      let existingEnd = existing.endTime.getTime();
      if (existingStart < end && existingEnd > start) {
        return "conflict";
      }
      if (existingEnd == start || existingStart == end) {
        result = "adjacent";
      }
    }
    return result;
  }

  static messages(event: Event, events: Iterable<Event>, now = new Date(), pattern = RecurrencePattern.fromEvent(event)): InfoMessage[] {
    let messages: InfoMessage[] = [];
    let isMeeting = EventFormInfo.isMeeting(event);
    if (event.isIncomingMeeting) {
      if (event.isCancelled) {
        messages.push({ kind: "cancelled", text: gt`This meeting has been cancelled by the organizer.` });
      } else {
        messages.push({ kind: "info", text: EventFormInfo.myResponseText(event.myParticipation) });
      }
    } else if (isMeeting) {
      messages.push(EventFormInfo.isSaved(event)
        ? { kind: "info", text: EventFormInfo.responseSummary(event) }
        : { kind: "info", text: gt`You haven't sent this meeting invitation yet.` });
    }
    if (event.parentEvent?.recurrenceRule) {
      messages.push({ kind: "recurrence", text: pattern.summary(event) });
    }
    let conflict = EventFormInfo.conflict(event, events);
    if (conflict == "conflict") {
      messages.push({ kind: "warning", text: gt`This appointment conflicts with another one on your calendar.` });
    } else if (conflict == "adjacent") {
      messages.push({ kind: "info", text: gt`Adjacent to another appointment on your calendar.` });
    }
    if (!event.recurrenceRule && event.endTime && event.endTime < now) {
      messages.push({ kind: "info", text: isMeeting || event.isIncomingMeeting
        ? gt`This meeting occurs in the past.`
        : gt`This appointment occurs in the past.` });
    }
    return messages;
  }
}
