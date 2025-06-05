import type { Event } from "../Event";
import { InvitationResponse, ParticipationStatus, type iCalMethod } from "../Invitation/InvitationStatus";
import { appName } from "../../build";
import { assert } from "../../util/util";

export function getICal(event: Event, method?: iCalMethod): string | null {
  assert(event, "Need event");
  /* We have to special-case RRULE as it contains ";"s
   * which must not be escaped as normal text values would */
  const lines: (string | string[])[] = [];
  lines.push(["BEGIN", "VCALENDAR"]);
  if (method) {
    lines.push(["METHOD", method]);
  }
  lines.push(["VERSION", "2.0"]);
  lines.push(["PRODID", `-//Beonex//${appName}//EN`]);
  lines.push(["BEGIN", "VEVENT"]);
  lines.push(["DTSTAMP", utc2ical(new Date())]);
  lines.push(["UID", event.calUID]);
  if (event.title) {
    lines.push(["SUMMARY", event.title]);
  }
  if (event.descriptionText) {
    lines.push(["DESCRIPTION", event.descriptionText]);
  }
  if (event.allDay) {
    lines.push(["DTSTART", "VALUE", "DATE", date2ical(event.startTime)]);
    lines.push(["DTEND", "VALUE", "DATE", date2ical(event.endTime)]);
  } else {
    let timezone = event.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone == "UTC") {
      lines.push(["DTSTART", "VALUE", "DATE-TIME", utc2ical(event.startTime)]);
      lines.push(["DTEND", "VALUE", "DATE-TIME", utc2ical(event.endTime)]);
    } else {
      lines.push(["DTSTART", "VALUE", "DATE-TIME", "TZID", timezone, datetime2ical(event.startTime, timezone)]);
      lines.push(["DTEND", "VALUE", "DATE-TIME", "TZID", timezone, datetime2ical(event.endTime, timezone)]);
    }
  }
  if (event.location) {
    lines.push(["LOCATION", event.location]);
  }
  let organizer = event.participants.find(participant => participant.response == InvitationResponse.Organizer);
  if (organizer) {
    lines.push(["ORGANIZER", "MAILTO:" + organizer.emailAddress]);
  }
  if (event.recurrenceRule) {
    lines.push(event.recurrenceRule.getCalString(event.allDay) + "\r\n");
  }
  for (let participant of event.participants) {
    switch (participant.response) {
    case InvitationResponse.Organizer:
      lines.push(["ATTENDEE", "ROLE", "CHAIR", "PARTSTAT", "ACCEPTED", "CN", participant.name, "MAILTO:" + participant.emailAddress]);
      break;
    case InvitationResponse.Tentative:
    case InvitationResponse.Accept:
    case InvitationResponse.Decline:
      lines.push(["ATTENDEE", "PARTSTAT", ParticipationStatus[participant.response], "CN", participant.name, "MAILTO:" + participant.emailAddress]);
      break;
    default:
      lines.push(["ATTENDEE", "RSVP", "TRUE", "CN", participant.name, "MAILTO:" + participant.emailAddress]);
      break;
    }
  }
  lines.push(["END", "VEVENT"]);
  lines.push(["END", "VCALENDAR"]);
  return lines.map(line2ical).join("");
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

function utc2ical(date: Date): string {
  return date.toISOString().replace(/-|:|\..../g, "");
}

function date2ical(date: Date): string {
  return String(date.getFullYear()) + String(date.getMonth() + 1).padStart(2, "0") + String(date.getDate()).padStart(2, "0");
}

function datetime2ical(date: Date, timeZone: string): string {
  // "lt" locale has date format YYYY-MM-DD hh:mm:ss,
  // which we can easily convert into iCal format.
  return date.toLocaleString("lt", { timeZone }).replace(" ", "T").replace(/-|:/g, "");
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
