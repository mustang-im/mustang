import { Event, Participant } from "./Event";
import { RecurrenceRule } from "./RecurrenceRule";
import { Scheduling, ParticipationStatus, ResponseType } from "./IMIP";
import type { EMail } from "../Mail/EMail";
import { EMailProcessor, ProcessingStartOn } from "../Mail/EMailProccessor";
import { PersonUID, findOrCreatePersonUID } from "../Abstract/PersonUID";
import { assert } from "../util/util";
import { sanitize } from "../../../lib/util/sanitizeDatatypes";
import PostalMime from "postal-mime";

export class ICSProcessor extends EMailProcessor {
  runOn: ProcessingStartOn.Parse;
  process(email: EMail, postalMIME: any) {
    if (email.event && !postalMIME.textContent?.calendar) {
      return;
    }
    let ics = new icalParser(postalMIME.textContent.calendar);
    email.scheduling = Scheduling[ics.VCALENDAR[0]?.METHOD?.[0].value] || Scheduling.NONE;
    email.event = convertICSToEvent(ics);
    if (email.event && !email.event.descriptionHTML && email.html) {
      email.event.descriptionHTML = email.html;
    }
  }
}

declare global {
  interface String {
    toUpperCase<T extends string>(this: T): Uppercase<T>;
  }
}

function unescaped(value: string): string {
  return value.replace(/\\(?:n|(.))/gi, (_, c) => c || "\n");
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
  let organizer: Participant | undefined;
  if (vevent.ORGANIZER) {
    let value = vevent.ORGANIZER[0].value.replace(/^MAILTO:/i, "");
    organizer = new Participant(sanitize.emailAddress(value), sanitize.label(vevent.ORGANIZER[0].CN, null), ResponseType.Organizer);
    event.participants.add(organizer);
  }
  if (vevent.ATTENDEE) {
    for (let { value, ROLE, PARTSTAT, CN } of vevent.ATTENDEE) {
      let participant = new Participant(sanitize.emailAddress(value), sanitize.label(CN, null), sanitize.integer(ParticipationStatus[PARTSTAT] || ResponseType.Unknown));
      value = value.replace(/^MAILTO:/i, "");
      if (value == organizer?.emailAddress || /^CHAIR$/i.test(ROLE)) {
        participant.response = ResponseType.Organizer;
        // Remove the organizer as it has less detail than an attendee
        event.participants.remove(organizer);
      }
      event.participants.add(participant);
    }
  }
  return event;
}
