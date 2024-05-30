import { Event } from "../Event";
import type { EWSCalendar } from "./EWSCalendar";
import { PersonUID, findOrCreatePersonUID } from "../../Abstract/PersonUID";
import { ensureArray } from "../../Mail/EWS/EWSEMail";
import { NotImplemented } from "../../util/util";

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
    throw new NotImplemented();
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
