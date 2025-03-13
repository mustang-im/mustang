import type { Event } from "../Event";
import { ResponseType, ParticipationStatus, type iCalMethod } from "../Invitation";
import { appName } from "../../build";

export function getICal(event: Event, method?: iCalMethod): { method: iCalMethod, content: string } | null {
  if (!event || !method) {
    return null;
  }
  /* We have to special-case RRULE as it contains ";"s
   * which must not be escaped as normal text values would */
  const lines: (string | string[])[] = [];
  lines.push(["BEGIN", "VCALENDAR"]);
  lines.push(["METHOD", method]);
  lines.push(["VERSION", "2.0"]);
  lines.push(["PRODID", `-//Beonex//${appName}//EN`]);
  lines.push(["BEGIN", "VEVENT"]);
  lines.push(["DTSTAMP", date2ical(new Date(), false)]);
  lines.push(["UID", event.calUID]);
  if (event.title) {
    lines.push(["SUMMARY", event.title]);
  }
  if (event.descriptionText) {
    lines.push(["DESCRIPTION", event.descriptionText]);
  }
  const dateParts = ["VALUE", event.allDay ? "DATE" : "DATE-TIME", "TZID", Intl.DateTimeFormat().resolvedOptions().timeZone];
  lines.push(["DTSTART", ...dateParts, date2ical(event.startTime, event.allDay)]);
  lines.push(["DTEND", ...dateParts, date2ical(event.endTime, event.allDay)]);
  if (event.location) {
    lines.push(["LOCATION", event.location]);
  }
  let organizer = event.participants.find(participant => participant.response == ResponseType.Organizer);
  if (organizer) {
    lines.push(["ORGANIZER", "MAILTO:" + organizer.emailAddress]);
  }
  if (event.recurrenceRule) {
    lines.push(event.recurrenceRule.getCalString() + "\r\n");
  }
  for (let participant of event.participants) {
    switch (participant.response) {
    case ResponseType.Organizer:
      lines.push(["ATTENDEE", "ROLE", "CHAIR", "PARTSTAT", "ACCEPTED", "CN", participant.name, "MAILTO:" + participant.emailAddress]);
      break;
    case ResponseType.Tentative:
    case ResponseType.Accept:
    case ResponseType.Decline:
      lines.push(["ATTENDEE", "PARTSTAT", ParticipationStatus[participant.response], "CN", participant.name, "MAILTO:" + participant.emailAddress]);
      break;
    default:
      lines.push(["ATTENDEE", "RSVP", "TRUE", "CN", participant.name, "MAILTO:" + participant.emailAddress]);
      break;
    }
  }
  lines.push(["END", "VEVENT"]);
  lines.push(["END", "VCALENDAR"]);
  const content = lines.map(line2ical).join("");
  return { method, content };
}

function line2ical(line: string | string[]): string {
  if (typeof line == "string") {
    return line;
  }
  let text = line.shift();
  let value = line.pop();
  while (line.length) {
    text += ";" + line.shift() + "=" + escaped(line.shift(), true);
  }
  text += ":" + escaped(value, false);
  // Lines longer than 75 octets should be folded.
  // XXX should use TextEncoder to count octets.
  return text.match(/.{1,75}/gu).join("\r\n ") + "\r\n";
}

function date2ical(date: Date, allDay: boolean): string {
  if (!allDay) {
    return date.toISOString().replace(/-|:|\..../g, "");
  }
  return String(date.getFullYear()) + String(date.getMonth() + 1).padStart(2, "0") + String(date.getDate()).padStart(2, "0");
}

function escaped(s: string, quote: boolean): string {
  if (quote) {
    // param-value isn't supposed to include these at all;
    // maybe we should just delete them?
    s = s.replace(/["\\]/g, "\\$&").replace(/\r\n?|\n/g, "\\n");
    if (/[\\:;,]/.test(s)) {
      s = `"${s}"`;
    }
  } else {
    s = s.replace(/[\\;,]/g, "\\$&").replace(/\r\n?|\n/g, "\\n");
  }
  return s;
}
