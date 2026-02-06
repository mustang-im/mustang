import { Event, RecurrenceCase } from "../Event";
import type { TJMAPCalendarEvent } from "./TJSCalendar";
import { Frequency, RecurrenceRule, type RecurrenceInit } from "../RecurrenceRule";
import { InvitationResponse } from "../Invitation/InvitationStatus";
import { Participant } from "../Participant";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { NotImplemented, assert } from "../../util/util";

export class JSCalendarEvent {
  static toEvent(jmap: TJMAPCalendarEvent, event: Event) {
    // ID and metadata
    event.calUID = sanitize.nonemptystring(jmap.uid, null);
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
              r.frequency == "daily" ? Frequency.Daily :
                Frequency.Yearly;
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
          // TODO Do not add this to the main calendar
          throw new NotImplemented("Recurring exclusion");
        } else {
          master.exceptions.add(event);
        }
      }
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
    jmap.uid = event.calUID;
    jmap.updated = event.lastUpdateTime?.toISOString();
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
    jmap.start = event.startTime.toISOString();
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
      jmap.recurrenceRules ??= [];
      let jr = jmap.recurrenceRules[0] ??= {
        frequency: "yearly",
      };
      let er = event.recurrenceRule;
      jr.interval = er.interval;
      if (er.frequency == Frequency.Yearly) {
        jr.frequency = "yearly";
      } else if (er.frequency == Frequency.Monthly) {
        jr.frequency = "monthly";
      } else if (er.frequency == Frequency.Weekly) {
        jr.frequency = "weekly";
      } else if (er.frequency == Frequency.Daily) {
        jr.frequency = "daily";
      } // else Unknown `Frequency` -> keep as-is
      for (let exclusion of event.exclusions) {
        // TODO one `Event` has to generate multiple `JSCalendarEvents`
        throw new NotImplemented("Recurring exclusion");
      }
      for (let exclusion of event.exceptions) {
        // TODO one `Event` has to generate multiple `JSCalendarEvents`
        throw new NotImplemented("Recurring exception"); // TODO
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
