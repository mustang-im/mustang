import type { Event } from "../Event";
import { Participant } from "../Participant";
import { RecurrenceRule } from "../RecurrenceRule";
import { ParticipationStatus, InvitationResponse } from "../Invitation/InvitationStatus";
import { ICalParser } from "./ICalParser";
import { WindowsToIANATimezone } from "./WindowsTimezone";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { stringFromDataURL } from "../../../frontend/Util/util";

/**
 * @param ics iCal / ICS contents to be parsed
 * @param event Output: Put the ics data into this object
 * @returns whether ics indeed contained an event
 */
export function convertICalToEvent(ics: string, event: Event): boolean {
  return convertICalParserToEvent(new ICalParser(ics), event);
}

/**
 * @param ics iCal / ICS, already parsed
 * @param event Output: Put the ics data into this object
 * @returns whether ics indeed contained an event
 * TODO need to handle more removed properties
 */
export function convertICalParserToEvent(ics: ICalParser, event: Event): boolean {
  if (!ics.containers.vevent) {
    return false;
  }
  let vevent = ics.containers.vevent[0];
  if (vevent.entries.uid) {
    event.calUID = vevent.entries.uid[0].value;
  }
  if (vevent.entries.summary) {
    event.title = vevent.entries.summary[0].value;
  }
  if (vevent.entries.description) {
    // Plaintext
    event.descriptionText = vevent.entries.description[0].value;
    // HTML RFC 2445 4.2.1, 4.2, RFC 5545 3.2.1 and Thunderbird
    // <https://datatracker.ietf.org/doc/html/rfc2445#section-4.2.1>
    // <https://bugzilla.mozilla.org/show_bug.cgi?id=1607834>
    let altrep = vevent.entries.description[0].properties.altrep;
    event.rawHTMLDangerous = stringFromDataURL(altrep, "text/html");
  }
  // HTML RFC 9073 6.5 <https://www.rfc-editor.org/rfc/rfc9073.html#name-styled-description>
  // Preference order: 1. RFC 9075, 2. Thunderbird, 3. Outlook
  if (vevent.entries.styleddescription) {
    let entry = vevent.entries.styleddescription.find(entry =>
      (!entry.properties.fmttype || entry.properties.fmttype.toLowerCase() == "text/html") &&
      entry.properties.value.toUpperCase() == "TEXT");
    if (entry) {
      event.rawHTMLDangerous = entry.value;
    }
  }
  // HTML Outlook
  if (vevent.entries.xaltdesc && !event.hasHTML) {
    let entry = vevent.entries.xaltdesc.find(entry =>
      (!entry.properties.fmttype || entry.properties.fmttype.toLowerCase() == "text/html"));
    if (entry) {
      event.rawHTMLDangerous = entry.value;
    }
  }
  if (vevent.entries.dtstart) {
    [event.startTime, event.timezone] = parseDate(vevent.entries.dtstart[0]);
  }
  if (vevent.entries.dtend) {
    [event.endTime] = parseDate(vevent.entries.dtend[0]);
  }
  if (vevent.entries.recurrenceid) {
    [event.recurrenceStartTime] = parseDate(vevent.entries.recurrenceid[0]);
  }
  if (vevent.entries.dtstamp) {
    [event.lastUpdateTime] = parseDate(vevent.entries.dtstamp[0]);
  }
  if (vevent.entries.dtstart?.[0].properties.value?.toLowerCase() == "date") {
    event.allDay = true;
  }
  if (vevent.entries.rrule) {
    event.recurrenceRule = RecurrenceRule.fromCalString(event.duration, event.startTime, vevent.entries.rrule[0].line);
  } else {
    event.recurrenceRule = null;
  }
  if (vevent.entries.location) {
    event.location = vevent.entries.location[0].value;
  }
  let organizer: Participant | undefined;
  if (vevent.entries.organizer) {
    let value = vevent.entries.organizer[0].value.replace(/^MAILTO:/i, "");
    organizer = new Participant(sanitize.emailAddress(value), sanitize.label(vevent.entries.organizer[0].properties.cn, null), InvitationResponse.Organizer);
    event.participants.add(organizer);
  }
  if (vevent.entries.attendee) {
    for (let { value, properties: { role, partstat, cn } } of vevent.entries.attendee) {
      value = value.replace(/^MAILTO:/i, "");
      let participant = new Participant(sanitize.emailAddress(value), sanitize.label(cn, null), sanitize.integer(ParticipationStatus[partstat?.toUpperCase()] || InvitationResponse.Unknown));
      if (participant.emailAddress == organizer?.emailAddress || /^CHAIR$/i.test(role)) {
        participant.response = InvitationResponse.Organizer;
        // Remove the organizer as it has less detail than an attendee
        if (organizer) {
          event.participants.remove(organizer);
          organizer = undefined;
        }
      }
      event.participants.add(participant);
    }
  }
  return true;
}

const icalDateRegex = /^(\d{4})(\d\d)(\d\dT\d\d)(\d\d)(\d\dZ?)$/;

function parseDate(icalDate: { value: string, properties: { tzid?: string } }): [Date | null, string | null] {
  let value = icalDate.value;
  let tzid = icalDate.properties.tzid || null;
  if (value.length == 8) {
    // Represent dates as 00:00:00 local time.
    value += "T000000";
  }
  // Sanity check.
  if (!icalDateRegex.test(value)) {
    return [null, null];
  }
  // Convert to regular Date string format.
  value = value.replace(icalDateRegex, "$1-$2-$3:$4:$5");
  if (value.endsWith("Z")) { // UTC
    return [new Date(value), tzid || "UTC"];
  }
  if (!tzid) { // floating
    return [new Date(value), null];
  }
  if (tzid in WindowsToIANATimezone) {
    tzid = WindowsToIANATimezone[tzid];
  }
  value += "Z";
  let utc = new Date(value);
  try {
    // Work out the time zone offset for the time given as UTC.
    // "lt" locale has date format YYYY-MM-DD hh:mm:ss,
    // which we can easily convert into ISO format.
    let offset = new Date(utc.toLocaleString("lt", { timeZone: tzid }).replace(" ", "T") + "Z").getTime() - utc.getTime();
    let local = new Date(utc.getTime() - offset);
    // Check the time zone offset at this local time,
    // as that may have jumped across a DST change.
    offset = new Date(local.toLocaleString("lt", { timeZone: tzid }).replace(" ", "T") + "Z").getTime() - utc.getTime();
    if (offset) {
      local = new Date(local.getTime() - offset);
    }
    return [local, tzid];
  } catch (ex) {
    return [null, null];
  }
}
