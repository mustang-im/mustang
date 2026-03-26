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

  fromWBXML(wbxmljs: Record<string, any>) {
    if (wbxmljs.UID != undefined) {
      this.calUID = sanitize.nonemptystring(wbxmljs.UID, null);
    }
    if (wbxmljs.Subject != undefined) {
      this.title = sanitize.nonemptystring(wbxmljs.Subject, "");
    }
    if (wbxmljs.Body?.Type == "2") {
      this.rawHTMLDangerous = sanitize.nonemptystring(wbxmljs.Body.Data, "");
      this.rawText = null;
    } else if (wbxmljs.Body) {
      this.rawText = sanitize.nonemptystring(wbxmljs.Body.Data, "");
      this.rawHTMLDangerous = null;
    }
    if (wbxmljs.DtStamp) {
      this.lastUpdateTime = fromCompact(sanitize.nonemptystring(wbxmljs.DtStamp));
    }
    if (wbxmljs.ExceptionId) { // for ActiveSync 16.1
      this.recurrenceStartTime = fromCompact(wbxmljs.ExceptionId);
      // In case it's not otherwise provided to us.
      this.startTime = new Date(this.recurrenceStartTime);
    }
    if (wbxmljs.ExceptionStartTime) { // for ActiveSync 14.x
      this.recurrenceStartTime = fromCompact(sanitize.nonemptystring(wbxmljs.ExceptionStartTime));
      // In case it's not otherwise provided to us.
      this.startTime = new Date(this.recurrenceStartTime);
    }
    if (wbxmljs.AllDayEvent) {
      this.allDay = sanitize.boolean(wbxmljs.AllDayEvent, false);
    }
    if (wbxmljs.StartTime) {
      this.startTime = fromCompact(sanitize.nonemptystring(wbxmljs.StartTime), this.allDay && this.calendar.account.protocolVersion == "16.1");
    }
    if (wbxmljs.EndTime) {
      this.endTime = fromCompact(sanitize.nonemptystring(wbxmljs.EndTime), this.allDay && this.calendar.account.protocolVersion == "16.1");
    }
    if (wbxmljs.Timezone) { // Omitted in 16.1 for all day events
      this.timezone = fromActiveSyncZone(sanitize.nonemptystring(wbxmljs.Timezone, null));
    }
    if (wbxmljs.Recurrence) {
      this.recurrenceRule = this.newRecurrenceRuleFromWBXML(wbxmljs.Recurrence);
      for (let exception of ensureArray(wbxmljs.Exceptions?.Exception)) {
        if (exception.Deleted == "1") {
          this.makeExclusionLocally(fromCompact(sanitize.nonemptystring(exception.ExceptionId || exception.ExceptionStartTime)));
        }
      }
    } else {
      this.recurrenceRule = null;
    }
    this.alarm = wbxmljs.Reminder ? new Date(this.startTime.getTime() - k1MinuteMS * sanitize.integer(wbxmljs.Reminder)) : null;
    if (wbxmljs.EnhancedLocation != undefined) {
      this.location = sanitize.nonemptystring(wbxmljs.EnhancedLocation.DisplayName, "");
    }
    if (wbxmljs.Location != undefined) {
      this.location = sanitize.nonemptystring(wbxmljs.Location, "");
    }
    if (wbxmljs.MeetingStatus) {
      this.isCancelled = (sanitize.integer(wbxmljs.MeetingStatus, 0) & 4) !== 0;
    }
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
    if (wbxmljs.ResponseType) {
      this.myParticipation = sanitize.integer(wbxmljs.ResponseType, InvitationResponse.Unknown);
    }
  }

  protected newRecurrenceRuleFromWBXML(wbxmljs: any): RecurrenceRule {
    let masterDuration = this.duration;
    let seriesStartTime = this.startTime;
    let seriesEndTime = wbxmljs.Until ? fromCompact(sanitize.nonemptystring(wbxmljs.Until), this.allDay && this.calendar.account.protocolVersion == "16.1") : null;
    let count = sanitize.integer(wbxmljs.Occurrences, Infinity);
    let frequency = kRecurrenceTypes[sanitize.integer(wbxmljs.Type, 0)];
    let interval = sanitize.integer(wbxmljs.Interval, 1);
    let weekdays = extractWeekdays(sanitize.integer(wbxmljs.DayOfWeek, 0));
    let week = sanitize.integer(wbxmljs.WeekOfMonth, 0);
    let first = sanitize.integer(wbxmljs.FirstDayOfWeek, Weekday.Monday);
    return new RecurrenceRule({ masterDuration, seriesStartTime, seriesEndTime, count, frequency, interval, weekdays, week, first });
  }

  toFields(exceptions: { Exception: any } | { Exception: any }[] = []): any {
    let version16_1 = this.calendar.account.protocolVersion == "16.1";
    return {
      // First the fields only in code page 4.
      ExceptionStartTime: this.recurrenceStartTime && !version16_1 ? toCompact(this.recurrenceStartTime) : [],
      Exceptions: exceptions,
      Timezone: version16_1 && this.allDay ? [] : this.recurrenceStartTime ? [] : getTimeZoneActiveSync(this.timezone),
      Attendees: (!this.recurrenceStartTime || this.participants.hasItems) ? {
        Attendee: this.participants.contents.map(entry => ({ Email: entry.emailAddress, Name: entry.name, AttendeeType: kRequiredAttendee })),
      } : version16_1 ? {} : [],
      // Now the fields that exist in either code page 2 or 4.
      // Since the above fields were in code page 4, we should keep that page.
      // Attendee is guaranteed in ActiveSync 16.1 and Timezone is in 14.x.
      AllDayEvent: this.allDay ? "1" : "0",
      EndTime: toCompact(this.endTime, version16_1 && this.allDay),
      Location: version16_1 ? [] : this.location || {}, // Allows exception to have no location
      Reminder: this.alarm ? String((this.alarm.getTime() - this.startTime.getTime()) / -k1MinuteMS | 0) : version16_1 ? {} : [],
      StartTime: toCompact(this.startTime, version16_1 && this.allDay),
      UID: !version16_1 && !this.parentEvent && this.calUID || [],
      Recurrence: this.recurrenceRule ? {
        Type: String(kRecurrenceTypes.indexOf(this.recurrenceRule.frequency) + +!!this.recurrenceRule.week),
        Occurrences: this.recurrenceRule.count < Infinity ? String(this.recurrenceRule.count) : [],
        Interval: String(this.recurrenceRule.interval),
        WeekOfMonth: this.recurrenceRule.week ? String(this.recurrenceRule.week) : [],
        DayOfWeek: this.recurrenceRule.weekdays ? String(this.recurrenceRule.weekdays.reduce((bitmask, day) => bitmask | 1 << day, 0)) : this.recurrenceRule.week ? String(1 << this.recurrenceRule.seriesStartTime.getDay()) : [],
        MonthOfYear: this.recurrenceRule.frequency == Frequency.Yearly ? String(this.recurrenceRule.seriesStartTime.getMonth() + 1) : [],
        Until: toCompact(this.recurrenceRule.seriesEndTime, version16_1 && this.allDay) || [],
        DayOfMonth: [Frequency.Monthly, Frequency.Yearly].includes(this.recurrenceRule.frequency) && !this.recurrenceRule.week ? String(this.recurrenceRule.seriesStartTime.getDate()) : [],
        FirstDayOfWeek: this.calendar.account.protocolVersion == "14.0" ? [] : this.recurrenceRule.frequency == Frequency.Weekly ? String(this.recurrenceRule.first) : [],
      } : version16_1 ? {} : [],
      Subject: this.title,
      // These fields are in code page 17.
      Body: this.rawHTMLDangerous ? { Type: "2", Data: this.rawHTMLDangerous } : { Type: "1", Data: [this.descriptionText ?? ""] },
      EnhancedLocation: version16_1 ? { DisplayName: this.location || [] } : [],
    };
  }

  get outgoingInvitation() {
    return new ActiveSyncOutgoingInvitation(this);
  }

  async saveToServer(): Promise<void> {
    await this.prepareSaveToServer();

    // Not supporting tasks for now.
    if (this.parentEvent && this.calendar.account.protocolVersion != "16.1") {
      await this.parentEvent.saveFields(this.parentEvent.toFields({ Exception: this.toFields() }));
    } else {
      await this.saveFields(this.toFields());
      if (!this.calUID) {
        let event = await this.fetchFromServer();
        this.calUID = sanitize.nonemptystring(event.calUID);
      }
    }
    // ActiveSync 16.1 automatically sends invitations.
    if (this.calendar.account.protocolVersion != "16.1") {
      await this.sendInvitationsDirectly();
    }
  }

  async saveFields(fields: any): Promise<void> {
    let data = this.serverID ? {
      GetChanges: "0",
      Commands: {
        Change: {
          ServerId: this.serverID,
          ExceptionId: this.parentEvent ? toCompact(this.recurrenceStartTime, this.allDay) : [],
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
        this.serverID = sanitize.nonemptystring(response.Responses.Add.ServerId);
        if (response.Responses.Add.ApplicationData?.UID) {
          // ActiveSync 16.1 requires us to use the server's UID
          this.calUID = response.Responses.Add.ApplicationData.UID;
        }
        await this.saveLocally();
      }
    }
  }

  async deleteFromServer(): Promise<void> {
    if (this.parentEvent && this.calendar.account.protocolVersion != "16.1") {
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
            ServerId: this.parentEvent ? this.parentEvent.serverID : this.serverID,
            ExceptionId: this.parentEvent ? toCompact(this.recurrenceStartTime, this.allDay) : [],
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
    let exceptionField = this.calendar.account.protocolVersion == "16.1" ? "ExceptionId" : "ExceptionStartTime";
    await this.saveFields(this.toFields(exclusions.map(event => ({
      Exception: {
        Deleted: "1",
        [exceptionField]: toCompact(event.recurrenceStartTime, this.calendar.account.protocolVersion == "16.1" && this.allDay),
      },
    }))));
  }

  async respondToInvitation(response: InvitationResponseInMessage): Promise<void> {
    assert(this.isIncomingMeeting, "Only invitations can be responded to");
    let SendResponse = this.calendar.account.protocolVersion == "16.1" ? {} : [];
    let request = {
      // TODO support ActiveSync 14.0
      Request: this.serverID ? {
        UserResponse: ActiveSyncResponse[response],
        CollectionId: this.calendar.serverID,
        RequestId: this.serverID,
        SendResponse,
      } : {
        UserResponse: ActiveSyncResponse[response],
        CollectionId: this.calendar.serverID,
        RequestId: this.parentEvent.serverID,
        InstanceId: this.recurrenceStartTime.toISOString(),
        SendResponse,
      },
    };
    await this.calendar.account.callEAS("MeetingResponse", request);
    // We asked ActiveSync 16.1 to send the response for us.
    if (this.calendar.account.protocolVersion != "16.1") {
      await super.respondToInvitation(response, this.calendar.account);
    }
    await this.calendar.listEvents(); // Sync whatever Exchange decides to do
  }
}

function extractWeekdays(daysOfWeek: number): Weekday[] | null {
  return daysOfWeek ? [0, 1, 2, 3, 4, 5, 6].filter(day => daysOfWeek & 1 << day) : null;
}

/// Returns the compact date time of a date
function toCompact(date?: Date, v16AllDay?: boolean): string | null {
  if (date && v16AllDay) {
    return date.getFullYear() + String(date.getMonth() + 1).padStart(2, "0") + String(date.getDate()).padStart(2, "0") + "T000000Z";
  }
  return date && date.toISOString().replace(/-|:|\..../g, "");
}

export function fromCompact(date: string, v16AllDay?: boolean): Date {
  // In ActiveSync 14.1, all-day events are sent with a time zone,
  // and the start and end times are midnight in that zone,
  // but they are then converted to UTC.
  // In ActiveSync 16.1, all-day events are not sent with a time zone.
  // Start and end times are sent as if they were midnight in UTC.
  // We want them to show up as the user's local midnight.
  if (v16AllDay) {
    date = date.replace(/Z/, "");
  }
  // In case the string isn't in compact format, compactify it first.
  return new Date(date.replace(/-|:|\..../g, "").replace(/(..)(..T..)(..)/, "-$1-$2:$3:"));
}

function getTimeZoneActiveSync(timezone: string | null): string {
  timezone ||= Intl.DateTimeFormat().resolvedOptions().timeZone;
  timezone = IANAToWindowsTimezone[timezone] || "UTC";
  let unicode = new Uint16Array(86);
  let pos = 2;
  for (let c of timezone) {
    unicode[pos++] = c.charCodeAt(0);
  }
  return btoa(String.fromCharCode(...new Uint8Array(unicode.buffer)));
}

function fromActiveSyncZone(zone: string | null): string | null {
  if (!zone) {
    return null;
  }
  let buffer = Uint8Array.from(atob(zone), c => c.charCodeAt(0)).buffer;
  zone = String.fromCharCode(...new Uint16Array(buffer, 4, 32)).replace(/\0+$/, "") || String.fromCharCode(...new Uint16Array(buffer, 88, 32)).replace(/\0+$/, "");
  return zone in IANAToWindowsTimezone ? zone : WindowsToIANATimezone[zone] ?? null;
}
