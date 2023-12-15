import type { Person } from "../Abstract/Person";
import { ArrayColl } from "svelte-collections";
import { assert } from "../util/util";

export class Event {
  id: string;
  title: string;
  descriptionText: string;
  descriptionHTML: string;

  startTime: Date;
  endTime: Date;
  allDay = false;
  repeat = false;
  alarm: Date = null;

  location: string;
  isOnline = false;
  isPresence = false;
  onlineMeetingURL: string;
  participants = new ArrayColl<Person>();
  lastMod = new Date();

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

  constructor() {
    this.id = crypto.randomUUID();
  }
}
