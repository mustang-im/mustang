import { Event, RecurrenceCase } from "../Event";
import { Participant } from "../Participant";
import { RecurrenceRule } from "../RecurrenceRule";
import { InvitationMessage, ParticipationStatus, InvitationResponse } from "../Invitation";
import ICalParser from "./ICalParser";
import WindowsToIANATimezone from "./WindowsToIANATimezone";
import type { EMail } from "../../Mail/EMail";
import { EMailProcessor, ProcessingStartOn } from "../../Mail/EMailProccessor";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";

export class ICalEMailProcessor extends EMailProcessor {
  runOn = ProcessingStartOn.Parse;
  async process(email: EMail, postalMIME: any) {
    let invitationBlob = email.attachments.find(a => a.mimeType == "text/calendar")?.content;
    if (!invitationBlob) {
      return;
    }
    let invitationStr = await invitationBlob.text();
    let ics = new ICalParser(invitationStr);
    email.invitationMessage = iTIPMethod(ics);
    email.event = convertICalToEvent(ics);
    if (email.event && email.html) {
      email.event.rawHTMLDangerous = email.html;
    }
  }
}

/* Find the iTIP method from a parsed vcalendar part */
function iTIPMethod(ics: any): InvitationMessage {
  switch (ics.containers.vcalendar?.[0].entries.method?.[0].value) {
  case "CANCEL":
    return InvitationMessage.CancelledEvent;
  case "REQUEST":
    return InvitationMessage.Invitation;
  case "REPLY":
    return InvitationMessage.ParticipantReply;
  }
  return InvitationMessage.None;
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
  if (value.endsWith("Z") || !tzid) {
    // Either UTC or floating.
    return [new Date(value), tzid];
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
    [event.startTime, event.timezone] = parseDate(vevent.entries.dtstart[0]);
  }
  if (vevent.entries.dtend) {
    [event.endTime] = parseDate(vevent.entries.dtend[0]);
  }
  if (vevent.entries.dtstart?.[0].properties.value?.toLowerCase() == "date") {
    event.allDay = true;
  }
  if (vevent.entries.rrule) {
    event.recurrenceCase = RecurrenceCase.Master;
    event.recurrenceRule = RecurrenceRule.fromCalString(event.startTime, vevent.entries.rrule[0].line);
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
        event.participants.remove(organizer);
        organizer = null;
      }
      event.participants.add(participant);
    }
  }
  return event;
}
