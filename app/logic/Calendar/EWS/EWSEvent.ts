import { Event, RecurrenceCase } from "../Event";
import { Participant } from "../Participant";
import { InvitationResponse, type InvitationResponseInMessage } from "../Invitation/InvitationStatus";
import { Frequency, Weekday, RecurrenceRule } from "../RecurrenceRule";
import IANAToWindowsTimezone from "../ICal/IANAToWindowsTimezone";
import WindowsToIANATimezone from "../ICal/WindowsToIANATimezone";
import type { EWSCalendar } from "./EWSCalendar";
import EWSOutgoingInvitation from "./EWSOutgoingInvitation";
import EWSCreateItemRequest from "../../Mail/EWS/Request/EWSCreateItemRequest";
import EWSDeleteItemRequest from "../../Mail/EWS/Request/EWSDeleteItemRequest";
import EWSUpdateItemRequest from "../../Mail/EWS/Request/EWSUpdateItemRequest";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assert, ensureArray, NotReached } from "../../util/util";
import type { ArrayColl } from "svelte-collections";

const ResponseTypes: Record<InvitationResponseInMessage, string> = {
  [InvitationResponse.Accept]: "AcceptItem",
  [InvitationResponse.Tentative]: "TentativelyAcceptItem",
  [InvitationResponse.Decline]: "DeclineItem",
};

enum WeekOfMonth {
  'First' = 1,
  'Second' = 2,
  'Third' = 3,
  'Fourth'= 4,
  'Last' = 5,
};

const RecurrenceType = {
  RelativeYearlyRecurrence: Frequency.Yearly,
  AbsoluteYearlyRecurrence: Frequency.Yearly,
  RelativeMonthlyRecurrence: Frequency.Monthly,
  AbsoluteMonthlyRecurrence: Frequency.Monthly,
  WeeklyRecurrence: Frequency.Weekly,
  DailyRecurrence: Frequency.Daily,
};

export class EWSEvent extends Event {
  calendar: EWSCalendar;
  parentEvent: EWSEvent;
  readonly instances: ArrayColl<EWSEvent | null | undefined>;

  get itemID(): string | null {
    return this.pID;
  }
  set itemID(val: string | null) {
    this.pID = val;
  }

  fromXML(xmljs) {
    this.itemID = sanitize.nonemptystring(xmljs.ItemId.Id);
    this.calUID = sanitize.nonemptystring(xmljs.UID, null);
    this.title = sanitize.nonemptystring(xmljs.Subject, "");
    if (xmljs.Body?.BodyType == "Text") {
      this.descriptionText = sanitize.nonemptystring(xmljs.Body.Value, "");
    } else {
      this.descriptionText = sanitize.nonemptystring(xmljs.TextBody?.Value, "");
      if (xmljs.Body?.BodyType == "HTML") {
        this.descriptionHTML = sanitize.nonemptystring(xmljs.Body.Value, "");
      }
    }
    if (xmljs.RecurrenceId) {
      this.recurrenceStartTime = sanitize.date(xmljs.RecurrenceId);
      // In case it's not otherwise provided to us.
      this.startTime = new Date(this.recurrenceStartTime);
    }
    if (xmljs.Start) {
      this.startTime = sanitize.date(xmljs.Start);
    }
    if (xmljs.End) {
      this.endTime = sanitize.date(xmljs.End);
    }
    if (xmljs.DueDate) {
      this.endTime = sanitize.date(xmljs.DueDate);
    }
    this.timezone = fromWindowsZone(xmljs.StartTimeZoneId);
    this.allDay = sanitize.boolean(xmljs.IsAllDayEvent, false);
    if (xmljs.Recurrence) {
      this.recurrenceCase = RecurrenceCase.Master;
      this.recurrenceRule = this.newRecurrenceRule(xmljs.Recurrence);
      if (xmljs.DeletedOccurrences?.DeletedOccurrence) {
        for (let deletion of ensureArray(xmljs.DeletedOccurrences.DeletedOccurrence)) {
          let occurrences = this.recurrenceRule.getOccurrencesByDate(sanitize.date(deletion.Start));
          this.replaceInstance(occurrences.length - 1, null);
        }
      }
    } else if (this.recurrenceRule) {
      this.recurrenceCase = RecurrenceCase.Normal;
      this.recurrenceRule = null;
      this.clearExceptions();
    }
    if (xmljs.ReminderIsSet == "true") {
      this.alarm = new Date(this.startTime.getTime() - 60 * sanitize.integer(xmljs.ReminderMinutesBeforeStart));
    } else {
      this.alarm = null;
    }
    this.location = sanitize.nonemptystring(xmljs.Location, "");
    let participants: Participant[] = [];
    if (xmljs.RequiredAttendees?.Attendee) {
      addParticipants(xmljs.RequiredAttendees.Attendee, participants);
    }
    if (xmljs.OptionalAttendees?.Attendee) {
      addParticipants(xmljs.OptionalAttendees.Attendee, participants);
    }
    this.participants.replaceAll(participants);
    if (xmljs.MyResponseType) {
      this.myParticipation = sanitize.integer(InvitationResponse[xmljs.MyResponseType], InvitationResponse.Unknown);
    }
    if (xmljs.LastModifiedTime) {
      this.lastMod = sanitize.date(xmljs.LastModifiedTime);
    }
  }

  newRecurrenceRule(xmljs: any): RecurrenceRule {
    let startDate = this.startTime;
    let endDate: Date | null = null;
    if (xmljs.EndDateRecurrence) {
      // These dates don't have a time, but they do have a time zone suffixed.
      if (!startDate) {
        this.startTime = startDate = sanitize.date(xmljs.EndDateRecurrence.StartDate.slice(0, 10));
      }
      endDate = sanitize.date(xmljs.EndDateRecurrence.EndDate.slice(0, 10));
      // RecurrenceRule wants this to be at least the same time as the endTime
      endDate.setDate(endDate.getDate() + 1);
      endDate.setTime(endDate.getTime() - 1000);
    }
    let count = sanitize.integer(xmljs.NumberedRecurrence?.NumberOfOccurrences, Infinity);
    let key = Object.keys(RecurrenceType).find(key => key in xmljs);
    let pattern = xmljs[key];
    let frequency = RecurrenceType[key];
    let interval = sanitize.integer(pattern.Interval, 1);
    let weekdays = extractWeekdays(pattern.DaysOfWeek);
    let week = sanitize.integer(WeekOfMonth[pattern.DayOfWeekIndex], 0);
    let first = sanitize.integer(Weekday[pattern.FirstDayOfWeek], Weekday.Monday);
    return new RecurrenceRule({ startDate, endDate, count, frequency, interval, weekdays, week, first });
  }

  get outgoingInvitation() {
    return new EWSOutgoingInvitation(this);
  }

  async saveToServer() {
    /* Disabling tasks for now.
    if (this.startTime) {
    */
      await this.saveCalendarItemToServer();
    /* Disabling tasks for now.
    } else {
      await this.saveTask();
    }
    */
  }

  async saveCalendarItemToServer() {
    let request: any = this.itemID ?
      new EWSUpdateItemRequest(this.itemID, {SendMeetingInvitationsOrCancellations: "SendToAllAndSaveCopy"}) :
      this.parentEvent ?
      new EWSUpdateOccurrenceRequest(this, {SendMeetingInvitationsOrCancellations: "SendToAllAndSaveCopy"}) :
      new EWSCreateItemRequest({SendMeetingInvitations: "SendToAllAndSaveCopy"});
    request.addField("CalendarItem", "Subject", this.title, "item:Subject");
    request.addField("CalendarItem", "Body", this.descriptionHTML ? { BodyType: "HTML", _TextContent_: this.descriptionHTML } : this.descriptionText ? { BodyType: "Text", _TextContent_: this.descriptionText } : "", "item:Body");
    request.addField("CalendarItem", "ReminderIsSet", this.alarm != null, "item:ReminderIsSet");
    request.addField("CalendarItem", "ReminderMinutesBeforeStart", this.alarmMinutesBeforeStart(), "item:ReminderMinutesBeforeStart");
    if (!this.parentEvent) { // Exchange Online requires not to write the `Recurrence` prop for recurrence instances
      request.addField("CalendarItem", "Recurrence", this.recurrenceRule ? this.saveRule(this.recurrenceRule) : null, "calendar:Recurrence");
    }
    if (this.calUID && !this.itemID && !this.parentEvent) {
      // This probably only makes sense when creating an event.
      // (And it's not even needed then as Exchange will auto-generate one.)
      request.addField("CalendarItem", "UID", this.calUID, "calendar:UID");
    }
    request.addField("CalendarItem", "Start", this.dateString(this.startTime), "calendar:Start");
    request.addField("CalendarItem", "End", this.dateString(this.endTime), "calendar:End");
    request.addField("CalendarItem", "IsAllDayEvent", this.allDay, "calendar:IsAllDayEvent");
    request.addField("CalendarItem", "Location", this.location, "calendar:Location");
    request.addField("CalendarItem", "RequiredAttendees", this.participants.hasItems ? {
      t$Attendee: this.participants.contents.map(entry => ({
        t$Mailbox: {
          t$EmailAddress: entry.emailAddress,
          t$Name: entry.name,
        }
      })),
    } : "", "calendar:RequiredAttendees");
    // No support for optional attendees in mustang;
    // all attendees get converted to be required for now.
    request.addField("CalendarItem", "OptionalAttendees", null, "calendar:OptionalAttendees");
    let timezone = IANAToWindowsTimezone[this.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone] || "UTC";
    request.addField("CalendarItem", "StartTimeZone", { Id: timezone }, "calendar:StartTimeZone");
    request.addField("CalendarItem", "EndTimeZone", { Id: timezone }, "calendar:EndTimeZone");
    let response = await this.calendar.account.callEWS(request);
    this.itemID = sanitize.nonemptystring(response.Items.CalendarItem.ItemId.Id);
    if (this.calUID) {
      return;
    }
    // Need an extra server roundtrip to get the UID
    request = {
      m$GetItem: {
        m$ItemShape: {
          t$BaseShape: "IdOnly",
          t$AdditionalProperties: {
            t$FieldURI: [{
              FieldURI: "calendar:UID",
            }],
          },
        },
        m$ItemIds: {
          t$ItemId: response.Items.CalendarItem.ItemId,
        },
      },
    };
    response = await this.calendar.account.callEWS(request);
    this.calUID = sanitize.nonemptystring(response.Items.CalendarItem.UID);
  }

  async saveTask() {
    let request = this.itemID ? new EWSUpdateItemRequest(this.itemID) : new EWSCreateItemRequest();
    request.addField("Task", "Subject", this.title, "item:Subject");
    request.addField("Task", "ReminderIsSet", this.alarm != null, "item:ReminderIsSet");
    request.addField("Task", "ReminderMinutesBeforeStart", this.alarmMinutesBeforeStart(), "item:ReminderMinutesBeforeStart");
    request.addField("Task", "Recurrence", this.recurrenceRule ? this.saveRule(this.recurrenceRule) : null, "task:Recurrence");
    request.addField("Task", "DueDate", this.endTime?.toISOString(), "task:DueDate");
    let response = await this.calendar.account.callEWS(request);
    this.itemID = sanitize.nonemptystring(response.Items.Task.ItemId.Id);
  }

  dateString(date: Date, day: boolean = this.allDay): string {
    if (day) {
      return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
    }
    return date.toISOString();
  }

  alarmMinutesBeforeStart(): number {
    if (!this.alarm) {
      // Exchange requires a value, even if there is no alarm.
      // It uses a separate flag for whether the alarm is set.
      return 0;
    }
    return (this.alarm.getTime() - this.startTime.getTime()) / -60 | 0;
  }

  saveRule(rule: RecurrenceRule) {
    let recurrenceType = rule.frequency[0] + rule.frequency.slice(1).toLowerCase();
    if (recurrenceType == "Yearly" || recurrenceType == "Monthly") {
      recurrenceType = (rule.week ? "Relative" : "Absolute") + recurrenceType;
    }
    let pattern: any = {};
    if (rule.frequency != Frequency.Yearly) {
      pattern.t$Interval = rule.interval;
    }
    if (/^Relative|^Weekly/.test(recurrenceType)) {
      let weekdays = rule.weekdays || [rule.startDate.getDay()];
      pattern.t$DaysOfWeek = rule.weekdays.map(day => Weekday[day]).join(" ");
    }
    if (rule.frequency == Frequency.Weekly) {
      pattern.t$FirstDayOfWeek = Weekday[rule.first];
    }
    if (/Relative/.test(recurrenceType)) {
      pattern.t$DayOfWeekIndex = WeekOfMonth[rule.week];
    }
    if (/Absolute/.test(recurrenceType)) {
      pattern.t$DayOfMonth = rule.startDate.getDate();
    }
    if (rule.frequency == Frequency.Yearly) {
      pattern.t$Month = rule.startDate.toLocaleDateString("en", { month: "long" });
    }
    let recurrence: any = {};
    recurrence[`t$${recurrenceType}Recurrence`] = pattern;
    if (rule.count < Infinity) {
      recurrence.t$NumberedRecurrence = {
        t$StartDate: this.dateString(rule.startDate, true),
        t$NumberOfOccurrences: rule.count,
      };
    } else if (rule.endDate) {
      recurrence.t$EndDateRecurrence = {
        t$StartDate: this.dateString(rule.startDate, true),
        t$EndDate: this.dateString(rule.endDate, true),
      };
    } else {
      recurrence.t$NoEndRecurrence = {
        t$StartDate: this.dateString(rule.startDate, true),
      };
    }
    return recurrence;
  }

  async deleteFromServer() {
    if (this.itemID) {
      // This works both for recurring masters and exceptions.
      let request = new EWSDeleteItemRequest(this.itemID, {SendMeetingCancellations: "SendToAllAndSaveCopy"});
      await this.calendar.account.callEWS(request);
    } else if (this.parentEvent) {
      // Create an exclusion.
      let request = {
        m$DeleteItem: {
          m$ItemIds: {
            t$OccurrenceItemId: {
              RecurringMasterId: this.parentEvent.itemID,
              InstanceIndex: this.parentEvent.instances.indexOf(this) + 1,
            },
          },
          DeleteType: "MoveToDeletedItems",
          SendMeetingCancellations: "SendToAllAndSaveCopy",
        },
      };
      await this.calendar.account.callEWS(request);
    }
  }

  async respondToInvitation(response: InvitationResponseInMessage): Promise<void> {
    assert(this.isIncomingMeeting, "Only invitations can be responded to");
    let request = new EWSCreateItemRequest({MessageDisposition: "SendAndSaveCopy"});
    request.addField(ResponseTypes[response], "ReferenceItemId", { Id: this.itemID });
    await this.calendar.account.callEWS(request);
  }
}

function addParticipants(attendees, participants: Participant[]) {
  for (let attendee of ensureArray(attendees)) {
    participants.push(new Participant(sanitize.emailAddress(attendee.Mailbox.EmailAddress), sanitize.nonemptystring(attendee.Mailbox.Name, null), sanitize.integer(InvitationResponse[attendee.ResponseType], InvitationResponse.Unknown)));
  }
}

function extractWeekdays(daysOfWeek: string): Weekday[] | null {
  return daysOfWeek ? daysOfWeek.split(" ").map(day => sanitize.integer(Weekday[day])) : null;
}

class EWSUpdateOccurrenceRequest {
  m$UpdateItem: any = {
    m$ItemChanges: {
      t$ItemChange: {
        t$OccurrenceItemId: {},
        t$Updates: {
          t$SetItemField: [],
          t$DeleteItemField: [],
        },
      },
    },
    ConflictResolution: "AlwaysOverwrite",
  };

  constructor(event: EWSEvent, attributes?: {[key: string]: string | boolean}) {
    this.itemChange.t$OccurrenceItemId.RecurringMasterId = event.parentEvent.itemID;
    this.itemChange.t$OccurrenceItemId.InstanceIndex = event.parentEvent.instances.indexOf(event) + 1;
    Object.assign(this.m$UpdateItem, attributes);
  }

  protected get itemChange() {
    return this.m$UpdateItem.m$ItemChanges.t$ItemChange;
  }

  addField(type: string, key: string, value: any, FieldURI: string, FieldIndex?: string) {
    let field = {} as any;
    if (FieldIndex) {
      field.t$IndexedFieldURI = { FieldURI, FieldIndex };
    } else {
      field.t$FieldURI = { FieldURI };
    }
    if (value == null) {
      this.itemChange.t$Updates.t$DeleteItemField.push(field);
    } else {
      field["t$" + type] = { ["t$" + key]: value };
      this.itemChange.t$Updates.t$SetItemField.push(field);
    }
  }
}

function fromWindowsZone(zone): string | null {
  return zone in IANAToWindowsTimezone ? zone : WindowsToIANATimezone[zone] ?? null;
}
