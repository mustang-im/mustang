import { Event } from "./Event";
import { RecurrenceRule } from "./RecurrenceRule";
import { Scheduling } from "./Invitation";
import ICalParser from "./ICalParser";
import type { EMail } from "../Mail/EMail";
import { EMailProcessor, ProcessingStartOn } from "../Mail/EMailProccessor";
import { PersonUID, findOrCreatePersonUID } from "../Abstract/PersonUID";
import { sanitize } from "../../../lib/util/sanitizeDatatypes";
import PostalMime from "postal-mime";

export class ICSProcessor extends EMailProcessor {
  runOn = ProcessingStartOn.Parse;
  process(email: EMail, postalMIME: any) {
    if (!postalMIME.textContent?.calendar) {
      return;
    }
    let ics = new ICalParser(postalMIME.textContent.calendar);
    email.scheduling = iTIPMethod(ics);
    email.event = convertICSToEvent(ics);
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

function convertICSToEvent(ics: ICalParser): Event | null {
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
  let organizer: PersonUID | undefined;
  if (vevent.entries.organizer) {
    let value = vevent.entries.organizer[0].value.replace(/^MAILTO:/i, "");
    organizer = findOrCreatePersonUID(sanitize.emailAddress(value), sanitize.label(vevent.entries.organizer[0].properties.cn, null));
    event.participants.add(organizer);
  }
  if (vevent.entries.attendee) {
    for (let { value, properties: { role, cn } } of vevent.entries.attendee) {
      value = value.replace(/^MAILTO:/i, "");
      if (value == organizer?.emailAddress || /^CHAIR$/i.test(role)) {
        // Remove the organizer as it has less detail than an attendee
        event.participants.remove(organizer);
      }
      let attendee = findOrCreatePersonUID(sanitize.emailAddress(value), sanitize.label(cn, null));
      event.participants.add(attendee);
    }
  }
  return event;
}
