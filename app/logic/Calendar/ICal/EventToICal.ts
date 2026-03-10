import type { Event } from "../Event";
import { InvitationResponse, ParticipationStatus, type iCalMethod } from "../Invitation/InvitationStatus";
import { appName } from "../../build";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { VContainer, type VObject } from "../../util/VParser";
import { assert } from "../../util/util";
import type { Collection } from "svelte-collections";

export function getICal(event: Event, method?: iCalMethod): string {
  assert(event, "Need event");
  return `BEGIN:VCALENDAR\r\n${method ? `METHOD:${method}\r\n` : ""}VERSION:2.0\r\nPRODID:-//Beonex//${appName}//EN\r\n${eventToVEvent(event)}END:VCALENDAR\r\n`;
}

export function getUpdatedICal(event: Event, original: string, method?: iCalMethod) {
  let parsed = new VContainer(original);
  return `BEGIN:VCALENDAR\r\n${method ? `METHOD:${method}\r\n` : ""}VERSION:2.0\r\nPRODID:-//Beonex//${appName}//EN\r\n${getUpdatedVEvent(event, parsed.objects.vevent[0])}END:VCALENDAR\r\n`;
}

/**
 * Exports the given events into a single large iCal .ics file with all events
 * concatenated
 * @param events what to export
 * @param filenameWithoutExt a suggested filename, without extension.
 *    The name will be name filesystem-safe.
 * @returns iCal file contents, as UTF8 text file
 */
export function eventsToICalFile(events: Collection<Event>, filenameWithoutExt: string): File {
  let fileContents = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Beonex//${appName}//EN\r\n${events.contents.map(event => eventToVEvent(event)).join("")}END:VCALENDAR\r\n`;
  let filename = sanitize.filename(filenameWithoutExt) + ".ics";
  let file = new File([fileContents], filename, { type: "text/calendar" });
  return file;
}

export function eventToVEvent(event: Event, container: Record<string, string[]> = Object.create(null)): string {
  updateContainerFromEvent(event, container);
  return containerToVEvent(container);
}

export function getUpdatedVEvent(event: Event, vevent: VObject): string {
  let container = vEventToContainer(vevent);
  updateContainerFromEvent(event, container);
  return containerToVEvent(container);
}

export function vEventToContainer(vevent: VObject): Record<string, string[]> {
  let container: Record<string, string[]> = Object.create(null);
  for (let key in vevent.entries) {
    container[key] = vevent.entries[key].map(entry => entry.line);
  }
  return container;
}

export function updateContainerFromEvent(event: Event, container: Record<string, string[]>) {
  setValue(container, "dtstamp", datetime2ical(new Date()));
  setValue(container, "uid", event.calUID);
  setValue(container, "summary", event.title);
  setValue(container, "location", event.location || event.isOnline && event.onlineMeetingURL);
  setValue(container, "conference", event.onlineMeetingURL);
  if (event.hasHTML) {
    setValue(container, "description", event.descriptionText, { altrep: `"data:text/html,${encodeURIComponent(event.descriptionHTML)}"` });
    setValue(container, "styled-description", event.descriptionHTML, { value: "TEXT", fmttype: "text/html" });
    setValue(container, "x-alt-desc", event.descriptionHTML, { fmttype: "text/html" });
  } else {
    setValue(container, "description", event.descriptionText);
    setValue(container, "styled-description", "");
    setValue(container, "x-alt-desc", "");
  }
  let timeZone = event.allDay ? null : Intl.DateTimeFormat(undefined, { timeZone: event.timezone || "UTC" }).resolvedOptions().timeZone;
  let properties = event.allDay ? { value: "DATE" } : timeZone == "UTC" ? { value: "DATE-TIME" } : { value: "DATE-TIME", tzid: timeZone };
  setValue(container, "dtstart", datetime2ical(event.startTime, timeZone), properties);
  setValue(container, "dtend", datetime2ical(event.endTime, timeZone), properties);
  setValue(container, "recurrence-id", datetime2ical(event.recurrenceStartTime, timeZone), properties);
  if (event.recurrenceRule) {
    container.rrule = [event.recurrenceRule.getCalString(event.allDay)];
  } else {
    delete container.rrule;
  }
  setValue(container, "status", event.isCancelled ? "CANCELLED" : "");
  let organizer = event.participants.find(participant => participant.response == InvitationResponse.Organizer);
  setValue(container, "organizer", organizer ? "MAILTO:" + organizer.emailAddress : "");
  if (event.participants.hasItems) {
    let attendees = container.attendee = [];
    for (let participant of event.participants) {
      let line = "ATTENDEE";
      switch (participant.response) {
      case InvitationResponse.Organizer:
        line += ";ROLE=CHAIR;PARTSTAT=ACCEPTED";
        break;
      case InvitationResponse.Tentative:
      case InvitationResponse.Accept:
      case InvitationResponse.Decline:
        line += ";PARTSTAT=" + ParticipationStatus[participant.response];
        break;
      default:
        line += ";RSVP=TRUE";
      }
      if (participant.name) {
        line += ";CN=" + escaped(participant.name, true);
      }
      line += ":MAILTO:" + participant.emailAddress;
      attendees.push(line);
    }
  } else {
    delete container.attendee;
  }
}

function containerToVEvent(container: Record<string, string[]>): string {
  return "BEGIN:VEVENT\r\n" + Object.values(container).flat().map(line => line.match(/.{1,75}/gu).join("\r\n ")).join("\r\n") + "\r\nEND:VEVENT\r\n";
}

function setValue(container: Record<string, string[]>, key: string, value: string | null, parameters: Record<string, string> = {}) {
  if (!value) {
    delete container[key];
    return;
  }
  let line = key.toUpperCase();
  for (let parameter in parameters) {
    // We control parameters, no need to escape
    line += ";" + parameter.toUpperCase() + "=" + parameters[parameter];
  }
  line += ":";
  line += value.split(";").map(value => escaped(value, false)).join(";");
  container[key.replace("-", "")] = [line];
}

function datetime2ical(date: Date | null, timeZone: string | null = "UTC"): string | null {
  if (!date) {
    return null;
  }
  switch (timeZone) {
  case null:
    return String(date.getFullYear()) + String(date.getMonth() + 1).padStart(2, "0") + String(date.getDate()).padStart(2, "0");
  case "UTC":
    return date.toISOString().replace(/-|:|\..../g, "");
  default:
    // "lt" locale has date format YYYY-MM-DD hh:mm:ss,
    // which we can easily convert into iCal format.
    return date.toLocaleString("lt", { timeZone }).replace(" ", "T").replace(/-|:/g, "");
  }
}

function escaped(s: string, quote: boolean): string {
  if (!s) {
    return "";
  } else if (quote) {
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
