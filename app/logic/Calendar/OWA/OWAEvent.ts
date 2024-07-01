import { Event } from "../Event";
import type { OWACalendar } from "./OWACalendar";
import WindowsTimezones from "../EWS/WindowsTimezones";
import { PersonUID, findOrCreatePersonUID } from "../../Abstract/PersonUID";
import OWACreateItemRequest from "../../Mail/OWA/OWACreateItemRequest";
import OWADeleteItemRequest from "../../Mail/OWA/OWADeleteItemRequest";
import OWAUpdateItemRequest from "../../Mail/OWA/OWAUpdateItemRequest";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";

const gTimeZone = WindowsTimezones[Intl.DateTimeFormat().resolvedOptions().timeZone] || "UTC";

export class OWAEvent extends Event {
  calendar: OWACalendar;

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
    if (json.Start) {
      this.startTime = sanitize.date(json.Start);
    }
    if (json.End) {
      this.endTime = sanitize.date(json.End);
    }
    if (json.DueDate) {
      this.endTime = sanitize.date(json.DueDate);
    }
    this.allDay = sanitize.boolean(json.IsAllDayEvent);
    if (json.Recurrence) {
      this.repeat = true;
      if (!this.startTime && json.Recurrence.EndDateRecurrence) {
        this.startTime = sanitize.date(json.Recurrence.EndDateRecurrence.StartDate.slice(0, 10));
      }
    }
    if (json.ReminderIsSet == "true") {
      this.alarm = new Date(this.startTime.getTime() - 60 * sanitize.integer(json.ReminderMinutesBeforeStart));
    } else {
      this.alarm = null;
    }
    this.location = sanitize.nonemptystring(json.Location?.DisplayName, "");
    let participants: PersonUID[] = [];
    if (json.RequiredAttendees) {
      addParticipants(json.RequiredAttendees, participants);
    }
    if (json.OptionalAttendees) {
      addParticipants(json.OptionalAttendees, participants);
    }
    this.participants.replaceAll(participants);
    if (json.LastModifiedTime) {
      this.lastMod = sanitize.date(json.LastModifiedTime);
    }
  }

  async save() {
    /* Disabling tasks for now.
    if (this.startTime) {
    */
      await this.saveCalendarItem();
    /* Disabling tasks for now.
    } else {
      await this.saveTask();
    }
    */
    //await super.save();
  }

  async saveCalendarItem() {
    let request: any = this.itemID ?
      new OWAUpdateItemRequest(this.itemID, {SendMeetingInvitationsOrCancellations: "SendToAllAndSaveCopy"}) :
      new OWACreateItemRequest({SendMeetingInvitations: "SendToAllAndSaveCopy"});
    request.addField("CalendarItem", "Subject", this.title, "item:Subject");
    request.addField("CalendarItem", "Body", this.descriptionHTML ? { __type: "BodyContentType:#Exchange", BodyType: "HTML", Value: this.descriptionHTML } : this.descriptionText ? { __type: "BodyContentType:#Exchange", BodyType: "Text", Value: this.descriptionText } : "", "item:Body");
    request.addField("CalendarItem", "ReminderIsSet", this.alarm != null, "item:ReminderIsSet");
    request.addField("CalendarItem", "ReminderMinutesBeforeStart", this.alarmMinutesBeforeStart(), "item:ReminderMinutesBeforeStart");
    request.addField("CalendarItem", "UID", this.calUID, "calendar:UID");
    request.addField("CalendarItem", "Start", this.dateString(this.startTime), "calendar:Start");
    request.addField("CalendarItem", "End", this.dateString(this.endTime), "calendar:End");
    request.addField("CalendarItem", "IsAllDayEvent", this.allDay, "calendar:IsAllDayEvent");
    request.addField("CalendarItem", "Location", this.location, "calendar:Location");
    request.addField("CalendarItem", "RequiredAttendees", this.participants.hasItems ? this.participants.contents.map(entry => ({
      __type: "AttendeeType:#Exchange",
      Mailbox: {
        EmailAddress: entry.emailAddress,
        Name: entry.name,
      }
    })) : [], "calendar:RequiredAttendees");
    // No support for optional attendees in mustang;
    // all attendees get converted to be required for now.
    request.addField("CalendarItem", "OptionalAttendees", null, "calendar:OptionalAttendees");
    request.addField("CalendarItem", "StartTimeZone", { Id: gTimeZone }, "calendar:StartTimeZone");
    request.addField("CalendarItem", "EndTimeZone", { Id: gTimeZone }, "calendar:EndTimeZone");
    let response = await this.calendar.account.callOWA(request);
    if (this.calUID) {
      return;
    }
    // Need an extra server roundtrip to get the UID
    request = {
      __type: "GetItemJsonRequest:#Exchange",
      Header: {
        __type: "JsonRequestHeaders:#Exchange",
        RequestServerVersion: "Exchange2013",
      },
      Body: {
        __type: "GetItemRequest:#Exchange",
        ItemShape: {
          __type: "ItemResponseShape:#Exchange",
          BaseShape: "IdOnly",
          AdditionalProperties: [{
            __type: "PropertyUri:#Exchange",
            FieldURI: "calendar:UID",
          }],
        },
        ItemIds: [{
          __type: "ItemId:#Exchange",
          Id: response.Items[0].ItemId.Id,
        }],
      },
    };
    response = await this.calendar.account.callOWA(request);
    this.calUID = sanitize.nonemptystring(response.Items[0].UID);
    this.itemID = sanitize.nonemptystring(response.Items[0].ItemId.Id);
  }

  async saveTask() {
    let request = this.itemID ? new OWAUpdateItemRequest(this.itemID) : new OWACreateItemRequest();
    request.addField("Task", "Subject", this.title, "item:Subject");
    request.addField("Task", "ReminderIsSet", this.alarm != null, "item:ReminderIsSet");
    request.addField("Task", "ReminderMinutesBeforeStart", this.alarmMinutesBeforeStart(), "item:ReminderMinutesBeforeStart");
    request.addField("Task", "DueDate", this.endTime?.toISOString(), "task:DueDate");
    let response = await this.calendar.account.callOWA(request);
    this.itemID = sanitize.nonemptystring(response.Items[0].ItemId.Id);
  }

  dateString(date: Date): string {
    if (this.allDay) {
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

  async deleteIt() {
    let request = new OWADeleteItemRequest(this.itemID, {SendMeetingCancellations: "SendToAllAndSaveCopy"});
    await this.calendar.account.callOWA(request);
    await super.deleteIt();
  }
}

function addParticipants(attendees, participants: PersonUID[]) {
  for (let attendee of attendees) {
    participants.push(findOrCreatePersonUID(sanitize.emailAddress(attendee.Mailbox.EmailAddress), sanitize.nonemptystring(attendee.Mailbox.Name, null)));
  }
}
