import { Event } from "../Event";
import { Participant } from "../Participant";
import { ResponseType, type Responses } from "../Invitation";
import { Frequency, Weekday, RecurrenceRule } from "../RecurrenceRule";
import type { OWACalendar } from "./OWACalendar";
import WindowsTimezones from "../EWS/WindowsTimezones";
import OWACreateOffice365EventRequest from "./Request/OWACreateOffice365EventRequest";
import OWAUpdateOffice365EventRequest from "./Request/OWAUpdateOffice365EventRequest";
import OWAUpdateOccurrenceRequest from "./Request/OWAUpdateOccurrenceRequest";
import OWAUpdateOffice365OccurrenceRequest from "./Request/OWAUpdateOffice365OccurrenceRequest";
import OWACreateItemRequest from "../../Mail/OWA/Request/OWACreateItemRequest";
import OWADeleteItemRequest from "../../Mail/OWA/Request/OWADeleteItemRequest";
import OWAUpdateItemRequest from "../../Mail/OWA/Request/OWAUpdateItemRequest";
import { owaCreateExclusionRequest, owaGetEventUIDsRequest, owaOnlineMeetingDescriptionRequest, owaOnlineMeetingURLRequest } from "./Request/OWAEventRequests";
import type { ArrayColl } from "svelte-collections";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assert } from "../../util/util";

const ResponseTypes: Record<Responses, string> = {
  [ResponseType.Accept]: "AcceptItem",
  [ResponseType.Tentative]: "TentativelyAcceptItem",
  [ResponseType.Decline]: "DeclineItem",
};

const gTimeZone = WindowsTimezones[Intl.DateTimeFormat().resolvedOptions().timeZone] || "UTC";

enum WeekOfMonth {
  'First' = 1,
  'Second' = 2,
  'Third' = 3,
  'Fourth'= 4,
  'Last' = 5,
};

export class OWAEvent extends Event {
  calendar: OWACalendar;
  parentEvent: OWAEvent;
  readonly instances: ArrayColl<OWAEvent | null | undefined>;

  get itemID(): string | null {
    return this.pID;
  }
  set itemID(val: string | null) {
    this.pID = val;
  }

  fromJSON(json: any) {
    this.itemID = sanitize.nonemptystring(json.ItemId.Id);
    this.calUID = sanitize.nonemptystring(json.UID, null);
    this.title = sanitize.nonemptystring(json.Subject, "");
    if (json.Body?.BodyType == "Text") {
      this.descriptionText = sanitize.nonemptystring(json.Body.Value, "");
    } else {
      this.descriptionText = sanitize.nonemptystring(json.TextBody?.Value, "");
      if (json.Body?.BodyType == "HTML") {
        this.descriptionHTML = sanitize.nonemptystring(json.Body.Value, "");
      }
    }
    if (json.RecurrenceId) {
      this.recurrenceStartTime = sanitize.date(json.RecurrenceId);
      // In case it's not otherwise provided to us.
      this.startTime = new Date(this.recurrenceStartTime);
    }
    if (json.Start) {
      this.startTime = sanitize.date(json.Start);
    }
    if (json.End) {
      this.endTime = sanitize.date(json.End);
    }
    if (json.DueDate) {
      this.endTime = sanitize.date(json.DueDate);
    }
    this.timezone = fromWindowsZone(json.StartTimeZoneId);
    this.allDay = sanitize.boolean(json.IsAllDayEvent);
    if (json.Recurrence) {
      this.repeat = true;
      this.recurrenceRule = this.newRecurrenceRule(json.Recurrence);
      if (json.DeletedOccurrences) {
        for (let deletion of json.DeletedOccurrences) {
          let occurrences = this.recurrenceRule.getOccurrencesByDate(sanitize.date(deletion.Start));
          this.replaceInstance(occurrences.length - 1, null);
        }
      }
    }
    if (json.ReminderIsSet) {
      this.alarm = new Date(this.startTime.getTime() - 60 * sanitize.integer(json.ReminderMinutesBeforeStart));
    } else {
      this.alarm = null;
    }
    this.location = sanitize.nonemptystring(json.Location?.DisplayName, "");
    let participants: Participant[] = [];
    if (json.RequiredAttendees) {
      addParticipants(json.RequiredAttendees, participants);
    }
    if (json.OptionalAttendees) {
      addParticipants(json.OptionalAttendees, participants);
    }
    this.participants.replaceAll(participants);
    if (json.ResponseType) {
      this.response = sanitize.integer(ResponseType[json.ResponseType], ResponseType.Unknown);
    }
    if (json.LastModifiedTime) {
      this.lastMod = sanitize.date(json.LastModifiedTime);
    }
  }

  protected newRecurrenceRule(json: any): RecurrenceRule {
    let startDate = this.startTime;
    let endDate: Date | null = null;
    if (json.RecurrenceRange.EndDate) {
      // These dates don't have a time, but they do have a time zone suffixed.
      if (!startDate) {
        this.startTime = startDate = sanitize.date(json.RecurrenceRange.StartDate.slice(0, 10));
      }
      endDate = sanitize.date(json.RecurrenceRange.EndDate.slice(0, 10));
      // RecurrenceRule wants this to be at least the same time as the endTime
      endDate.setDate(endDate.getDate() + 1);
      endDate.setTime(endDate.getTime() - 1000);
    }
    let count = sanitize.integer(json.RecurrenceRange.NumberOfOccurrences, Infinity);
    let pattern = json.RecurrencePattern;
    let frequency = pattern.__type.startsWith("Daily") ? Frequency.Daily : pattern.__type.startsWith("Weekly") ? Frequency.Weekly : pattern.Month ? Frequency.Yearly : Frequency.Monthly;
    let interval = sanitize.integer(pattern.Interval, 1);
    let weekdays = extractWeekdays(pattern.DaysOfWeek);
    let week = sanitize.integer(WeekOfMonth[pattern.DayOfWeekIndex], 0);
    let first = sanitize.integer(Weekday[pattern.FirstDayOfWeek], Weekday.Monday);
    return new RecurrenceRule({ startDate, endDate, count, frequency, interval, weekdays, week, first });
  }

  async saveToServer() {
    /* Disabling tasks for now.
    if (this.startTime) {
    */
      await this.saveCalendarItem();
    /* Disabling tasks for now.
    } else {
      await this.saveTask();
    }
    */
  }

  protected getExchangeSaveRequest() {
    return this.itemID ?
      new OWAUpdateItemRequest(this.itemID, {SendCalendarInvitationsOrCancellations: "SendToAllAndSaveCopy"}) :
      this.parentEvent ?
      new OWAUpdateOccurrenceRequest(this, {SendCalendarInvitationsOrCancellations: "SendToAllAndSaveCopy"}) :
      new OWACreateItemRequest({SendMeetingInvitations: "SendToAllAndSaveCopy"});
  }

  protected getOffice365SaveRequest() {
    return this.itemID ?
      new OWAUpdateOffice365EventRequest(this.itemID) :
      this.parentEvent ?
      new OWAUpdateOffice365OccurrenceRequest(this) :
      // Office 365 requires an explicit saved item folder id
      new OWACreateOffice365EventRequest({ SavedItemFolderId: { __type: "TargetFolderId:#Exchange", BaseFolderId: { __type: "DistinguishedFolderId:#Exchange", Id: "calendar" } } });
  }

  async saveCalendarItem() {
    let request = this.calendar.account.isOffice365() ? this.getOffice365SaveRequest() : this.getExchangeSaveRequest();
    request.addField("CalendarItem", "Subject", this.title, "item:Subject");
    request.addField("CalendarItem", "Body", this.descriptionHTML ? { __type: "BodyContentType:#Exchange", BodyType: "HTML", Value: this.descriptionHTML } : { __type: "BodyContentType:#Exchange", BodyType: "Text", Value: this.descriptionText ?? "" }, "item:Body");
    request.addField("CalendarItem", "ReminderIsSet", this.alarm != null, "item:ReminderIsSet");
    request.addField("CalendarItem", "ReminderMinutesBeforeStart", this.alarmMinutesBeforeStart(), "item:ReminderMinutesBeforeStart");
    request.addField("CalendarItem", "Recurrence", this.recurrenceRule ? this.saveRule(this.recurrenceRule) : null, "calendar:Recurrence");
    if (this.calUID && !this.itemID && !this.parentEvent) {
      // This probably only makes sense when creating an event.
      // (And it's not even needed then as Exchange will auto-generate one.)
      request.addField("CalendarItem", "UID", this.calUID, "calendar:UID");
    }
    request.addField("CalendarItem", "Start", this.dateString(this.startTime), "calendar:Start");
    request.addField("CalendarItem", "End", this.dateString(this.endTime), "calendar:End");
    request.addField("CalendarItem", "IsAllDayEvent", this.allDay, "calendar:IsAllDayEvent");
    request.addField("CalendarItem", "Location", { __type: "EnhancedLocation:#Exchange", DisplayName: this.location || "", PostalAddress: { __type: "PersonaPostalAddress:#Exchange", Type: "Business", LocationSource: "None", } }, "EnhancedLocation");
    request.addField("CalendarItem", "RequiredAttendees", this.participants.hasItems ? this.participants.contents.map(entry => ({
      __type: "AttendeeType:#Exchange",
      Mailbox: {
        EmailAddress: entry.emailAddress,
        Name: entry.name,
      }
    })) : null, "calendar:RequiredAttendees");
    // No support for optional attendees in mustang;
    // all attendees get converted to be required for now.
    request.addField("CalendarItem", "OptionalAttendees", null, "calendar:OptionalAttendees");
    request.addField("CalendarItem", "StartTimeZone", { __type: "TimeZoneDefinitionType:#Exchange", Id: gTimeZone }, "calendar:StartTimeZone");
    request.addField("CalendarItem", "EndTimeZone", { __type: "TimeZoneDefinitionType:#Exchange", Id: gTimeZone }, "calendar:EndTimeZone");
    if (this.calendar.account.isOffice365() && this.isOnline && !this.onlineMeetingURL) {
      request.addField("CalendarItem", "IsOnlineMeeting", true, "IsOnlineMeeting");
      request.addField("CalendarItem", "OnlineMeetingProvider", "TeamsForBusiness", "OnlineMeetingProvider");
    }
    let response = await this.calendar.account.callOWA(request);
    this.itemID = sanitize.nonemptystring(response.Items[0].ItemId.Id);

    // The server will set the online meeting URL and append the description.
    // Get the new values back from the server.
    if (this.calendar.account.isOffice365() && this.isOnline && !this.onlineMeetingURL) {
      // Sadly we can't get all of the changes in one API call
      await this.getOnlineMeetingDescription();
      await this.getOnlineMeetingURL();
    }
    if (!this.calUID) {
      // Need an extra server roundtrip to get the UID
      await this.updateUID();
    }
  }

  protected async getOnlineMeetingDescription() {
    let response = await this.calendar.account.callOWA(owaOnlineMeetingDescriptionRequest([ this.itemID ]));
    let item = response.Items[0];
    this.calUID = sanitize.nonemptystring(item.UID);
    this.location = sanitize.nonemptystring(item.Location?.DisplayName, "");
    if (item.Body?.BodyType == "Text") {
      this.descriptionText = sanitize.nonemptystring(item.Body.Value, "");
    } else {
      this.descriptionText = sanitize.nonemptystring(item.TextBody?.Value, "");
      if (item.Body?.BodyType == "HTML") {
        this.descriptionHTML = sanitize.nonemptystring(item.Body.Value, "");
      }
    }
  }

  protected async getOnlineMeetingURL() {
    let response = await this.calendar.account.callOWA(owaOnlineMeetingURLRequest([ this.itemID ]));
    this.onlineMeetingURL = sanitize.url(response.Items[0].OnlineMeetingJoinUrl, null);
  }

  protected async updateUID() {
    let response = await this.calendar.account.callOWA(owaGetEventUIDsRequest([ this.itemID ]));
    this.calUID = sanitize.nonemptystring(response.Items[0].UID);
  }

  async saveTask() {
    let request = this.itemID ? new OWAUpdateItemRequest(this.itemID) : new OWACreateItemRequest();
    request.addField("Task", "Subject", this.title, "item:Subject");
    request.addField("Task", "ReminderIsSet", this.alarm != null, "item:ReminderIsSet");
    request.addField("Task", "ReminderMinutesBeforeStart", this.alarmMinutesBeforeStart(), "item:ReminderMinutesBeforeStart");
    request.addField("Task", "Recurrence", this.recurrenceRule ? this.saveRule(this.recurrenceRule) : null, "task:Recurrence");
    request.addField("Task", "DueDate", this.endTime?.toISOString(), "task:DueDate");
    let response = await this.calendar.account.callOWA(request);
    this.itemID = sanitize.nonemptystring(response.Items[0].ItemId.Id);
  }

  protected dateString(date: Date, day: boolean = this.allDay): string {
    if (day) {
      return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
    }
    return date.toISOString();
  }

  protected alarmMinutesBeforeStart(): number {
    if (!this.alarm) {
      // Exchange requires a value, even if there is no alarm.
      // It uses a separate flag for whether the alarm is set.
      return 0;
    }
    return (this.alarm.getTime() - this.startTime.getTime()) / -60 | 0;
  }

  protected saveRule(rule: RecurrenceRule) {
    let recurrenceType = rule.frequency[0] + rule.frequency.slice(1).toLowerCase();
    if (recurrenceType == "Yearly" || recurrenceType == "Monthly") {
      recurrenceType = (rule.week ? "Relative" : "Absolute") + recurrenceType;
    }
    let recurrence: any = {
      __type: "RecurrenceType:#Exchange",
      RecurrencePattern: {
        __type: recurrenceType + "Recurrence:#Exchange",
      },
      RecurrenceRange: {
        __type: "NoEndRecurrence:#Exchange",
      }
    };
    if (rule.frequency != Frequency.Yearly) {
      recurrence.RecurrencePattern.Interval = rule.interval;
    }
    if (/^Relative|^Weekly/.test(recurrenceType)) {
      let weekdays = rule.weekdays || [rule.startDate.getDay()];
      recurrence.RecurrencePattern.DaysOfWeek = rule.weekdays.map(day => Weekday[day]).join(" ");
    }
    if (rule.frequency == Frequency.Weekly) {
      recurrence.RecurrencePattern.FirstDayOfWeek = Weekday[rule.first];
    }
    if (/Relative/.test(recurrenceType)) {
      recurrence.RecurrencePattern.DayOfWeekIndex = WeekOfMonth[rule.week];
    }
    if (/Absolute/.test(recurrenceType)) {
      recurrence.RecurrencePattern.DayOfMonth = rule.startDate.getDate();
    }
    if (rule.frequency == Frequency.Yearly) {
      recurrence.RecurrencePattern.Month = rule.startDate.toLocaleDateString("en", { month: "long" });
    }
    recurrence.RecurrenceRange.StartDate = this.dateString(rule.startDate, true);
    if (rule.count < Infinity) {
      recurrence.RecurrenceRange.__type = "NumberedRecurrence:#Exchange";
      recurrence.RecurrenceRange.NumberOfOccurrences = rule.count;
    } else if (rule.endDate) {
      recurrence.RecurrenceRange.__type = "EndDateRecurrence:#Exchange";
      recurrence.RecurrenceRange.EndDate = this.dateString(rule.endDate, true);
    }
    return recurrence;
  }

  async deleteFromServer() {
    if (this.itemID) {
      // This works both for recurring masters and exceptions.
      let request = new OWADeleteItemRequest(this.itemID, {SendMeetingCancellations: "SendToAllAndSaveCopy"});
      await this.calendar.account.callOWA(request);
    } else if (this.parentEvent) {
      await this.calendar.account.callOWA(owaCreateExclusionRequest(this, this.parentEvent));
    }
  }

  async respondToInvitation(response: Responses): Promise<void> {
    assert(this.response > ResponseType.Organizer, "Only invitations can be responded to");
    let request = new OWACreateItemRequest({MessageDisposition: "SendAndSaveCopy"});
    request.addField(ResponseTypes[response], "ReferenceItemId", {
      __type: "ItemId:#Exchange",
      Id: this.itemID,
    });
    await this.calendar.account.callOWA(request);
  }
}


function addParticipants(attendees, participants: Participant[]) {
  for (let attendee of attendees) {
    participants.push(new Participant(sanitize.emailAddress(attendee.Mailbox.EmailAddress), sanitize.nonemptystring(attendee.Mailbox.Name, null), sanitize.integer(ResponseType[attendee.ResponseType], ResponseType.Unknown)));
  }
}

function extractWeekdays(daysOfWeek: string): Weekday[] | null {
  return daysOfWeek ? daysOfWeek.split(" ").map(day => sanitize.integer(Weekday[day])) : null;
}

function fromWindowsZone(windowsZone): string | null {
  for (let iana in WindowsTimezones) {
    if (WindowsTimezones[iana] == windowsZone) {
      return iana;
    }
  }
  return null;
}
