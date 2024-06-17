import { Event } from "../Event";
import type { EWSCalendar } from "./EWSCalendar";
import WindowsTimezones from "./WindowsTimezones";
import { PersonUID, findOrCreatePersonUID } from "../../Abstract/PersonUID";
import { ensureArray } from "../../Mail/EWS/EWSEMail";
import EWSCreateItemRequest from "../../Mail/EWS/EWSCreateItemRequest";
import EWSDeleteItemRequest from "../../Mail/EWS/EWSDeleteItemRequest";
import EWSUpdateItemRequest from "../../Mail/EWS/EWSUpdateItemRequest";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";

const gTimeZone = WindowsTimezones[Intl.DateTimeFormat().resolvedOptions().timeZone] || "UTC";

export class EWSEvent extends Event {
  calendar: EWSCalendar;

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
    if (xmljs.Start) {
      this.startTime = sanitize.date(xmljs.Start);
    }
    if (xmljs.End) {
      this.endTime = sanitize.date(xmljs.End);
    }
    if (xmljs.DueDate) {
      this.endTime = sanitize.date(xmljs.DueDate);
    }
    this.allDay = sanitize.boolean(xmljs.IsAllDayEvent);
    if (xmljs.Recurrence) {
      this.repeat = true;
      if (!this.startTime && xmljs.Recurrence.EndDateRecurrence) {
        this.startTime = sanitize.date(xmljs.Recurrence.EndDateRecurrence.StartDate.slice(0, 10));
      }
    }
    if (xmljs.ReminderIsSet == "true") {
      this.alarm = new Date(this.startTime.getTime() - 60 * sanitize.integer(xmljs.ReminderMinutesBeforeStart));
    } else {
      this.alarm = null;
    }
    this.location = sanitize.nonemptystring(xmljs.Location, "");
    let participants: PersonUID[] = [];
    if (xmljs.RequiredAttendees?.Attendee) {
      addParticipants(xmljs.RequiredAttendees.Attendee, participants);
    }
    if (xmljs.OptionalAttendees?.Attendee) {
      addParticipants(xmljs.OptionalAttendees.Attendee, participants);
    }
    this.participants.replaceAll(participants);
    if (xmljs.LastModifiedTime) {
      this.lastMod = sanitize.date(xmljs.LastModifiedTime);
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
    await super.save();
  }

  async saveCalendarItem() {
    let request: any = this.itemID ?
      new EWSUpdateItemRequest(this.itemID, {SendMeetingInvitationsOrCancellations: "SendToAllAndSaveCopy"}) :
      new EWSCreateItemRequest({SendMeetingInvitations: "SendToAllAndSaveCopy"});
    request.addField("CalendarItem", "Subject", this.title, "item:Subject");
    request.addField("CalendarItem", "Body", this.descriptionHTML ? { BodyType: "HTML", _TextContent_: this.descriptionHTML } : this.descriptionText ? { BodyType: "Text", _TextContent_: this.descriptionText } : "", "item:Body");
    request.addField("CalendarItem", "ReminderIsSet", this.alarm != null, "item:ReminderIsSet");
    request.addField("CalendarItem", "ReminderMinutesBeforeStart", this.alarmMinutesBeforeStart(), "item:ReminderMinutesBeforeStart");
    request.addField("CalendarItem", "UID", this.calUID, "calendar:UID");
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
    request.addField("CalendarItem", "StartTimeZone", { Id: gTimeZone }, "calendar:StartTimeZone");
    request.addField("CalendarItem", "EndTimeZone", { Id: gTimeZone }, "calendar:EndTimeZone");
    let response = await this.calendar.account.callEWS(request);
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
    this.itemID = sanitize.nonemptystring(response.Items.CalendarItem.ItemId.Id);
  }

  async saveTask() {
    let request = this.itemID ? new EWSUpdateItemRequest(this.itemID) : new EWSCreateItemRequest();
    request.addField("Task", "Subject", this.title, "item:Subject");
    request.addField("Task", "ReminderIsSet", this.alarm != null, "item:ReminderIsSet");
    request.addField("Task", "ReminderMinutesBeforeStart", this.alarmMinutesBeforeStart(), "item:ReminderMinutesBeforeStart");
    request.addField("Task", "DueDate", this.endTime?.toISOString(), "task:DueDate");
    let response = await this.calendar.account.callEWS(request);
    this.itemID = sanitize.nonemptystring(response.Items.Task.ItemId.Id);
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
    let request = new EWSDeleteItemRequest(this.itemID, {SendMeetingCancellations: "SendToAllAndSaveCopy"});
    await this.calendar.account.callEWS(request);
    await super.deleteIt();
  }
}

function addParticipants(attendees, participants: PersonUID[]) {
  for (let attendee of ensureArray(attendees)) {
    participants.push(findOrCreatePersonUID(sanitize.emailAddress(attendee.Mailbox.EmailAddress), sanitize.nonemptystring(attendee.Mailbox.Name, null)));
  }
}
