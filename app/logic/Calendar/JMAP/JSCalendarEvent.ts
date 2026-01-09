import { Event, RecurrenceCase } from "../Event";
import type { TJMAPCalendarEvent } from "./TJSCalendar";
import { Frequency, RecurrenceRule, type RecurrenceInit } from "../RecurrenceRule";
import { InvitationResponse } from "../Invitation/InvitationStatus";
import { Participant } from "../Participant";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assert } from "../../util/util";

export class JSCalendarEvent {
  static toEvent(jmap: TJMAPCalendarEvent, event: Event) {
    // ID and metadata
    event.calUID = sanitize.nonemptystring(jmap.uid, null);
    event.lastUpdateTime = sanitize.date(jmap.updated, null);
    event.original = jmap;
    // TODO increment sequence on each save

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
    event.startTime = sanitize.date(jmap.start);
    event.endTime = getEndTimeFromDuration(event.startTime, sanitize.nonemptystring(jmap.duration));
    event.timezone = jmap.timeZone ?? null;
    event.allDay = sanitize.boolean(jmap.showWithoutTime, false);

    // Recurrence
    if (jmap.recurrenceRules?.length) {
      event.recurrenceCase = RecurrenceCase.Master;
      let r = jmap.recurrenceRules[0];
      let rrinit = {} as RecurrenceInit;
      rrinit.interval = r.interval;
      rrinit.frequency =
        r.frequency == "yearly" ? Frequency.Yearly :
          r.frequency == "monthly" ? Frequency.Monthly :
            r.frequency == "weekly" ? Frequency.Weekly :
              Frequency.Daily;
      // iCal and we don't support hourly, minutely or secondly. Esp. the latter is pretty silly
      rrinit.seriesStartTime = event.startTime;
      event.recurrenceRule = new RecurrenceRule(rrinit);
    }
    if (jmap.recurrenceId) {
      let start = sanitize.date(jmap.recurrenceId);
      event.recurrenceCase = RecurrenceCase.Exception;
      let masters = event.calendar?.events.filterOnce(ev => ev.recurrenceCase == RecurrenceCase.Master);
      let master = masters?.find(ev => ev.startTime == start || !!ev.exclusions.find(ex => ex == start));
      if (master) {
        if (jmap.excluded) {
          master.exclusions.add(start);
          throw new Error("Exclusion"); // TODO
        } else {
          master.exceptions.add(event);
        }
      }
    }

    // Location
    if (jmap.locations) {
      let location = Object.values(jmap.locations)[0];
      event.location = sanitize.string(location.name, "");
      if (event.location && location.description) {
        event.location += "\n";
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
