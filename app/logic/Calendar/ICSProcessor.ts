// SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>
//
// SPDX-License-Identifier: EUPL-1.2

import { Event } from "./Event";
import { RecurrenceRule } from "./RecurrenceRule";
import { Scheduling } from "./Invitation";
import type { EMail } from "../Mail/EMail";
import { EMailProcessor, ProcessingStartOn } from "../Mail/EMailProccessor";
import { PersonUID, findOrCreatePersonUID } from "../Abstract/PersonUID";
import { sanitize } from "../../../lib/util/sanitizeDatatypes";
import PostalMime from "postal-mime";
import ical from "node-ical";

export class ICSProcessor extends EMailProcessor {
  runOn: ProcessingStartOn.Parse;
  process(email: EMail, postalMIME: any) {
    if (email.event && !postalMIME.textContent?.calendar) {
      return;
    }
    let ics = ical.sync.parseICS(postalMIME.textContent.calendar);
    if (!ics) {
      return;
    }
    email.scheduling = iTIPMethod(ics);
    email.event = convertICSToEvent(ics);
    if (email.event && !email.event.descriptionHTML && email.html) {
      email.event.descriptionHTML = email.html;
    }
  }
}

/* Find the iTIP method from a parsed vcalendar part */
function iTIPMethod(ics: any): Scheduling {
  switch (ics.vcalendar.method) {
  case "CANCEL":
    return Scheduling.Cancellation;
  case "REQUEST":
    return Scheduling.Request;
  case "REPLY":
    let vevent = Object.values(ics).find((event: any) => event.type == "VEVENT") as any;
    switch (vevent?.attendee?.params?.PARTSTAT) {
    case "DECLINED":
      return Scheduling.Declined;
    case "TENTATIVE":
      return Scheduling.Tentative;
    case "ACCEPTED":
      return Scheduling.Accepted;
    }
  }
  return Scheduling.None;
}

function convertICSToEvent(ics: any): Event | null {
  let vevent = Object.values(ics).find((event: any) => event.type == "VEVENT") as any;
  if (!vevent) {
    return null;
  }
  // Parser tries to simplify simple properties for us...
  for (let prop in vevent) {
    if (typeof vevent[prop] == "string") {
      vevent[prop] = { params: {}, val: vevent[prop] };
    }
  }
  let event = new Event();
  if (vevent.uid) {
    event.calUID = vevent.uid.val;
  }
  if (vevent.summary) {
    event.title = vevent.summary.val;
  }
  if (vevent.description) {
    event.descriptionText = vevent.description.val;
  }
  if (vevent.start) {
    event.startTime = vevent.start;
  }
  if (vevent.end) {
    event.endTime = vevent.end;
  }
  if (vevent.datetype.val == "date") {
    event.allDay = true;
    // Start and end time will be in UTC, but we want local time,
    // so that we can display it to the user in their locale.
    event.startTime?.setFullYear(event.startTime.getUTCFullYear(), event.startTime.getUTCMonth(), event.startTime.getUTCDate());
    event.startTime?.setHours(0, 0, 0, 0);
    event.endTime?.setFullYear(event.endTime.getUTCFullYear(), event.endTime.getUTCMonth(), event.endTime.getUTCDate());
    event.endTime?.setHours(0, 0, 0, 0);
  }
  if (vevent.rrule) {
    event.repeat = true;
    // rrule object might contain DTSTART, remove in that case
    let rrule = vevent.rrule.toString().split("\n").pop();
    event.recurrenceRule = RecurrenceRule.fromCalString(event.startTime, rrule);
  }
  if (vevent.location) {
    event.location = vevent.location.val;
  }
  let organizer: PersonUID | undefined;
  if (vevent.organizer) {
    organizer = findOrCreatePersonUID(sanitize.nonemptystring(vevent.organizer.val), sanitize.label(vevent.organizer.params.CN, null));
    event.participants.add(organizer);
  }
  if (vevent.attendee) {
    if (!Array.isArray(vevent.attendee)) {
      vevent.attendee = [vevent.attendee];
    }
    for (let { val, params: { CN }} of vevent.attendee) {
      if (val == organizer?.emailAddress) {
        // Remove the organizer as it has less detail than an attendee
        event.participants.remove(organizer);
      }
      let attendee = findOrCreatePersonUID(sanitize.nonemptystring(val), sanitize.label(CN, null));
      event.participants.add(attendee);
    }
  }
  return event;
}
