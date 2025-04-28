import type { Calendar } from "./Calendar";
import { Participant } from "./Participant";
import type { RecurrenceRule } from "./RecurrenceRule";
import OutgoingInvitation from "./Invitation/OutgoingInvitation";
import { InvitationResponse, type InvitationResponseInMessage } from "./Invitation/InvitationStatus";
import type { MailAccount } from "../Mail/MailAccount";
import type { MailIdentity } from "../Mail/MailIdentity";
import { PersonUID } from "../Abstract/PersonUID";
import { appGlobal } from "../app";
import { k1DayS, k1HourS, k1MinuteS } from "../../frontend/Util/date";
import { Observable, notifyChangedAccessor, notifyChangedProperty } from "../util/Observable";
import { Lock } from "../util/Lock";
import { assert, randomID } from "../util/util";
import { ArrayColl } from "svelte-collections";

export class Event extends Observable {
  id: string;
  dbID: number;
  /** iCal UID if this is a meeting */
  calUID: string | null = null;
  /** Protocol-specific ID for this event */
  pID: string | null = null;
  @notifyChangedProperty
  title: string;
  @notifyChangedProperty
  descriptionText: string;
  @notifyChangedProperty
  descriptionHTML: string;

  @notifyChangedProperty
  startTime: Date;
  @notifyChangedProperty
  endTime: Date;
  @notifyChangedProperty
  allDay = false;
  /** IANA timezone name, e.g. "Europe/Berlin" */
  @notifyChangedProperty
  timezone: string | null = null;

  /**
   * Shows whether this is a normal non-recurring event,
   * recurrence master, generated instance, or exception.
   *
   * | `Event.recurrenceCase` | `Event.parentEvent` | `Event.recurrenceRule` |
   * | ---------------------- | ------------------- | ---------------------- |
   * | Normal                 | without             | without                |
   * | Master                 | without             | with                   |
   * | Instance               | with                | without                |
   * | Exception              | with                | without                |
   *
   * Other state combinations are invalid.
   */
  @notifyChangedProperty
  recurrenceCase = RecurrenceCase.Normal;
  /** Describes the recurrence pattern.
   * Only for RecurrenceCase == Master */
  @notifyChangedProperty
  recurrenceRule: RecurrenceRule | null = null;
  /** Links back to the recurring master.
   * Only for RecurrenceCase == Instance or Exception */
  @notifyChangedProperty
  parentEvent: Event | null = null;
  /**
   * Only for RecurrenceCase == Exception (or Instance)
   *
   * If this is an instance or exception of a recurring meeting (not the master),
   * then this is the instance's original start time.
   * The `startTime` may contain a modified time as an exception.
   * This allows us to work out the instance index of an exception,
   * even if its actual start time has been modified.
   *
   * For RecurrenceCase == Instance, it's identical to `startTime`. TODO Remove it in this case?
   */
  recurrenceStartTime: Date | null = null;
  /**
   * Only for RecurrenceCase == Master
   *
   * Holds child instances of a recurring event:
   * - undefined means that a recurring instance hasn't been generated yet
   * - null means that that the instance was excluded
   * - otherwise, it's an instance or exception
   *
   * Load and save:
   * - We do not save instances, only exceptions.
   * - Instances are generated on load, using `fillRecurrences()`
   * - The array here may not be complete, but `fillRecurrences()`
   *   will auto-generate additional instances if necessary.
   */
  readonly instances = new ArrayColl<Event | null | undefined>;

  @notifyChangedProperty
  alarm: Date | null = null;

  @notifyChangedProperty
  location: string;
  @notifyChangedProperty
  onlineMeetingURL: string;
  @notifyChangedProperty
  isOnline = false;
  @notifyChangedProperty
  readonly participants = new ArrayColl<Participant>();
  @notifyChangedProperty
  myParticipation = InvitationResponse.Unknown;
  /** If we're currently editing this event,
   * saves the original state before the editing.
   *
   * Allows to calculate `hasChanged()`, revert changes,
   * and to implement full editable offline support.
   * Set be `startEditing()` and `stopEditing()` */
  @notifyChangedProperty
  unedited: Event | null = null;
  @notifyChangedProperty
  lastMod = new Date();
  @notifyChangedProperty
  calendar: Calendar;
  storageLock = new Lock();

  constructor(calendar?: Calendar, parentEvent?: Event) {
    super();
    this.id = randomID();
    this.calendar = calendar;
    if (parentEvent) {
      this.parentEvent = parentEvent;
      this.copyFromRecurrenceMaster(parentEvent);
      this.recurrenceCase = RecurrenceCase.Instance;
    }
  }

  /** in seconds */
  get duration(): number {
    let seconds = Math.round((this.endTime.getTime() - this.startTime.getTime()) / 1000);
    if (this.allDay) {
      return Math.round(Math.ceil(seconds / k1DayS) * k1DayS); // return entire days, not 1 second less
    }
    return seconds;
  }
  @notifyChangedAccessor
  set duration(seconds: number) {
    assert(seconds >= 0, "Duration must be >= 0");
    if (this.allDay) {
      seconds = Math.round(Math.ceil(seconds / k1DayS) * k1DayS) - 1; // set to 23:59:59
    }
    this.endTime.setTime(this.startTime.getTime() + seconds * 1000);
  }

  /** in minutes */
  get durationMinutes(): number {
    return this.duration / k1MinuteS;
  }
  set durationMinutes(minutes: number) {
    this.duration = minutes * k1MinuteS;
  }

  /** in hours */
  get durationHours(): number {
    return this.duration / k1HourS;
  }
  set durationHours(hours: number) {
    this.duration = hours * k1HourS;
  }

  /** in days */
  get durationDays(): number {
    return this.duration / k1DayS;
  }
  set durationDays(days: number) {
    this.duration = days * k1DayS;
  }

  /** Create a new instance of the same event.
   * Copy all data of the `original` event into this new Event object */
  copyFrom(original: Event) {
    this.copyFromRecurrenceMaster(original);
    this.startTime = original.startTime ? new Date(original.startTime) : null;
    this.endTime = original.endTime ? new Date(original.endTime) : null;
    this.alarm = original.alarm ? new Date(original.alarm) : null;
    this.recurrenceStartTime = original.recurrenceStartTime ? new Date(original.recurrenceStartTime) : null;
    this.recurrenceCase = original.recurrenceCase;
    this.recurrenceRule = original.recurrenceRule;
    this.parentEvent = original.parentEvent;
  }

  /**
   * Used to update placeholder instances from their recurring master.
   * Copies the event properties that are shared between recurring instances.
   */
  protected copyFromRecurrenceMaster(original: Event) {
    this.calUID = original.calUID;
    this.title = original.title;
    this.descriptionText = original.descriptionText;
    this.descriptionHTML = original.descriptionHTML;
    this.timezone = original.timezone;
    this.allDay = original.allDay;
    this.location = original.location;
    this.isOnline = original.isOnline;
    this.onlineMeetingURL = original.onlineMeetingURL;
    this.participants.replaceAll(original.participants);
    this.myParticipation = original.myParticipation;
  }

  get outgoingInvitation() {
    return new OutgoingInvitation(this);
  }

  protected participantMe(): { identity: MailIdentity, participant: Participant, person: PersonUID } {
    let results = [];
    for (let account of appGlobal.emailAccounts) {
      if (!account.canSendInvitations) {
        continue;
      }
      for (let identity of account.identities) {
        for (let participant of this.participants) {
          if (identity.isEMailAddress(participant.emailAddress)) {
            let person = new PersonUID(participant.emailAddress, identity.realname);
            results.push({ identity, participant, person });
          }
        }
      }
    }
    assert(results.length == 1, "Failed to find matching identity for meeting");
    return results[0];
  }

  /**
   * Assumes that the `original` property was set before
   */
  hasChanged(): boolean {
    return !!this.unedited && (
      this.calUID != this.unedited.calUID ||
      this.startTime?.getTime() != this.unedited.startTime?.getTime() ||
      this.endTime?.getTime() != this.unedited.endTime?.getTime() ||
      this.timezone != this.unedited.timezone ||
      this.allDay != this.unedited.allDay ||
      this.title != this.unedited.title ||
      this.descriptionText != this.unedited.descriptionText ||
      this.descriptionHTML != this.unedited.descriptionHTML ||
      this.location != this.unedited.location ||
      this.isOnline != this.unedited.isOnline ||
      this.onlineMeetingURL != this.unedited.onlineMeetingURL ||
      this.myParticipation != this.unedited.myParticipation ||
      this.participants.hasItems && (
        this.participants.length != this.unedited.participants.length ||
        this.participants.contents.some((pThis, i) =>
          pThis.emailAddress != this.unedited.participants.get(i).emailAddress)) ||
      this.recurrenceCase != this.unedited.recurrenceCase ||
      this.recurrenceRule != this.unedited.recurrenceRule ||
      this.alarm?.getTime() != this.unedited.alarm?.getTime()
    );
  }

  startEditing() {
    this.timezone ||= Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.unedited = this.calendar.newEvent();
    this.unedited.copyFrom(this);
  }
  finishEditing() {
    this.unedited = null;
  }

  createMeeting() {
    assert(this.participants.isEmpty, "This is already a meeting");
    assert(this.myParticipation <= InvitationResponse.Organizer, "Incoming invitation should already have participants");
    this.outgoingInvitation.createOrganizer();
  }

  /**
   * Saves the event locally to the database.
   */
  async save() {
    assert(this.calendar, "To save an event, it needs to be in a calendar first");
    assert(this.calendar.storage, "To save an event, the calendar needs to be saved first");
    await this.calendar.storage.saveEvent(this);
    for (let occurrence of this.instances) {
      if (occurrence && !occurrence.dbID) {
        occurrence.copyFromRecurrenceMaster(this);
      }
    }
    if (this.recurrenceCase == RecurrenceCase.Instance) {
      this.recurrenceCase = RecurrenceCase.Exception;
    }
  }

  async saveToServer(): Promise<void> {
    if (!this.participants.length || this.myParticipation > InvitationResponse.Organizer) {
      return;
    }
    if (!this.calUID) {
      this.calUID = crypto.randomUUID();
    }
    let { identity, participant, person } = this.participantMe();
    participant.response = InvitationResponse.Organizer;
    await this.outgoingInvitation.sendInvitations(identity.account, person);
  }

  get isNew(): boolean {
    return !this.dbID;
  }

  /**
   * Deletes the event locally from the database.
   */
  async deleteIt() {
    assert(this.calendar, "To delete an event, it needs to be in a calendar first");
    assert(this.calendar.storage, "To delete an event, the calendar needs to be saved first");
    if (this.dbID) {
      await this.calendar.storage.deleteEvent(this);
    }
    this.calendar.events.remove(this);
    this.calendar.events.removeAll(this.instances);
    if (this.parentEvent) {
      let pos = this.parentEvent.instances.indexOf(this);
      if (pos >= 0) {
        this.parentEvent.instances.set(pos, null);
        await this.calendar.storage.saveEvent(this.parentEvent);
      }
    }
  }

  async deleteFromServer(): Promise<void> {
    if (!this.participants.length) {
      return;
    }
    if (this.myParticipation == InvitationResponse.Organizer) {
      let { identity, person } = this.participantMe();
      await this.outgoingInvitation.sendCancellations(identity.account, person);
    } else if (this.myParticipation) {
      for (let participant of this.participants) {
        if (participant.response == InvitationResponse.Organizer) {
          await this.respondToInvitation(InvitationResponse.Decline);
        }
      }
    }
  }

  /** Person class needs to match account class, so need to clone.
   * @returns the new Person object */
  async moveToCalendar(newCalendar: Calendar): Promise<void> {
    if (this.calendar == newCalendar || !newCalendar) {
      return;
    }
    let newEvent = newCalendar.newEvent();
    if (Object.getPrototypeOf(this) == Object.getPrototypeOf(newEvent)) {
      this.calendar?.events.remove(this);
      this.calendar = newCalendar;
      newCalendar.events.add(this);
      await this.save();
      return;
    }
    newEvent.copyFrom(this);
    newEvent.calendar = newCalendar;
    this.calendar?.events.remove(this);
    newCalendar.events.add(newEvent);
    await this.deleteIt();
    await newEvent.save();
  }

  async respondToInvitation(response: InvitationResponseInMessage): Promise<void> {
    assert(this.myParticipation > InvitationResponse.Organizer, "Only invitations can be responded to");
    let accounts = appGlobal.emailAccounts.contents.filter(account => account.canSendInvitations && this.participants.some(participant => participant.response != InvitationResponse.Organizer && participant.emailAddress == account.emailAddress));
    assert(accounts.length == 1, "Failed to find matching account for invitation");
    let participant = this.participants.find(participant => participant.emailAddress == accounts[0].emailAddress);
    participant.response = response;
    await this.save();
    await this.sendInvitationResponse(response, accounts[0]);
  }

  async sendInvitationResponse(response: InvitationResponseInMessage, account: MailAccount) {
    let organizer = this.participants.find(participant => participant.response == InvitationResponse.Organizer);
    assert(organizer, "Invitation should have an organizer");
    let email = account.newEMailFrom();
    email.to.add(organizer);
    email.iCalMethod = "REPLY";
    email.event = new Event();
    email.event.copyFrom(this);
    email.event.participants.replaceAll([new Participant(account.emailAddress, null, response)]);
    if (email.event.descriptionText) {
      email.text = email.event.descriptionText;
      email.html = email.event.descriptionHTML;
    }
    await account.send(email);
  }

  /**
   * Ensures that all recurring instances exist up to the provided date.
   * Must only be called on recurring master events.
   */
  fillRecurrences(endDate: Date) {
    let newOccurrences: Event[] = [];
    let occurrences = this.recurrenceRule.getOccurrencesByDate(endDate);
    for (let i = 0; i < occurrences.length; i++) {
      if (this.instances.get(i) === undefined) {
        let occurrence = this.calendar.newEvent(this);
        occurrence.recurrenceCase = RecurrenceCase.Instance;
        occurrence.recurrenceStartTime = occurrences[i];
        occurrence.startTime = new Date(occurrences[i]); // Clone in case of exception
        occurrence.endTime = new Date(this.endTime.getTime() + occurrence.startTime.getTime() - this.startTime.getTime());
        if (this.alarm) {
          occurrence.alarm = new Date(this.alarm.getTime() + occurrence.startTime.getTime() - this.startTime.getTime());
        }
        this.instances.set(i, occurrence);
        newOccurrences.push(occurrence);
      }
    }
    this.calendar.events.addAll(newOccurrences);
  }

  clearExceptions() {
    this.calendar.events.removeAll(this.instances.contents.filter(Boolean));
    for (let event of this.instances) {
      if (event?.dbID) {
        this.calendar.storage.deleteEvent(event).catch(this.calendar.errorCallback);
      }
    }
    this.instances.clear();
  }

  /**
   * Removes any previous instance at that position from the calendar
   * (and also database when an exception subsequently becomes an exclusion).
   */
  replaceInstance(index: number, occurrence: Event) {
    let previous = this.instances.get(index);
    this.instances.set(index, occurrence);
    // There won't be a previous instance if this is a new recurring event
    // and we haven't filled its occurrences yet. Or, this might be an update
    // to a known existing exception.
    if (!previous || previous == occurrence) {
      return;
    }
    // Three cases remain:
    // 1. Deleting a filled instance.
    // 2. Replacing a filled instance with an exception.
    // 3. Deleting an exception. In this case, also need to delete from db.
    this.calendar.events.remove(previous);
    if (previous.dbID) {
      this.calendar.storage.deleteEvent(previous).catch(this.calendar.errorCallback);
    }
  }
}

export enum RecurrenceCase {
  /** Not recurring */
  Normal = "normal",
  /** Recurring Master event.
   * Contains the rules how to create the recurrence instances.
   * Not directly shown in the UI. */
  Master = "master",
  /** Recurrence Instance, generated from the master.
   * Only exists in RAM objects, not saved on server and in DB. */
  Instance = "instance",
  /** Recurrence Exception.
   * Like an instance, but at a different time or with modified properties.
   * Overrides a specific instance. */
  Exception = "exception",
}
