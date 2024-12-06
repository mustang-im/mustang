import { Event } from "./Event";
import { RecurrenceRule } from "./RecurrenceRule";
import { Scheduling } from "./Invitation";
import type { EMail } from "../Mail/EMail";
import { EMailProcessor, ProcessingStartOn } from "../Mail/EMailProccessor";
import { PersonUID, findOrCreatePersonUID } from "../Abstract/PersonUID";
import { assert } from "../util/util";
import { sanitize } from "../../../lib/util/sanitizeDatatypes";
import PostalMime from "postal-mime";

export class ICSProcessor extends EMailProcessor {
  runOn = ProcessingStartOn.Parse;
  process(email: EMail, postalMIME: any) {
    if (!postalMIME.textContent?.calendar) {
      return;
    }
    let ics = new icalParser(postalMIME.textContent.calendar);
    email.scheduling = iTIPMethod(ics);
    email.event = convertICSToEvent(ics);
    if (email.event && !email.event.descriptionHTML && email.html) {
      email.event.descriptionHTML = email.html;
    }
  }
}

/* Find the iTIP method from a parsed vcalendar part */
function iTIPMethod(ics: any): Scheduling {
  switch (ics.VCALENDAR[0]?.METHOD?.[0].value) {
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

declare global {
  interface String {
    toUpperCase<T extends string>(this: T): Uppercase<T>;
  }
}

function unescaped(value: string): string {
  return value.replace(/\\n|\\(.)/gi, (_, c) => c || "\n");
}

class icalEntry {
  [s: Uppercase<string>]: string;
  name: Uppercase<string>;
  value: string;
  line: string;
  constructor(line: string) {
    this.line = line;
    let pos = line.search(/[;:]/);
    this.name = line.slice(0, pos).toUpperCase();
    line = line.slice(pos);
    while (/^;([-\w]+)=("?)((\\?.)*?)\2(?=[;:])/.test(line)) {
      this[RegExp.$1.toUpperCase()] = unescaped(RegExp.$3);
      line = RegExp.rightContext;
    }
    this.value = unescaped(line.slice(1));
  }
}

class icalContainer {
  [s: Uppercase<string>]: icalEntry[];
  parent: icalContainer | icalParser;
  constructor(parent: icalContainer | icalParser) {
    this.parent = parent;
  }
}

class icalParser {
  [s: Uppercase<string>]: icalContainer[];
  constructor(calendar: string) {
    let current: icalContainer | icalParser = this;
    for (let line of calendar.replace(/[\r\n]+/g, "\n").replace(/\n\s|\n$/g, "").split("\n")) {
      if (/^BEGIN:([-\w]+)$/.test(line)) {
        let name = RegExp.$1.toUpperCase();
        current = new icalContainer(current);
        this[name] = append(this[name], current);
      } else if (/^END:([-\w]+)$/.test(line)) {
        let name = RegExp.$1.toUpperCase();
        assert(this[name] && this[name].at(-1) == current, "END without matching BEGIN");
        assert(current instanceof icalContainer, "END without BEGIN");
        current = current.parent;
      } else {
        assert(current instanceof icalContainer, "item outside container");
        let item = new icalEntry(line);
        current[item.name] = append(current[item.name], item);
      }
    }
  }
}

function append<T>(values: T[] | undefined, value: T): T[] {
  values ||= [];
  values.push(value);
  return values;
}

function parseDate(icalDate: string): Date {
  return new Date(icalDate.replace(/^(\d{4})(\d\d)(\d\d)/, "$1-$2-$3").replace(/(T\d\d)(\d\d)(\d\dZ?)$/, "$1:$2:$3"));
}

function convertICSToEvent(ics: icalParser): Event | null {
  if (!ics.VEVENT[0]) {
    return null;
  }
  let vevent = ics.VEVENT[0];
  let event = new Event();
  if (vevent.UID) {
    event.calUID = vevent.UID[0].value;
  }
  if (vevent.SUMMARY) {
    event.title = vevent.SUMMARY[0].value;
  }
  if (vevent.DESCRIPTION) {
    event.descriptionText = vevent.DESCRIPTION[0].value;
  }
  if (vevent.DTSTART) {
    event.startTime = parseDate(vevent.DTSTART[0].value);
  }
  if (vevent.DTEND) {
    event.endTime = parseDate(vevent.DTEND[0].value);
  }
  if (vevent.DTSTART?.[0].VALUE == "date") {
    event.allDay = true;
  }
  if (vevent.RRULE) {
    event.repeat = true;
    event.recurrenceRule = RecurrenceRule.fromCalString(event.startTime, vevent.RRULE[0].line);
  }
  if (vevent.LOCATION) {
    event.location = vevent.LOCATION[0].value;
  }
  let organizer: PersonUID | undefined;
  if (vevent.ORGANIZER) {
    let value = vevent.ORGANIZER[0].value.replace(/^MAILTO:/i, "");
    organizer = findOrCreatePersonUID(sanitize.emailAddress(value), sanitize.label(vevent.ORGANIZER[0].CN, null));
    event.participants.add(organizer);
  }
  if (vevent.ATTENDEE) {
    for (let { value, ROLE, CN } of vevent.ATTENDEE) {
      value = value.replace(/^MAILTO:/i, "");
      if (value == organizer?.emailAddress || /^CHAIR$/i.test(ROLE)) {
        // Remove the organizer as it has less detail than an attendee
        event.participants.remove(organizer);
      }
      let attendee = findOrCreatePersonUID(sanitize.emailAddress(value), sanitize.label(CN, null));
      event.participants.add(attendee);
    }
  }
  return event;
}
