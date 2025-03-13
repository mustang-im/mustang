import { Event } from "../Event";
import { Participant } from "../Participant";
import { RecurrenceRule } from "../RecurrenceRule";
import { Scheduling, ParticipationStatus, ResponseType } from "../Invitation";
import ICalParser from "./ICalParser";
import type { EMail } from "../../Mail/EMail";
import { EMailProcessor, ProcessingStartOn } from "../../Mail/EMailProccessor";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";

export class ICalEMailProcessor extends EMailProcessor {
  runOn = ProcessingStartOn.Parse;
  process(email: EMail, postalMIME: any) {
    if (!postalMIME.textContent?.calendar) {
      return;
    }
    let ics = new ICalParser(postalMIME.textContent.calendar);
    email.scheduling = iTIPMethod(ics);
    email.event = convertICalToEvent(ics);
    if (email.event && !email.event.descriptionHTML && email.html) {
      email.event.descriptionHTML = email.html;
    }
  }
}

/* Find the iTIP method from a parsed vcalendar part */
function iTIPMethod(ics: any): Scheduling {
  switch (ics.containers.vcalendar?.[0].entries.method?.[0].value) {
  case "CANCEL":
    return Scheduling.Cancellation;
  case "REQUEST":
    return Scheduling.Request;
  case "REPLY":
    // Any other value will do, just make something up
    return Scheduling.Declined + Scheduling.Tentative + Scheduling.Accepted;
  }
  return Scheduling.None;
}

function parseDate(icalDate: string): Date {
  return new Date(icalDate.replace(/^(\d{4})(\d\d)(\d\d)/, "$1-$2-$3").replace(/(T\d\d)(\d\d)(\d\dZ?)$/, "$1:$2:$3"));
}

function convertICalToEvent(ics: ICalParser): Event | null {
  if (!ics.containers.vevent) {
    return null;
  }
  let vevent = ics.containers.vevent[0];
  let event = new Event();
  if (vevent.entries.uid) {
    event.calUID = vevent.entries.uid[0].value;
  }
  if (vevent.entries.summary) {
    event.title = vevent.entries.summary[0].value;
  }
  if (vevent.entries.description) {
    event.descriptionText = vevent.entries.description[0].value;
  }
  if (vevent.entries.dtstart) {
    event.startTime = parseDate(vevent.entries.dtstart[0].value);
  }
  if (vevent.entries.dtend) {
    event.endTime = parseDate(vevent.entries.dtend[0].value);
  }
  if (vevent.entries.dtstart?.[0].properties.value == "date") {
    event.allDay = true;
  }
  if (vevent.entries.rrule) {
    event.repeat = true;
    event.recurrenceRule = RecurrenceRule.fromCalString(event.startTime, vevent.entries.rrule[0].line);
  }
  if (vevent.entries.location) {
    event.location = vevent.entries.location[0].value;
  }
  let organizer: Participant | undefined;
  if (vevent.entries.organizer) {
    let value = vevent.entries.organizer[0].value.replace(/^MAILTO:/i, "");
    organizer = new Participant(sanitize.emailAddress(value), sanitize.label(vevent.entries.organizer[0].properties.cn, null), ResponseType.Organizer);
    event.participants.add(organizer);
  }
  if (vevent.entries.attendee) {
    for (let { value, properties: { role, partstat, cn } } of vevent.entries.attendee) {
      value = value.replace(/^MAILTO:/i, "");
      let participant = new Participant(sanitize.emailAddress(value), sanitize.label(cn, null), sanitize.integer(ParticipationStatus[partstat?.toUpperCase()] || ResponseType.Unknown));
      if (value == organizer?.emailAddress || /^CHAIR$/i.test(role)) {
        participant.response = ResponseType.Organizer;
        // Remove the organizer as it has less detail than an attendee
        event.participants.remove(organizer);
      }
      event.participants.add(participant);
    }
  }
  return event;
}
