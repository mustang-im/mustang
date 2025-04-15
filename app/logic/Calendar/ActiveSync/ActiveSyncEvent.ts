import { Event, RecurrenceCase } from "../Event";
import { Participant } from "../Participant";
import { ResponseType, type Responses } from "../Invitation";
import { Frequency, Weekday, RecurrenceRule } from "../RecurrenceRule";
import IANAToWindowsTimezone from "../ICal/IANAToWindowsTimezone";
import WindowsToIANATimezone from "../ICal/WindowsToIANATimezone";
import type { ActiveSyncCalendar } from "./ActiveSyncCalendar";
import { ActiveSyncError } from "../../Mail/ActiveSync/ActiveSyncError";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assert, ensureArray } from "../../util/util";
import type { ArrayColl } from "svelte-collections";

const kRequiredAttendee = "1";
const kRecurrenceTypes = [Frequency.Daily, Frequency.Weekly, Frequency.Monthly, Frequency.Monthly, /* don't know why Microsoft left this one out */, Frequency.Yearly, Frequency.Yearly];

const ActiveSyncResponse: Record<Responses, number> = {
  [ResponseType.Accept]: 1,
  [ResponseType.Tentative]: 2,
  [ResponseType.Decline]: 3,
};

export class ActiveSyncEvent extends Event {
  calendar: ActiveSyncCalendar;
  parentEvent: ActiveSyncEvent;
  readonly instances: ArrayColl<ActiveSyncEvent | null | undefined>;

  get serverID(): string | null {
    return this.pID;
  }
  set serverID(val: string | null) {
    this.pID = val;
  }

  fromWBXML(wbxmljs) {
    this.calUID = sanitize.nonemptystring(wbxmljs.UID, null);
    this.title = sanitize.nonemptystring(wbxmljs.Subject, "");
    if (wbxmljs.Body?.Type == "2") {
      this.descriptionHTML = sanitize.nonemptystring(wbxmljs.Body.Data, "");
    } else {
      this.descriptionText = sanitize.nonemptystring(wbxmljs.Body?.Data, "");
    }
    if (wbxmljs.ExceptionStartTime) {
      this.recurrenceStartTime = fromCompact(wbxmljs.ExceptionStartTime);
      // In case it's not otherwise provided to us.
      this.startTime = new Date(this.recurrenceStartTime);
    }
    if (wbxmljs.StartTime) {
      this.startTime = fromCompact(wbxmljs.StartTime);
    }
    if (wbxmljs.EndTime) {
      this.endTime = fromCompact(wbxmljs.EndTime);
    }
    this.timezone = fromActiveSyncZone(wbxmljs.Timezone);
    this.allDay = sanitize.boolean(wbxmljs.AllDayEvent, false);
    if (wbxmljs.Recurrence) {
      this.recurrenceCase = RecurrenceCase.Master;
      this.recurrenceRule = this.newRecurrenceRule(wbxmljs.Recurrence);
      for (let exception of ensureArray(wbxmljs.Exceptions?.Exception)) {
        if (exception.Deleted == "1") {
          let occurrences = this.recurrenceRule.getOccurrencesByDate(fromCompact(exception.ExceptionStartTime));
          this.replaceInstance(occurrences.length - 1, null);
        }
      }
    }
    this.alarm = wbxmljs.Reminder ? new Date(this.startTime.getTime() - 60 * sanitize.integer(wbxmljs.Reminder)) : null;
    this.location = sanitize.nonemptystring(wbxmljs.Location, "");
    this.participants.replaceAll(ensureArray(wbxmljs.Attendees?.Attendee).map(attendee => new Participant(sanitize.emailAddress(attendee.Email), sanitize.nonemptystring(attendee.Name, null), sanitize.integer(attendee.AttendeeStatus, ResponseType.Unknown))));
    this.response = sanitize.integer(wbxmljs.ResponseType, ResponseType.Unknown);
  }

  newRecurrenceRule(wbxmljs: any): RecurrenceRule {
    let startDate = this.startTime;
    let endDate = wbxmljs.Until ? fromCompact(wbxmljs.Until) : null;
    let count = sanitize.integer(wbxmljs.Occurrences, Infinity);
    let frequency = kRecurrenceTypes[wbxmljs.Type];
    let interval = sanitize.integer(wbxmljs.Interval, 1);
    let weekdays = extractWeekdays(wbxmljs.DayOfWeek);
    let week = sanitize.integer(wbxmljs.DayOfWeek, 0);
    let first = sanitize.integer(wbxmljs.FirstDayOfWeek, Weekday.Monday);
    return new RecurrenceRule({ startDate, endDate, count, frequency, interval, weekdays, week, first });
  }

  toFields(exception?: any) {
    return {
      ExceptionStartTime: toCompact(this.recurrenceStartTime) || [],
      Timezone: this.recurrenceStartTime ? [] : getTimeZoneActiveSync(),
      AllDayEvent: this.allDay ? "1" : "0",
      Attendees: (!this.recurrenceStartTime || this.participants.hasItems) ? {
        Attendee: this.participants.contents.map(entry => ({ Email: entry.emailAddress, Name: entry.name, AttendeeType: kRequiredAttendee })),
      } : [],
      EndTime: toCompact(this.endTime),
      Location: this.location || {}, // Allows exception to have no location
      Reminder: this.alarm ? ((this.alarm.getTime() - this.startTime.getTime()) / -60 | 0) : [],
      StartTime: toCompact(this.startTime),
      UID: !this.parentEvent && this.calUID || [],
      Recurrence: this.recurrenceRule ? {
        Type: String(kRecurrenceTypes.indexOf(this.recurrenceRule.frequency) + +!!this.recurrenceRule.week),
        Occurrences: this.recurrenceRule.count < Infinity ? String(this.recurrenceRule.count) : [],
        Interval: String(this.recurrenceRule.interval),
        WeekOfMonth: this.recurrenceRule.week ? String(this.recurrenceRule.week) : [],
        DayOfWeek: this.recurrenceRule.weekdays ? String(this.recurrenceRule.weekdays.reduce((bitmask, day) => bitmask | 1 << day, 0)) : this.recurrenceRule.week ? String(1 << this.recurrenceRule.startDate.getDay()) : [],
        MonthOfYear: this.recurrenceRule.frequency == Frequency.Yearly ? String(this.recurrenceRule.startDate.getMonth() + 1) : [],
        Until: toCompact(this.recurrenceRule.endDate) || [],
        DayOfMonth: [Frequency.Monthly, Frequency.Yearly].includes(this.recurrenceRule.frequency) && !this.recurrenceRule.week ? String(this.recurrenceRule.startDate.getDate()) : [],
        FirstDayOfWeek: this.recurrenceRule.frequency == Frequency.Weekly ? String(this.recurrenceRule.first) : [],
      } : [],
      Subject: this.title,
      Body: this.descriptionHTML ? { Type: "2", Data: this.descriptionHTML } : { Type: "1", Data: [this.descriptionText || ""] },
      Exceptions: exception ? { Exception: exception } : [],
    };
  }

  async saveToServer(): Promise<void> {
    // Not supporting tasks for now.
    if (this.parentEvent) {
      this.parentEvent.saveFields(this.parentEvent.toFields(this.toFields()));
    } else {
      await this.saveFields(this.toFields());
    }
  }

  async saveFields(fields: any): Promise<void> {
    let data = this.serverID ? {
      GetChanges: "0",
      Commands: {
        Change: {
          ServerId: this.serverID,
          ApplicationData: fields,
        },
      },
    } : {
      GetChanges: "0",
      Commands: {
        Add: {
          ClientId: await this.calendar.account.nextClientID(),
          ApplicationData: fields,
        },
      },
    };
    let response = await this.calendar.makeSyncRequest(data);
    if (response.Responses) {
      if (response.Responses.Change) {
        throw new ActiveSyncError("Sync", response.Responses.Change.Status, this.calendar);
      }
      if (response.Responses.Add) {
        if (response.Responses.Add.Status != "1") {
          throw new ActiveSyncError("Sync", response.Responses.Add.Status, this.calendar);
        }
        this.serverID = response.Responses.Add.ServerId;
      }
    }
  }

  async deleteFromServer(): Promise<void> {
    if (this.parentEvent) {
      await this.parentEvent.saveFields(this.parentEvent.toFields({
        Deleted: "1",
        ExceptionStartTime: toCompact(this.recurrenceStartTime),
      }));
    } else {
      let data = {
        DeletesAsMoves: "1",
        GetChanges: "0",
        Commands: {
          Delete: {
            ServerId: this.serverID,
          },
        },
      };
      let response = await this.calendar.makeSyncRequest(data);
      if (response.Responses) {
        throw new ActiveSyncError("Sync", response.Responses.Delete.Status, this.calendar);
      }
    }
  }

  async respondToInvitation(response: Responses): Promise<void> {
    assert(this.response > ResponseType.Organizer, "Only invitations can be responded to");
    let request = {
      Request: {
        UserResponse: ActiveSyncResponse[response],
        CollectionId: this.calendar.serverID,
        ReqeustId: this.serverID,
      },
    };
    await this.calendar.account.callEAS("MeetingResponse", request);
    await this.calendar.account.sendInvitationResponse(this, response); // needs 16.x to do this automatically
  }
}

function extractWeekdays(dayOfWeek: string): Weekday[] | null {
  let daysOfWeek = sanitize.integer(dayOfWeek, 0);
  return daysOfWeek ? [0, 1, 2, 3, 4, 5, 6].filter(day => daysOfWeek & 1 << day) : null;
}

/// Returns the compact date time of a date
function toCompact(date?: Date): string | null {
  return date && date.toISOString().replace(/-|:|\..../g, "");
}

export function fromCompact(date: string): Date {
  // In case the string isn't in compact format, compactify it first.
  return new Date(date.replace(/-|:|\..../g, "").replace(/(..)(..T..)(..)/, "-$1-$2:$3:"));
}

let gTimeZone: string = "";
function getTimeZoneActiveSync(): string {
  if (!gTimeZone) {
    let timezone = IANAToWindowsTimezone[Intl.DateTimeFormat().resolvedOptions().timeZone] || "UTC";
    let unicode = new Uint16Array(86);
    let pos = 2;
    for (let c of timezone) {
      unicode[pos++] = c.charCodeAt();
    }
    gTimeZone = btoa(String.fromCharCode(...new Uint8Array(unicode.buffer)));
  }
  return gTimeZone;
}

function fromActiveSyncZone(zone): string | null {
  if (!zone) {
    return null;
  }
  let buffer = Uint8Array.from(atob(zone), c => c.charCodeAt(0)).buffer;
  zone = String.fromCharCode(...new Uint16Array(buffer, 4, 32)).replace(/\0+$/, "") || String.fromCharCode(...new Uint16Array(buffer, 88, 32)).replace(/\0+$/, "");
  return zone in IANAToWindowsTimezone ? zone : WindowsToIANATimezone[zone] ?? null;
}
