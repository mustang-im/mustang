import type { Event } from "../Event";
import { Participant } from "../Participant";
import { RecurrenceRule } from "../RecurrenceRule";
import { ParticipationStatus, InvitationResponse } from "../Invitation/InvitationStatus";
import { ContentDisposition } from "../../Abstract/Attachment";
import { ICalContainer, ICalParser } from "./ICalParser";
import { WindowsToIANATimezone } from "./WindowsTimezone";
import { base64ToUint8Array, fileExtensionForMIMEType, type URLString } from "../../util/util";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { stringFromDataURL } from "../../../frontend/Util/util";
import { gt } from "../../../l10n/l10n";
import type { ArrayColl } from "svelte-collections";

/**
 * @param ics iCal .ics contents to be parsed
 * @param event Output: Put the iCal data into this object
 * @param baseURL Where the .ics came from, to resolve relative URLs in it
 * @returns whether an iCal event is indeed contained an event
 */
export function convertICalToEvent(ics: string, event: Event, baseURL?: URLString): boolean {
  let parsed = new ICalParser(ics);
  let vevents = parsed.containers.vevent;
  if (!vevents?.length) {
    return false;
  }
  // A recurring event with modified occurrences has multiple VEVENTs:
  // the master, and one per modified occurrence, marked with RECURRENCE-ID.
  let master = vevents.find(v => !v.entries.recurrenceid) ?? vevents[0];
  convertICalContainerToEvent(master, event, baseURL);
  return true;
}

/**
 * Takes a iCal .ics calendar file with events (multiple iCal events concatenated) and
 * returns Event objects for it.
 * @param iCalFile file contents
 * @param newEvent Factory function to create the subclass of Event that you need
 */
export function convertICalToEvents(iCalFile: string, newEvent: () => Event, errorCallback: (ex: Error) => void): Event[] {
  let events = [];
  let parsed = new ICalParser(iCalFile);
  if (!parsed.containers.vevent) {
    throw new Error(gt`No iCal found`);
  }
  for (let iCal of parsed.containers.vevent) {
    try {
      let event = newEvent();
      convertICalContainerToEvent(iCal, event);
      events.push(event);
    } catch (ex) {
      errorCallback(ex);
    }
  }
  return events;
}

/**
 * @param ics iCal / ICS, already parsed
 * @param event Output: Put the ics data into this object
 * @param baseURL Where the .ics came from, to resolve relative URLs in it
 * TODO need to handle more removed properties
 */
export function convertICalContainerToEvent(vevent: ICalContainer, event: Event, baseURL?: URLString): void {
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
    event.recurrenceRule = RecurrenceRule.fromCalString(event.duration, event.timezone, event.startTime, vevent.entries.rrule[0].line);
  } else {
    event.recurrenceRule = null;
  }
  if (vevent.entries.conference) {
    // <https://www.rfc-editor.org/rfc/rfc7986#section-5.11>
    event.isOnline = true;
    event.onlineMeetingURL = vevent.entries.conference[0].value;
  }
  if (vevent.entries.location) {
    // Some clients send the online meeting URL in `LOCATION` (see `CONFERENCE` above)
    event.setLocationFromServer(vevent.entries.location[0].value);
  }
  if (vevent.entries.status?.[0].value == "CANCELLED") {
    event.isCancelled = true;
  }
  event.participants.clear(); // in case we're updating an existing event
  let organizer: Participant | undefined;
  if (vevent.entries.organizer) {
    let value = vevent.entries.organizer[0].value.replace(/^MAILTO:/i, "");
    organizer = new Participant(sanitize.emailAddress(value), sanitize.label(vevent.entries.organizer[0].properties.cn, null), InvitationResponse.Organizer);
    event.participants.add(organizer);
  }
  if (vevent.entries.attendee) {
    for (let { value, properties: { role, partstat, cn } } of vevent.entries.attendee) {
      value = value.replace(/^MAILTO:/i, "");
      let participant = new Participant(sanitize.emailAddress(value), sanitize.label(cn, null), sanitize.integer(ParticipationStatus[partstat?.toUpperCase() as keyof typeof ParticipationStatus] || InvitationResponse.Unknown));
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
  readAttachments(vevent, event, baseURL);
}

/** Attachments, RFC 5545 3.8.1.1. Either the file itself, inline and base64-encoded,
 * or - the default - only a URI where the file is stored, e.g. Nextcloud saves the
 * files in the user's file storage. `SIZE` and `FILENAME` are RFC 8607,
 * `X-FILENAME` is what Outlook writes. */
function readAttachments(vevent: ICalContainer, event: Event, baseURL?: URLString): void {
  event.attachments.clear(); // in case we're updating an existing event
  let fallbackID = 0;
  for (let entry of vevent.entries.attach ?? []) {
    let isInline = entry.properties.value?.toUpperCase() == "BINARY";
    let url = isInline ? null : attachmentURL(entry.value, baseURL);
    if (!isInline && !url) {
      continue; // neither the file nor a URL where we could get it
    }
    let attachment = event.newAttachment();
    attachment.mimeType = sanitize.nonemptystring(entry.properties.fmttype, "application/octet-stream");
    attachment.filename = sanitize.filename(
      entry.properties.filename ?? entry.properties["x-filename"] ?? entry.properties["x-apple-filename"] ??
      filenameFromURL(url),
      "attachment-" + ++fallbackID + "." + fileExtensionForMIMEType(attachment.mimeType));
    if (isInline) {
      attachment.content = new File([base64ToUint8Array(entry.value)], attachment.filename, { type: attachment.mimeType });
      attachment.size = attachment.content.size;
    } else {
      attachment.url = url;
      attachment.size = sanitize.integer(entry.properties.size, null);
    }
    attachment.disposition = ContentDisposition.attachment;
    event.attachments.add(attachment);
  }
}

/** @param value The `ATTACH` value, a URI, as the server wrote it.
 *   Nextcloud writes it relative to the server, e.g. `/index.php/f/1234`.
 * @returns absolute URL, or null, if it's not a URL that we can fetch */
function attachmentURL(value: string, baseURL?: URLString): URLString | null {
  try {
    return sanitize.url(new URL(value, baseURL).href, null);
  } catch (ex) { // not a URL, or relative without a base URL
    return null;
  }
}

/** @returns the file name that the URL ends with, if any */
function filenameFromURL(url: URLString | null): string | null {
  try {
    return url && decodeURIComponent(new URL(url).pathname.split("/").pop());
  } catch (ex) { // broken percent encoding
    return null;
  }
}

const icalDateRegex = /^(\d{4})(\d\d)(\d\dT\d\d)(\d\d)(\d\dZ?)$/;

export function parseDate(icalDate: { value: string, properties: { tzid?: string } }): [Date | null, string | null] {
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
