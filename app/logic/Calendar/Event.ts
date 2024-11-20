import type { PersonUID } from "../Abstract/PersonUID";
import type { Calendar } from "./Calendar";
import type { RecurrenceRule } from "./RecurrenceRule";
import type { Responses } from "../Mail/EMail";
import { ArrayColl } from "svelte-collections";
import { assert, randomID, AbstractFunction } from "../util/util";
import { Observable, notifyChangedProperty } from "../util/Observable";

/* Note: These are EWS/OWA names and ActiveSync values. */
export enum ResponseType {
  Unknown = 0,
  Organizer = 1,
  Tentative = 2,
  Accept = 3,
  Decline = 4,
  NoResponseReceived = 5,
}

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
  @notifyChangedProperty
  repeat = false;
  /** If `repeat` is set, should be the rule which describes the pattern. */
  @notifyChangedProperty
  recurrenceRule: RecurrenceRule | undefined;
  /** Links back to the recurring master from an instance. */
  @notifyChangedProperty
  parentEvent: Event | undefined;
  /**
   * If this is an instance of a recurring meeting (not the master),
   * then this is the instance's original start time.
   * The `startTime` may contain a modified time as an exception.
   * This allows us to work out the instance index of an exception,
   * even if its actual start time has been modified.
   */
  recurrenceStartTime: Date | undefined;
  /**
   * Holds child instances of a recurring event:
   * - undefined means that a recurring instance hasn't been generated yet
   * - null means that that the instance was excluded
   * - a saved event means that the instance is an exception
   * - an unsaved event means that the instance was auto-generated
   *
   * Note that the array may not be complete but `fillRecurrences`
   * will auto-generate additional instances if necessary.
   */
  readonly instances = new ArrayColl<Event | null | undefined>;
  @notifyChangedProperty
  alarm: Date = null;

  @notifyChangedProperty
  location: string;
  @notifyChangedProperty
  isOnline = false;
  @notifyChangedProperty
  isPresence = false;
  @notifyChangedProperty
  onlineMeetingURL: string;
  @notifyChangedProperty
  readonly participants = new ArrayColl<PersonUID>();
  @notifyChangedProperty
  response = ResponseType.Unknown;
  @notifyChangedProperty
  lastMod = new Date();
  @notifyChangedProperty
  calendar: Calendar;

  constructor(calendar?: Calendar, parentEvent?: Event) {
    super();
    this.id = randomID();
    this.calendar = calendar;
    if (parentEvent) {
      this.parentEvent = parentEvent;
      this.copyFrom(parentEvent);
    }
  }

  /** in seconds */
  get duration(): number {
    return (this.endTime.getTime() - this.startTime.getTime()) / 1000;
  }
  set duration(seconds: number) {
    assert(seconds >= 0, "Duration must be >= 0");
    this.endTime.setTime(this.startTime.getTime() + seconds * 1000);
  }

  /** in minutes */
  get durationMin(): number {
    return this.duration / 60;
  }
  set durationMin(minutes: number) {
    this.duration = minutes * 60;
  }

  /** in hours */
  get durationHours(): number {
    return this.duration / 3600;
  }
  set durationHours(hours: number) {
    this.duration = hours * 3600;
  }

  /** in hours */
  get durationDays(): number {
    return this.duration / 86400;
  }
  set durationDays(days: number) {
    this.duration = days * 86400;
  }

  /**
   * Used to update placeholder instances from their recurring master.
   * Copies the event properties that are shared between recurring instances.
   */
  copyFrom(original: Event) {
    this.calUID = original.calUID;
    this.title = original.title;
    this.descriptionText = original.descriptionText;
    this.descriptionHTML = original.descriptionHTML;
    this.allDay = original.allDay;
    this.location = original.location;
    this.isOnline = original.isOnline;
    this.isPresence = original.isPresence;
    this.onlineMeetingURL = original.onlineMeetingURL;
    this.participants.replaceAll(original.participants);
    this.response = original.response;
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
        occurrence.copyFrom(this);
      }
    }
  }

  async saveToServer(): Promise<void> {
    // nothing to do for local events
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
    // nothing to do for local events
  }

  async respondToInvitation(response: Responses): Promise<void> {
    assert(this.response > ResponseType.Organizer, "Only invitations can be responded to");
    throw new AbstractFunction();
  }

  protected async sendInvitationResponse(response: Responses): Promise<void> {
    throw new Error("Implement me!"); // TODO
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
