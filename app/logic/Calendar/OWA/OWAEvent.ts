import { Event } from "../Event";
import { Participant } from "../Participant";
import { InvitationResponse, type InvitationResponseInMessage } from "../Invitation/InvitationStatus";
import { Frequency, Weekday, RecurrenceRule } from "../RecurrenceRule";
import { IANAToWindowsTimezone, WindowsToIANATimezone } from "../ICal/WindowsTimezone";
import type { OWACalendar } from "./OWACalendar";
import { OWAOutgoingInvitation } from "./OWAOutgoingInvitation";
import { OWACreateOffice365EventRequest } from "./Request/OWACreateOffice365EventRequest";
import { OWAUpdateOffice365EventRequest } from "./Request/OWAUpdateOffice365EventRequest";
import { OWAUpdateOccurrenceRequest } from "./Request/OWAUpdateOccurrenceRequest";
import { OWAUpdateOffice365OccurrenceRequest } from "./Request/OWAUpdateOffice365OccurrenceRequest";
import { OWACreateItemRequest } from "../../Mail/OWA/Request/OWACreateItemRequest";
import { OWADeleteItemRequest } from "../../Mail/OWA/Request/OWADeleteItemRequest";
import { OWAUpdateItemRequest } from "../../Mail/OWA/Request/OWAUpdateItemRequest";
import { owaCreateExclusionRequest, owaCreateMultipleExclusionsRequest, owaGetEventUIDsRequest, owaOnlineMeetingDescriptionRequest, owaOnlineMeetingURLRequest, owaGetCalendarEventsRequest, owaGetEventsRequest } from "./Request/OWAEventRequests";
import { k1MinuteMS } from "../../../frontend/Util/date";
import { ArrayColl } from "svelte-collections";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assert } from "../../util/util";

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

export class OWAEvent extends Event {
  declare calendar: OWACalendar;
  declare parentEvent: OWAEvent;
  declare readonly exceptions: ArrayColl<OWAEvent>;

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
      this.rawText = sanitize.nonemptystring(json.Body.Value, "");
      this.rawHTMLDangerous = null;
    } else {
      this.rawText = sanitize.nonemptystring(json.TextBody?.Value, "");
      if (json.Body?.BodyType == "HTML") {
        this.rawHTMLDangerous = sanitize.nonemptystring(json.Body.Value, "");
      } else {
        this.rawHTMLDangerous = null;
      }
    }
    if (json.DateTimeStamp) {
      this.lastUpdateTime = sanitize.date(json.DateTimeStamp);
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
    this.allDay = sanitize.boolean(json.IsAllDayEvent, false);
    if (json.Recurrence) {
      this.recurrenceRule = this.newRecurrenceRuleFromJSON(json.Recurrence);
      if (json.DeletedOccurrences) {
        for (let deletion of json.DeletedOccurrences) {
          this.makeExclusionLocally(sanitize.date(deletion.Start));
        }
      }
    } else {
      this.recurrenceRule = null;
    }
    if (json.ReminderIsSet) {
      this.alarm = new Date(this.startTime.getTime() - k1MinuteMS * sanitize.integer(json.ReminderMinutesBeforeStart));
    } else {
      this.alarm = null;
    }
    this.location = sanitize.nonemptystring(json.Location?.DisplayName, "");
    this.onlineMeetingURL = sanitize.url(json.OnlineMeetingJoinUrl, null);
    this.isOnline = sanitize.boolean(json.IsOnlineMeeting, false);
    this.isCancelled = sanitize.boolean(json.IsCancelled, false);
    let organizer: string | undefined;
    let participants: Participant[] = [];
    if (json.Organizer && (json.RequiredAttendees || json.OptionalAttendees)) {
      organizer = sanitize.emailAddress(json.Organizer.Mailbox.EmailAddress);
      json.Organizer.ResponseType = this.isCancelled ? "Decline" : "Organizer";
      addParticipants([json.Organizer], participants);
    }
    if (json.RequiredAttendees) {
      addParticipants(json.RequiredAttendees, participants, organizer);
    }
    if (json.OptionalAttendees) {
      addParticipants(json.OptionalAttendees, participants, organizer);
    }
    this.participants.replaceAll(participants);
    if (json.ResponseType) {
      this.myParticipation = sanitize.integer(InvitationResponse[json.ResponseType], InvitationResponse.Unknown);
    }
    if (json.LastModifiedTime) {
      this.lastMod = sanitize.date(json.LastModifiedTime);
    }
  }

  protected newRecurrenceRuleFromJSON(json: any): RecurrenceRule {
    let masterDuration = this.duration;
    let seriesStartTime = this.startTime;
    let seriesEndTime: Date | null = null;
    if (json.RecurrenceRange.EndDate) {
      // These dates don't have a time, but they do have a time zone suffixed.
      if (!seriesStartTime) {
        this.startTime = seriesStartTime = sanitize.date(json.RecurrenceRange.StartDate.slice(0, 10));
      }
      seriesEndTime = sanitize.date(json.RecurrenceRange.EndDate.slice(0, 10));
      // RecurrenceRule wants this to be at least the same time as the endTime
      seriesEndTime.setDate(seriesEndTime.getDate() + 1);
      seriesEndTime.setTime(seriesEndTime.getTime() - 1000);
    }
    let count = sanitize.integer(json.RecurrenceRange.NumberOfOccurrences, Infinity);
    let pattern = json.RecurrencePattern;
    let frequency = pattern.__type.startsWith("Daily") ? Frequency.Daily : pattern.__type.startsWith("Weekly") ? Frequency.Weekly : pattern.Month ? Frequency.Yearly : Frequency.Monthly;
    let interval = sanitize.integer(pattern.Interval, 1);
    let weekdays = extractWeekdays(pattern.DaysOfWeek);
    let week = sanitize.integer(WeekOfMonth[pattern.DayOfWeekIndex], 0);
    let first = sanitize.integer(Weekday[pattern.FirstDayOfWeek], Weekday.Monday);
    return new RecurrenceRule({ masterDuration, seriesStartTime, seriesEndTime, count, frequency, interval, weekdays, week, first });
  }

  get outgoingInvitation() {
    return new OWAOutgoingInvitation(this);
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
    if (this.isIncomingMeeting) {
      request.addField("CalendarItem", "ReminderIsSet", this.alarm != null, "item:ReminderIsSet");
      request.addField("CalendarItem", "ReminderMinutesBeforeStart", this.alarmMinutesBeforeStart(), "item:ReminderMinutesBeforeStart");
      await this.calendar.account.callOWA(request);
      return;
    }
    request.addField("CalendarItem", "Subject", this.title, "item:Subject");
    request.addField("CalendarItem", "Body", this.rawHTMLDangerous ? { __type: "BodyContentType:#Exchange", BodyType: "HTML", Value: this.rawHTMLDangerous } : { __type: "BodyContentType:#Exchange", BodyType: "Text", Value: this.descriptionText }, "item:Body");
    request.addField("CalendarItem", "ReminderIsSet", this.alarm != null, "item:ReminderIsSet");
    request.addField("CalendarItem", "ReminderMinutesBeforeStart", this.alarmMinutesBeforeStart(), "item:ReminderMinutesBeforeStart");
    if (!this.parentEvent) { // Exchange requires not to write the `Recurrence` prop for recurrence instances
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
    let timezone = IANAToWindowsTimezone[this.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone] || "UTC";
    if (this.calendar.account.isOffice365()) {
      request.addField("CalendarItem", "StartTimeZoneId", timezone, "calendar:StartTimeZoneId");
      request.addField("CalendarItem", "EndTimeZoneId", timezone, "calendar:EndTimeZoneId");
      (request.Header as any).TimeZoneContext = {
        __type: "TimeZoneContext:#Exchange",
        TimeZoneDefinition: {
          __type: "TimeZoneDefinitionType:#Exchange",
          id: timezone,
        }
      };
    } else {
      request.addField("CalendarItem", "StartTimeZone", { __type: "TimeZoneDefinitionType:#Exchange", Id: timezone }, "calendar:StartTimeZone");
      request.addField("CalendarItem", "EndTimeZone", { __type: "TimeZoneDefinitionType:#Exchange", Id: timezone }, "calendar:EndTimeZone");
    }
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
    return (this.alarm.getTime() - this.startTime.getTime()) / -k1MinuteMS | 0;
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
      let weekdays = rule.weekdays || [rule.seriesStartTime.getDay()];
      recurrence.RecurrencePattern.DaysOfWeek = rule.weekdays.map(day => Weekday[day]).join(" ");
    }
    if (rule.frequency == Frequency.Weekly) {
      recurrence.RecurrencePattern.FirstDayOfWeek = Weekday[rule.first];
    }
    if (/Relative/.test(recurrenceType)) {
      recurrence.RecurrencePattern.DayOfWeekIndex = WeekOfMonth[rule.week];
    }
    if (/Absolute/.test(recurrenceType)) {
      recurrence.RecurrencePattern.DayOfMonth = rule.seriesStartTime.getDate();
    }
    if (rule.frequency == Frequency.Yearly) {
      recurrence.RecurrencePattern.Month = rule.seriesStartTime.toLocaleDateString("en", { month: "long" });
    }
    recurrence.RecurrenceRange.StartDate = this.dateString(rule.seriesStartTime, true);
    if (rule.count < Infinity) {
      recurrence.RecurrenceRange.__type = "NumberedRecurrence:#Exchange";
      recurrence.RecurrenceRange.NumberOfOccurrences = rule.count;
    } else if (rule.seriesEndTime) {
      recurrence.RecurrenceRange.__type = "EndDateRecurrence:#Exchange";
      recurrence.RecurrenceRange.EndDate = this.dateString(rule.seriesEndTime, true);
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

  /** Returns a copy of the event as read from the server */
  async fetchFromServer(): Promise<OWAEvent> {
    assert(this.itemID, "can't query unsaved event");
    let result = await this.calendar.account.callOWA(owaGetEventsRequest([this.itemID]));
    let item = result.Items[0];
    if (item.IsOnlineMeeting) {
      let result = await this.calendar.account.callOWA(owaGetCalendarEventsRequest([this.itemID]));
      item.OnlineMeetingJoinUrl = result.Items[0].OnlineMeetingJoinUrl;
    }
    let event = this.calendar.newEvent(this.parentEvent);
    event.fromJSON(item);
    return event;
  }

  async makeExclusions(exclusions: OWAEvent[]) {
    await this.calendar.account.callOWA(owaCreateMultipleExclusionsRequest(exclusions, this));
    await super.makeExclusions(exclusions);
  }

  async respondToInvitation(response: InvitationResponseInMessage): Promise<void> {
    assert(this.isIncomingMeeting, "Only invitations can be responded to");
    let request = new OWACreateItemRequest({MessageDisposition: "SendAndSaveCopy"});
    request.addField(ResponseTypes[response], "ReferenceItemId", {
      __type: "ItemId:#Exchange",
      Id: this.itemID,
    });
    await this.calendar.account.callOWA(request);
    try {
      await this.calendar.getEvents([this.itemID], new ArrayColl<OWAEvent>());
    } catch (ex) {
      if (ex.type == "ErrorItemNotFound") { // expected
        await this.deleteLocally(); // OWA deleted the event from the server
      } else {
        throw ex;
      }
    }
  }
}


function addParticipants(attendees, participants: Participant[], organizer?: string) {
  for (let attendee of attendees) {
    let emailAddress = sanitize.emailAddress(attendee.Mailbox.EmailAddress);
    if (emailAddress != organizer) {
      participants.push(new Participant(emailAddress, sanitize.nonemptystring(attendee.Mailbox.Name, null), sanitize.integer(InvitationResponse[attendee.ResponseType], InvitationResponse.Unknown)));
    }
  }
}

function extractWeekdays(daysOfWeek: string): Weekday[] | null {
  return daysOfWeek ? daysOfWeek.split(" ").map(day => sanitize.integer(Weekday[day])) : null;
}

function fromWindowsZone(zone): string | null {
  return zone in IANAToWindowsTimezone ? zone : WindowsToIANATimezone[zone] ?? null;
}
