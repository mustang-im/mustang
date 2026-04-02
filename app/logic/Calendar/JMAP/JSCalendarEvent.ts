import { Event, RecurrenceCase } from "../Event";
import type { TJMAPCalendarEvent, TJSCalendarRecurrenceRule, TJSCalendarRecurrenceFrequency } from "./TJSCalendar";
import { Frequency, RecurrenceRule, type RecurrenceInit } from "../RecurrenceRule";
import { InvitationResponse } from "../Invitation/InvitationStatus";
import { Participant } from "../Participant";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { NotImplemented, assert } from "../../util/util";

export class JSCalendarEvent {
  static toEvent(jmap: TJMAPCalendarEvent, event: Event) {
    // ID and metadata
    if (!event.parentEvent) {
      event.calUID = sanitize.nonemptystring(jmap.uid, null);
    }
    event.lastUpdateTime = sanitize.date(jmap.updated, null);
    event.original = jmap;

    // Text
    event.title = sanitize.nonemptystring(jmap.title, "");
    if (jmap.descriptionContentType?.startsWith("text/html")) {
      event.descriptionHTML = sanitize.string(jmap.description);
    } else if (jmap.descriptionContentType?.startsWith("text/plain")) {
      event.descriptionText = sanitize.string(jmap.description);
    } else { // not sure what to do with this
      event.descriptionText = sanitize.string(jmap.description);
    }

    // Time
    event.startTime = this.toDate(jmap.start, jmap);
    event.endTime = getEndTimeFromDuration(event.startTime, sanitize.nonemptystring(jmap.duration));
    event.timezone = jmap.timeZone ?? null;
    event.allDay = sanitize.boolean(jmap.showWithoutTime, false);

    // Recurrence
    if (jmap.recurrenceRule) {
      event.recurrenceCase = RecurrenceCase.Master;
      let r = jmap.recurrenceRule;
      let rrinit: RecurrenceInit = {
        masterDuration: event.duration,
        timezone: event.timezone,
        seriesStartTime: event.startTime,
        seriesEndTime: this.toDate(r.until, jmap, null),
        count: sanitize.integer(r.count, Infinity),
      // iCal and we don't support hourly, minutely or secondly. Esp. the latter is pretty silly
        frequency: sanitize.translate(r.frequency, {
          yearly: Frequency.Yearly,
          monthly: Frequency.Monthly,
          weekly: Frequency.Weekly,
          daily: Frequency.Daily,
        }, Frequency.Yearly),
        interval: sanitize.integerRange(r.interval, 1, Infinity, 1),
        first: sanitize.integer(jsCalWeekday[r.firstDayOfWeek as keyof typeof jsCalWeekday], jsCalWeekday.mo),
      };
      if (r.byDay) {
        rrinit.weekdays = r.byDay.map(day => sanitize.integer(jsCalWeekday[day.day as keyof typeof jsCalWeekday]));
        // jsCalendar uses -1..4 but we use 0..5
        rrinit.week = (sanitize.integer(r.byDay[0].nthOfPeriod, 0) + 6) % 6;
      }
      event.recurrenceRule = new RecurrenceRule(rrinit);
      // Exceptions and exclusions have to be handled by the caller,
      // once the event has been saved locally.
    }

    // Location
    if (jmap.locations) {
      let location = Object.values(jmap.locations)[0];
      event.location = sanitize.string(location.name, "");
      if (location.description) {
        event.location += kLocationNameDescriptionSeparator;
      }
      event.location += sanitize.string(location.description, "");
    }
    if (jmap.virtualLocations) {
      let conf = Object.values(jmap.virtualLocations)[0];
      event.isOnline = true;
      event.onlineMeetingURL = sanitize.url(conf.uri, null);
    }

    // Meeting with other participants
    event.isCancelled = jmap.status == "cancelled";
    if (jmap.participants) {
      for (let id in jmap.participants) {
        let participant = jmap.participants[id];
        let response =
          participant.roles?.owner ? InvitationResponse.Organizer :
            !participant.participationStatus || participant.participationStatus == "needs-action" ? InvitationResponse.NoResponseReceived :
              participant.participationStatus == "accepted" ? InvitationResponse.Accept :
                participant.participationStatus == "declined" ? InvitationResponse.Decline :
                  participant.participationStatus == "tentative" ? InvitationResponse.Tentative :
                    InvitationResponse.Unknown;
        let p = new Participant(participant.email, participant.name, response);
        event.participants.add(p);
      }
    }

    event.color = sanitize.nonemptystring(jmap.color, null);
  }

  static fromEvent(event: Event, jmap: TJMAPCalendarEvent) {
    // ID and metadata
    Object.assign(jmap, event.original);
    if (!event.parentEvent) {
      jmap.uid = event.calUID;
    }
    jmap.updated = (event.lastUpdateTime ?? new Date()).toISOString();
    jmap.sequence ??= -1;
    jmap.sequence++;

    // Text
    jmap.title = event.title;
    if (event.hasHTML) {
      jmap.descriptionContentType == "text/html";
      jmap.description = event.descriptionHTML;
    } else {
      jmap.descriptionContentType == "text/plain";
      jmap.description = event.descriptionText;
    }

    // Time
    jmap.start = this.fromDate(event.startTime, event);
    if (Number.isInteger(event.durationDays)) {
      jmap.duration = "P" + event.durationDays + "D";
    } else if (Number.isInteger(event.durationHours)) {
      jmap.duration = "PT" + event.durationHours + "H";
    } else if (Number.isInteger(event.durationMinutes)) {
      jmap.duration = "PT" + event.durationMinutes + "M";
    } else {
      jmap.duration = "PT" + event.duration + "S";
    }
    jmap.timeZone = event.timezone;
    jmap.showWithoutTime = event.allDay;

    // Recurrence
    if (event.recurrenceCase == RecurrenceCase.Master) {
      let jr = jmap.recurrenceRule ??= {} as TJSCalendarRecurrenceRule;
      delete jr.byMonthDay;
      delete jr.byMonth;
      delete jr.byYearDay;
      delete jr.byWeekNo;
      delete jr.byHour;
      delete jr.byMinute;
      delete jr.bySecond;
      delete jr.bySetPosition;
      let er = event.recurrenceRule;
      jr.frequency = er.frequency.toLowerCase() as TJSCalendarRecurrenceFrequency,
      jr.interval = er.interval;
      jr.firstDayOfWeek = jsCalWeekday[er.first];
      if (er.seriesEndTime) {
        delete jr.count;
        jr.until = this.fromDate(er.seriesEndTime, event);
      } else if (Number.isFinite(er.count)) {
        delete jr.until;
        jr.count = er.count;
      } else {
        delete jr.count;
        delete jr.until;
      }
      if (er.weekdays) {
        if (er.week) {
          jr.byDay = er.weekdays.map(day => ({ day: jsCalWeekday[day], nthOfPeriod: er.week == 5 ? -1 : er.week }));
        } else {
          jr.byDay = er.weekdays.map(day => ({ day: jsCalWeekday[day] }));
        }
      }
      for (let exclusion of event.exclusions) {
        let ro = jmap.recurrenceOverrides ??= {};
        ro[this.fromDate(exclusion, event)] = { excluded: true } as TJMAPCalendarEvent;
      }
      for (let exception of event.exceptions) {
        let ro = jmap.recurrenceOverrides ??= {};
        this.fromEvent(exception, ro[this.fromDate(exception.recurrenceStartTime, event)] ??= {} as TJMAPCalendarEvent);
      }
    }

    // Location
    if (event.location) {
      jmap.locations ??= {};
      let location = Object.values(jmap.locations)[0];
      if (!location) {
        location = {
          "@type": "Location",
        };
        jmap.locations["0"] = location;
      }
      let descriptionPos = event.location.indexOf(kLocationNameDescriptionSeparator);
      if (descriptionPos > 1) {
        location.name = event.location.substring(0, descriptionPos);
        location.description = event.location.substring(descriptionPos + kLocationNameDescriptionSeparator.length);
      } else {
        location.name = event.location;
        delete location.description;
      }
    } else if (jmap.locations) {
      let first = Object.keys(jmap.locations)[0];
      delete jmap.locations[first];
    }
    if (event.isOnline && event.onlineMeetingURL) {
      jmap.virtualLocations ??= {};
      let location = Object.values(jmap.virtualLocations)[0];
      if (!location) {
        location = {
          "@type": "VirtualLocation",
          uri: "",
        };
        jmap.virtualLocations["0"] = location;
      }
      location.uri = event.onlineMeetingURL;
    } else if (jmap.virtualLocations) {
      let first = Object.keys(jmap.virtualLocations)[0];
      delete jmap.virtualLocations[first];
    }

    // Meeting with other participants
    if (event.isCancelled) {
      jmap.status = "cancelled";
    } else if (jmap.status == "cancelled") {
      jmap.status = null;
    }
    if (event.participants.hasItems) {
      jmap.participants ??= {};
      for (let id of Object.keys(jmap.participants)) {
        let participant = jmap.participants[id];
        let p = participant.email
          ? event.participants.find(p => p.emailAddress == participant.email)
          : event.participants.find(p => p.name == participant.name);
        if (!p) {
          delete jmap.participants[id];
          continue;
        }
        if (p.response == InvitationResponse.Organizer) {
          participant.roles ??= {};
          participant.roles.owner = true;
        } else if (p.response == InvitationResponse.Accept) {
          participant.participationStatus = "accepted";
        } else if (p.response == InvitationResponse.Decline) {
          participant.participationStatus = "declined";
        } else if (p.response == InvitationResponse.Tentative) {
          participant.participationStatus = "tentative";
        } else if (p.response == InvitationResponse.Unknown) {
          // JMAP status that we don't support. Keep it as-is.
        } // else `InvitationResponse` not yet listed here -> keep as-is
      }
    } else if (jmap.participants) {
      delete jmap.participants;
    }

    jmap.color = event.color;
  }

  static toDate(date: string, jmap: TJMAPCalendarEvent, fallback?: null): Date {
    if (/Z$/.test(date) || !jmap.timeZone || jmap.showWithoutTime) {
      // Easy cases:
      // - date was already in UTC
      // - no time zone was provided
      // - event is an all-day event
      return sanitize.date(date, fallback);
    }
    date += "Z";
    let utc = sanitize.date(date, fallback);
    // Work out the time zone offset for the time given as UTC.
    // "lt" locale has date format YYYY-MM-DD hh:mm:ss,
    // which we can easily convert into ISO format.
    let offset = new Date(utc.toLocaleString("lt", { timeZone: jmap.timeZone }).replace(" ", "T") + "Z").getTime() - utc.getTime();
    let local = new Date(utc.getTime() - offset);
    // Check the time zone offset at this local time,
    // as that may have jumped across a DST change.
    offset = new Date(local.toLocaleString("lt", { timeZone: jmap.timeZone }).replace(" ", "T") + "Z").getTime() - utc.getTime();
    if (offset) {
      local = new Date(local.getTime() - offset);
    }
    return local;
  }

  static fromDate(date: Date, event: Event): string {
    // All-day events should have a time of zero and no UTC indicator.
    // `toISOString` might not even provide the right date in this case.
    // "lt" locale has date format YYYY-MM-DD.
    return event.allDay ? date.toLocaleDateString("lt") + "T00:00:00" : date.toISOString();
  }
}

function getEndTimeFromDuration(start: Date, duration: string): Date {
  const match = duration.match(/^P(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:([\d.]+)S)?)?$/);
  assert(match, "JSCalendar duration is invalid. Bad value: " + duration);
  const [, weeks, days, hours, minutes, seconds] = match;
  const totalMs = (Number(weeks || 0) * 7 + Number(days || 0)) * 86400000
    + Number(hours || 0) * 3600000
    + Number(minutes || 0) * 60000
    + Number(seconds || 0) * 1000;
  return new Date(start.getTime() + totalMs);
}

const kLocationNameDescriptionSeparator = "\n---\n";

/** Maps between jsCal names and JavaScript day of week values */
enum jsCalWeekday {
  su = 0,
  mo = 1,
  tu = 2,
  we = 3,
  th = 4,
  fr = 5,
  sa = 6,
}
