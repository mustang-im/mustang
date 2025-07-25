import { Event } from "../Event";
import { Participant } from "../Participant";
import { InvitationResponse, type InvitationResponseInMessage } from "../Invitation/InvitationStatus";
import { Frequency, Weekday, RecurrenceRule } from "../RecurrenceRule";
import { IANAToWindowsTimezone, WindowsToIANATimezone } from "../ICal/WindowsTimezone";
import type { ActiveSyncCalendar } from "./ActiveSyncCalendar";
import { ActiveSyncOutgoingInvitation } from "./ActiveSyncOutgoingInvitation";
import { ActiveSyncError } from "../../Mail/ActiveSync/ActiveSyncError";
import { k1MinuteMS } from "../../../frontend/Util/date";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assert, ensureArray } from "../../util/util";
import type { ArrayColl } from "svelte-collections";

const kRequiredAttendee = "1";
const kRecurrenceTypes = [Frequency.Daily, Frequency.Weekly, Frequency.Monthly, Frequency.Monthly, /* don't know why Microsoft left this one out */, Frequency.Yearly, Frequency.Yearly];

const ActiveSyncResponse: Record<InvitationResponseInMessage, number> = {
  [InvitationResponse.Accept]: 1,
  [InvitationResponse.Tentative]: 2,
  [InvitationResponse.Decline]: 3,
};

export class ActiveSyncEvent extends Event {
  declare calendar: ActiveSyncCalendar;
  declare parentEvent: ActiveSyncEvent;
  declare readonly exceptions: ArrayColl<ActiveSyncEvent>;

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
      this.rawHTMLDangerous = sanitize.nonemptystring(wbxmljs.Body.Data, "");
      this.rawText = null;
    } else {
      this.rawText = sanitize.nonemptystring(wbxmljs.Body?.Data, "");
      this.rawHTMLDangerous = null;
    }
    if (wbxmljs.DtStamp) {
      this.lastUpdateTime = fromCompact(wbxmljs.DtStamp);
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
      this.recurrenceRule = this.newRecurrenceRuleFromWBXML(wbxmljs.Recurrence);
      for (let exception of ensureArray(wbxmljs.Exceptions?.Exception)) {
        if (exception.Deleted == "1") {
          this.makeExclusionLocally(fromCompact(exception.ExceptionStartTime));
        }
      }
    } else {
      this.recurrenceRule = null;
    }
    this.alarm = wbxmljs.Reminder ? new Date(this.startTime.getTime() - k1MinuteMS * sanitize.integer(wbxmljs.Reminder)) : null;
    this.location = sanitize.nonemptystring(wbxmljs.Location, "");
    this.isCancelled = (sanitize.integer(wbxmljs.MeetingStatus, 0) & 4) !== 0;
    let attendees = ensureArray(wbxmljs.Attendees?.Attendee);
    if (wbxmljs.OrganizerEmail && attendees.length) {
      for (let attendee of attendees) {
        attendee.Email = sanitize.emailAddress(attendee.Email);
      }
      let organizerEmail = sanitize.emailAddress(wbxmljs.OrganizerEmail);
      let organizer = attendees.find(attendee => attendee.Email == organizerEmail);
      if (organizer) {
        organizer.AttendeeStatus = InvitationResponse.Organizer;
      } else {
        attendees.unshift({
          Email: organizerEmail,
          Name: sanitize.label(wbxmljs.OrganizerName),
          AttendeeStatus: InvitationResponse.Organizer,
        });
      }
    }
    this.participants.replaceAll(attendees.map(attendee => new Participant(attendee.Email, sanitize.nonemptystring(attendee.Name, null), sanitize.integer(attendee.AttendeeStatus, InvitationResponse.Unknown))));
    this.myParticipation = sanitize.integer(wbxmljs.ResponseType, InvitationResponse.Unknown);
  }

  protected newRecurrenceRuleFromWBXML(wbxmljs: any): RecurrenceRule {
    let masterDuration = this.duration;
    let seriesStartTime = this.startTime;
    let seriesEndTime = wbxmljs.Until ? fromCompact(wbxmljs.Until) : null;
    let count = sanitize.integer(wbxmljs.Occurrences, Infinity);
    let frequency = kRecurrenceTypes[wbxmljs.Type];
    let interval = sanitize.integer(wbxmljs.Interval, 1);
    let weekdays = extractWeekdays(wbxmljs.DayOfWeek);
    let week = sanitize.integer(wbxmljs.WeekOfMonth, 0);
    let first = sanitize.integer(wbxmljs.FirstDayOfWeek, Weekday.Monday);
    return new RecurrenceRule({ masterDuration, seriesStartTime, seriesEndTime, count, frequency, interval, weekdays, week, first });
  }

  toFields(exceptions: { Exception: any } | { Exception: any }[] = []) {
    return {
      ExceptionStartTime: toCompact(this.recurrenceStartTime) || [],
      Timezone: this.recurrenceStartTime ? [] : getTimeZoneActiveSync(this.timezone),
      AllDayEvent: this.allDay ? "1" : "0",
      Attendees: (!this.recurrenceStartTime || this.participants.hasItems) ? {
        Attendee: this.participants.contents.map(entry => ({ Email: entry.emailAddress, Name: entry.name, AttendeeType: kRequiredAttendee })),
      } : [],
      EndTime: toCompact(this.endTime),
      Location: this.location || {}, // Allows exception to have no location
      Reminder: this.alarm ? String((this.alarm.getTime() - this.startTime.getTime()) / -k1MinuteMS | 0) : [],
      StartTime: toCompact(this.startTime),
      UID: !this.parentEvent && this.calUID || [],
      Recurrence: this.recurrenceRule ? {
        Type: String(kRecurrenceTypes.indexOf(this.recurrenceRule.frequency) + +!!this.recurrenceRule.week),
        Occurrences: this.recurrenceRule.count < Infinity ? String(this.recurrenceRule.count) : [],
        Interval: String(this.recurrenceRule.interval),
        WeekOfMonth: this.recurrenceRule.week ? String(this.recurrenceRule.week) : [],
        DayOfWeek: this.recurrenceRule.weekdays ? String(this.recurrenceRule.weekdays.reduce((bitmask, day) => bitmask | 1 << day, 0)) : this.recurrenceRule.week ? String(1 << this.recurrenceRule.seriesStartTime.getDay()) : [],
        MonthOfYear: this.recurrenceRule.frequency == Frequency.Yearly ? String(this.recurrenceRule.seriesStartTime.getMonth() + 1) : [],
        Until: toCompact(this.recurrenceRule.seriesEndTime) || [],
        DayOfMonth: [Frequency.Monthly, Frequency.Yearly].includes(this.recurrenceRule.frequency) && !this.recurrenceRule.week ? String(this.recurrenceRule.seriesStartTime.getDate()) : [],
        FirstDayOfWeek: this.calendar.account.protocolVersion == "14.0" ? [] : this.recurrenceRule.frequency == Frequency.Weekly ? String(this.recurrenceRule.first) : [],
      } : [],
      Subject: this.title,
      Body: this.rawHTMLDangerous ? { Type: "2", Data: this.rawHTMLDangerous } : { Type: "1", Data: [this.descriptionText ?? ""] },
      Exceptions: exceptions,
    };
  }

  get outgoingInvitation() {
    return new ActiveSyncOutgoingInvitation(this);
  }

  async saveToServer(): Promise<void> {
    // Not supporting tasks for now.
    if (this.parentEvent) {
      this.parentEvent.saveFields(this.parentEvent.toFields({ Exception: this.toFields() }));
    } else {
      await this.saveFields(this.toFields());
      if (!this.calUID) {
        let event = await this.fetchFromServer();
        this.calUID = event.calUID;
      }
    }
    await super.saveToServer();
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
        Exception: {
          Deleted: "1",
          ExceptionStartTime: toCompact(this.recurrenceStartTime),
        }
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
    await super.deleteFromServer();
  }

  /** Returns a copy of the event as read from the server */
  async fetchFromServer(): Promise<ActiveSyncEvent> {
    assert(this.serverID, "can't query unsaved event");
    let request = {
      Fetch: {
        Store: "Mailbox",
        ServerId: this.serverID,
        CollectionId: this.calendar.serverID,
        Options: {
          BodyPreference: {
            Type: "2",
          },
        },
      },
    };
    let result = await this.calendar.account.callEAS("ItemOperations", request);
    if (result.Response.Fetch.Status != "1") {
      throw new ActiveSyncError("ItemOperations", result.Response.Fetch.Status, this.calendar.account);
    }
    let event = this.calendar.newEvent(this.parentEvent);
    event.fromWBXML(result.Response.Fetch.Properties);
    return event;
  }

  async makeExclusions(exclusions: ActiveSyncEvent[]) {
    await this.saveFields(this.toFields(exclusions.map(event => ({
      Exception: {
        Deleted: "1",
        ExceptionStartTime: toCompact(event.recurrenceStartTime),
      },
    }))));
  }

  async respondToInvitation(response: InvitationResponseInMessage): Promise<void> {
    assert(this.isIncomingMeeting, "Only invitations can be responded to");
    let request = {
      // TODO support ActiveSync 14.0
      Request: this.serverID ? {
        UserResponse: ActiveSyncResponse[response],
        CollectionId: this.calendar.serverID,
        RequestId: this.serverID,
      } : {
        UserResponse: ActiveSyncResponse[response],
        CollectionId: this.calendar.serverID,
        RequestId: this.parentEvent.serverID,
        InstanceId: this.recurrenceStartTime.toISOString(),
      },
    };
    await this.calendar.account.callEAS("MeetingResponse", request);
    await super.respondToInvitation(response, this.calendar.account); // needs 16.x to do this automatically
    await this.calendar.listEvents(); // Sync whatever Exchange decides to do
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

function getTimeZoneActiveSync(timezone): string {
  timezone ||= Intl.DateTimeFormat().resolvedOptions().timeZone;
  timezone = IANAToWindowsTimezone[timezone] || "UTC";
  let unicode = new Uint16Array(86);
  let pos = 2;
  for (let c of timezone) {
    unicode[pos++] = c.charCodeAt();
  }
  return btoa(String.fromCharCode(...new Uint8Array(unicode.buffer)));
}

function fromActiveSyncZone(zone): string | null {
  if (!zone) {
    return null;
  }
  let buffer = Uint8Array.from(atob(zone), c => c.charCodeAt(0)).buffer;
  zone = String.fromCharCode(...new Uint16Array(buffer, 4, 32)).replace(/\0+$/, "") || String.fromCharCode(...new Uint16Array(buffer, 88, 32)).replace(/\0+$/, "");
  return zone in IANAToWindowsTimezone ? zone : WindowsToIANATimezone[zone] ?? null;
}
