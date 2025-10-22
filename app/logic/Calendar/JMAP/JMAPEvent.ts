import { Event, RecurrenceCase } from "../Event";
import { Participant } from "../Participant";
import { InvitationResponse, type InvitationResponseInMessage } from "../Invitation/InvitationStatus";
import { Frequency, Weekday, RecurrenceRule } from "../RecurrenceRule";
import type { JMAPCalendar } from "./JMAPCalendar";
import { JMAPOutgoingInvitation } from "./JMAPOutgoingInvitation";
import { k1MinuteMS } from "../../../frontend/Util/date";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assert, ensureArray } from "../../util/util";
import type { ArrayColl } from "svelte-collections";

export class JMAPEvent extends Event {
  declare calendar: JMAPCalendar;
  declare parentEvent: JMAPEvent;
  declare readonly exceptions: ArrayColl<JMAPEvent>;

  get itemID(): string | null {
    return this.pID;
  }
  set itemID(val: string | null) {
    this.pID = val;
  }

  fromJMAP(jmap: Record<string, any>) {
    /*
    this.itemID = sanitize.nonemptystring(jmap.ItemId.Id);
    this.calUID = sanitize.nonemptystring(jmap.UID, null);
    this.title = sanitize.nonemptystring(jmap.Subject, "");
    if (jmap.Body?.BodyType == "Text") {
      this.rawText = sanitize.nonemptystring(jmap.Body.Value, "");
      this.rawHTMLDangerous = null;
    } else {
      this.rawText = sanitize.nonemptystring(jmap.TextBody?.Value, "");
      if (jmap.Body?.BodyType == "HTML") {
        this.rawHTMLDangerous = sanitize.nonemptystring(jmap.Body.Value, "");
      } else {
        this.rawHTMLDangerous = null;
      }
    }
    if (jmap.DateTimeStamp) {
      this.lastUpdateTime = sanitize.date(jmap.DateTimeStamp);
    }
    if (jmap.RecurrenceId) {
      this.recurrenceStartTime = sanitize.date(jmap.RecurrenceId);
      // In case it's not otherwise provided to us.
      this.startTime = new Date(this.recurrenceStartTime);
    }
    if (jmap.Start) {
      this.startTime = sanitize.date(jmap.Start);
    }
    if (jmap.End) {
      this.endTime = sanitize.date(jmap.End);
    }
    if (jmap.DueDate) {
      this.endTime = sanitize.date(jmap.DueDate);
    }
    this.timezone = fromWindowsZone(jmap.StartTimeZoneId);
    this.allDay = sanitize.boolean(jmap.IsAllDayEvent, false);
    if (jmap.Recurrence) {
      this.recurrenceRule = this.newRecurrenceRuleFromJMAP(jmap.Recurrence);
      if (jmap.DeletedOccurrences?.DeletedOccurrence) {
        for (let deletion of ensureArray(jmap.DeletedOccurrences.DeletedOccurrence)) {
          this.makeExclusionLocally(sanitize.date(deletion.Start));
        }
      }
    } else {
      this.recurrenceRule = null;
    }
    if (jmap.ReminderIsSet == "true") {
      this.alarm = new Date(this.startTime.getTime() - k1MinuteMS * sanitize.integer(jmap.ReminderMinutesBeforeStart));
    } else {
      this.alarm = null;
    }
    this.location = sanitize.nonemptystring(jmap.Location, "");
    this.isCancelled = sanitize.boolean(jmap.IsCancelled, false);
    let organizer: string | undefined;
    let participants: Participant[] = [];
    if (jmap.Organizer && (jmap.RequiredAttendees?.Attendee || jmap.OptionalAttendees?.Attendee)) {
      organizer = sanitize.emailAddress(jmap.Organizer.Mailbox.EmailAddress);
      jmap.Organizer.ResponseType = "Organizer";
      addParticipants(jmap.Organizer, participants);
    }
    if (jmap.RequiredAttendees?.Attendee) {
      addParticipants(jmap.RequiredAttendees.Attendee, participants, organizer);
    }
    if (jmap.OptionalAttendees?.Attendee) {
      addParticipants(jmap.OptionalAttendees.Attendee, participants, organizer);
    }
    this.participants.replaceAll(participants);
    if (jmap.MyResponseType) {
      this.myParticipation = sanitize.integer(InvitationResponse[jmap.MyResponseType], InvitationResponse.Unknown);
    }
    if (jmap.LastModifiedTime) {
      this.lastMod = sanitize.date(jmap.LastModifiedTime);
    }
    */
  }

  get outgoingInvitation() {
    return new JMAPOutgoingInvitation(this);
  }

  async saveToServer() {
  }

  async saveCalendarItemToServer() {
  }

  async saveTask() {
  }

  saveRule(rule: RecurrenceRule) {
  }

  async deleteFromServer() {
  }

  /** Returns a copy of the event as read from the server */
  async fetchFromServer(): Promise<JMAPEvent> {
  }

  async makeExclusions(exclusions: JMAPEvent[]) {
    await super.makeExclusions(exclusions);
  }

  async respondToInvitation(response: InvitationResponseInMessage): Promise<void> {
    assert(this.isIncomingMeeting, "Only invitations can be responded to");
    // ...
    await this.calendar.listEvents(); // Sync whatever the server decides to do
  }
}
