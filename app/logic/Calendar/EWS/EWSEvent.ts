import { Event } from "../Event";
import type { EWSCalendar } from "./EWSCalendar";
import WindowsZones from "./WindowsZones";
import { PersonUID, findOrCreatePersonUID } from "../../Abstract/PersonUID";
import { ensureArray } from "../../Mail/EWS/EWSEMail";
import EWSUpdateItemRequest from "../../Mail/EWS/EWSUpdateItemRequest";
import { NotImplemented } from "../../util/util";

const gTimeZone = WindowsZones[Intl.DateTimeFormat().resolvedOptions().timeZone] || "UTC";

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
      this.iCalUID = xmljs.UID;
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
      this.endTime = new Date(xmljs.End);
    }
    if (xmljs.DueDate) {
      this.endTime = new Date(xmljs.DueDate);
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
    if (this.itemID) {
      if (this.startTime) {
        await this.updateCalendarItem();
      } else {
        await this.updateTask();
      }
    } else {
      if (this.startTime) {
        await this.createCalendarItem();
      } else {
        await this.createTask();
      }
    }
    await super.save();
  }

  async updateCalendarItem() {
    let request = new EWSUpdateItemRequest(this.itemID, {SendMeetingInvitationsOrCancellations: "SendToAllAndSaveCopy"});
    request.addField("CalendarItem", "Subject", this.title, "item:Subject");
    request.addField("CalendarItem", "Body", this.descriptionHTML ? { BodyType: "HTML", _TextContent_: this.descriptionHTML } : this.descriptionText ? { BodyType: "Text", _TextContent_: this.descriptionText } : "", "item:Body");
    request.addField("CalendarItem", "ReminderIsSet", this.alarm != null, "item:ReminderIsSet");
    request.addField("CalendarItem", "ReminderMinutesBeforeStart", this.alarmMinutesBeforeStart(), "item:ReminderMinutesBeforeStart");
    request.addField("CalendarItem", "UID", this.iCalUID, "calendar:UID");
    request.addField("CalendarItem", "Start", this.dateString(this.startTime), "calendar:Start");
    request.addField("CalendarItem", "End", this.dateString(this.endTime), "calendar:End");
    request.addField("CalendarItem", "IsAllDayEvent", this.allDay, "calendar:IsAllDayEvent");
    request.addField("CalendarItem", "Location", this.location, "calendar:Location");
    request.addField("CalendarItem", "RequiredAttendees", this.participants.hasItems && {
      t$Attendee: this.participants.contents.map(entry => ({
        t$Mailbox: {
          t$EmailAddress: entry.emailAddress,
          t$Name: entry.name,
        }
      })),
    }, "calendar:RequiredAttendees");
    // No support for optional attendees in mustang;
    // all attendees get converted to be required for now.
    request.addField("CalendarItem", "OptionalAttendees", null, "calendar:OptionalAttendees");
    request.addField("CalendarItem", "StartTimeZone", { Id: gTimeZone }, "calendar:StartTimeZone");
    request.addField("CalendarItem", "EndTimeZone", { Id: gTimeZone }, "calendar:EndTimeZone");
    await this.calendar.account.callEWS(request);
  }

  async updateTask() {
    let request = new EWSUpdateItemRequest(this.itemID);
    request.addField("Task", "Subject", this.title, "item:Subject");
    request.addField("Task", "ReminderIsSet", this.alarm != null, "item:ReminderIsSet");
    request.addField("Task", "ReminderMinutesBeforeStart", this.alarmMinutesBeforeStart(), "item:ReminderMinutesBeforeStart");
    request.addField("Task", "DueDate", this.endTime?.toISOString(), "task:DueDate");
    await this.calendar.account.callEWS(request);
  }

  async createCalendarItem() {
    let request: any = {
      m$CreateItem: {
        m$Items: {
          t$CalendarItem: {
            t$Subject: this.title,
            t$Body: this.descriptionHTML ? {
              BodyType: "HTML",
              _TextContent_: this.descriptionHTML,
            } : this.descriptionText ? {
              BodyType: "Text",
              _TextContent_: this.descriptionText,
            } : "",
            t$ReminderIsSet: this.alarm != null,
            t$ReminderMinutesBeforeStart: this.alarmMinutesBeforeStart(),
            t$UID: this.iCalUID,
            t$Start: this.dateString(this.startTime),
            t$End: this.dateString(this.endTime),
            t$IsAllDayEvent: this.allDay,
            t$Location: this.location,
            t$RequiredAttendees: this.participants.hasItems ? {
              t$Attendee: this.participants.contents.map(entry => ({
                t$Mailbox: {
                  t$EmailAddress: entry.emailAddress,
                  t$Name: entry.name,
                }
              })),
            } : "",
            t$StartTimeZone: {
              Id: gTimeZone
            },
            t$EndTimeZone: {
              Id: gTimeZone
            },
          },
        },
        SendMeetingInvitations: "SendToAllAndSaveCopy",
      },
    };
    let response = await this.calendar.account.callEWS(request);
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
    this.iCalUID = response.Items.CalendarItem.UID;
    this.itemID = response.Items.CalendarItem.ItemId.Id;
  }

  async createTask() {
    let request = {
      m$CreateItem: {
        m$Items: {
          t$Task: {
            t$Subject: this.title,
            t$ReminderIsSet: this.alarm != null,
            t$ReminderMinutesBeforeStart: this.alarmMinutesBeforeStart(),
            t$DueDate: this.endTime?.toISOString(),
          },
        },
      },
    };
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
