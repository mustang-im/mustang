import type { PersonUID } from "../Abstract/PersonUID";
import type { Calendar } from "./Calendar";
import type { RecurrenceRule } from "./RecurrenceRule";
import { ArrayColl } from "svelte-collections";
import { assert, randomID } from "../util/util";
import { Observable, notifyChangedProperty } from "../util/Observable";

export class Event extends Observable {
  readonly id: string;
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
  @notifyChangedProperty
  recurrenceRule: RecurrenceRule | undefined;
  @notifyChangedProperty
  parentEvent: Event | undefined;
  /** in case a recurrence instance had its start time modified */
  recurrenceStartTime: Date | undefined;
  /** null means deleted instance, undefined means not filled yet */
  readonly instances: Array<Event | null | undefined> = [];
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
  lastMod = new Date();
  @notifyChangedProperty
  calendar: Calendar;

  constructor(calendar: Calendar, parentEvent?: Event) {
    super();
    this.id = randomID();
    this.calendar = calendar;
    if (parentEvent) {
      this.parentEvent = parentEvent;
      this.copyFromParent();
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

  copyFromParent() {
    let parentEvent = this.parentEvent;
    this.calUID = parentEvent.calUID;
    this.title = parentEvent.title;
    this.descriptionText = parentEvent.descriptionText;
    this.descriptionHTML = parentEvent.descriptionHTML;
    this.allDay = parentEvent.allDay;
    this.parentEvent = parentEvent;
    this.location = parentEvent.location;
    this.isOnline = parentEvent.isOnline;
    this.isPresence = parentEvent.isPresence;
    this.onlineMeetingURL = parentEvent.onlineMeetingURL;
    this.participants.replaceAll(parentEvent.participants);
  }

  async save() {
    assert(this.calendar, "To save an event, it needs to be in a calendar first");
    assert(this.calendar.storage, "To save an event, the calendar needs to be saved first");
    await this.calendar.storage.saveEvent(this);
    for (let occurrence of this.instances) {
      if (occurrence && !occurrence.dbID) {
        occurrence.copyFromParent();
      }
    }
  }

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
        this.parentEvent.instances[pos] = null;
        await this.calendar.storage.saveEvent(this.parentEvent);
      }
    }
  }

  clearExceptions() {
    this.calendar.events.removeAll(this.instances.filter(Boolean));
    for (let event of this.instances) {
      if (event?.dbID) {
        this.calendar.storage.deleteEvent(event);
      }
    }
    this.instances.length = 0;
  }

  /**
   * Removes any previous instance at that position from the calendar
   * (and also database when an exception subsequently becomes an exclusion).
   */
  replaceInstance(index: number, occurrence: Event) {
    let previous = this.instances[index];
    this.instances[index] = occurrence;
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
      this.calendar.storage.deleteEvent(previous);
    }
  }
}
