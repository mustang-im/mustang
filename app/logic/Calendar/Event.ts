import type { Person } from "../Abstract/Person";
import { ArrayColl } from "svelte-collections";
import { assert } from "../util/util";
import { Observable, notifyChangedProperty } from "../util/Observable";

export class Event extends Observable {
  readonly id: string;
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
  readonly participants = new ArrayColl<Person>();
  @notifyChangedProperty
  lastMod = new Date();

  constructor() {
    super();
    this.id = crypto.randomUUID();
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
}
