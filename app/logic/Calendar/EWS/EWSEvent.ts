import { Event } from "../Event";
import type { EWSCalendar } from "./EWSCalendar";
import WindowsTimezones from "./WindowsTimezones";
import { PersonUID, findOrCreatePersonUID } from "../../Abstract/PersonUID";
import { ensureArray } from "../../Mail/EWS/EWSEMail";
import EWSCreateItemRequest from "../../Mail/EWS/EWSCreateItemRequest";
import EWSUpdateItemRequest from "../../Mail/EWS/EWSUpdateItemRequest";

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
    this.itemID = xmljs.ItemId.Id;
    if (xmljs.UID) {
      this.calUID = xmljs.UID;
    }
    if (xmljs.Subject) {
      this.title = xmljs.Subject;
    }
    if (xmljs.Body?.BodyType == "Text") {
      this.descriptionText = xmljs.Body.Value;
    } else {
      if (xmljs.TextBody) {
        this.descriptionText = xmljs.TextBody.Value;
      }
      if (xmljs.Body?.BodyType == "HTML") {
        this.descriptionHTML = xmljs.Body.Value;
      }
    }
    if (xmljs.Start) {
      this.startTime = new Date(xmljs.Start);
    }
    if (xmljs.End) {
      this.endTime = new Date(xmljs.Start);
    }
    if (xmljs.DueDate) {
      this.endTime = new Date(xmljs.Start);
    }
    this.allDay = xmljs.IsAllDayEvent == "true";
    if (xmljs.Recurrence) {
      this.repeat = true;
      if (!this.startTime && xmljs.Recurrence.EndDateRecurrence) {
        this.startTime = new Date(xmljs.Recurrence.EndDateRecurrence.StartDate.slice(0, 10));
      }
    }
    if (xmljs.ReminderIsSet == "true") {
      this.alarm = new Date(this.startTime.getTime() - 60 * xmljs.ReminderMinutesBeforeStart);
    } else {
      this.alarm = null;
    }
    if (xmljs.Location) {
      this.location = xmljs.Location;
    }
    let participants: PersonUID[] = [];
    if (xmljs.RequiredAttendees?.Attendee) {
      addParticipants(xmljs.RequiredAttendees.Attendee, participants);
    }
    if (xmljs.OptionalAttendees?.Attendee) {
      addParticipants(xmljs.OptionalAttendees.Attendee, participants);
    }
    this.participants.replaceAll(participants);
    if (xmljs.LastModifiedTime) {
      this.lastMod = new Date(xmljs.LastModifiedTime);
    }
  }

  async save() {
    if (this.startTime) {
      await this.saveCalendarItem();
    } else {
      await this.saveTask();
    }
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
    this.calUID = response.Items.CalendarItem.UID;
    this.itemID = response.Items.CalendarItem.ItemId.Id;
  }

  async saveTask() {
    let request = this.itemID ? new EWSUpdateItemRequest(this.itemID) : new EWSCreateItemRequest();
    request.addField("Task", "Subject", this.title, "item:Subject");
    request.addField("Task", "ReminderIsSet", this.alarm != null, "item:ReminderIsSet");
    request.addField("Task", "ReminderMinutesBeforeStart", this.alarmMinutesBeforeStart(), "item:ReminderMinutesBeforeStart");
    request.addField("Task", "DueDate", this.endTime?.toISOString(), "task:DueDate");
    let response = await this.calendar.account.callEWS(request);
    this.itemID = response.Items.Task.ItemId.Id;
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
    let request = {
      m$DeleteItem: {
        m$ItemIds: {
          t$ItemId: {
            Id: this.itemID,
          },
        },
        DeleteType: "MoveToDeletedItems",
        SendMeetingCancellations: "SendToAllAndSaveCopy",
      },
    };
    await this.calendar.account.callEWS(request);
    await super.deleteIt();
  }
}

function addParticipants(attendees, participants: PersonUID[]) {
  for (let attendee of ensureArray(attendees)) {
    participants.push(findOrCreatePersonUID(attendee.Mailbox.EmailAddress, attendee.Mailbox.Name));
  }
}
