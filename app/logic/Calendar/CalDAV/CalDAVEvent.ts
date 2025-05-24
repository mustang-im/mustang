import { Event } from "../Event";
import type { CalDAVCalendar } from "./CalDAVCalendar";
import { k1MinuteMS } from "../../../frontend/Util/date";
import type { ArrayColl } from "svelte-collections";

export class CalDAVEvent extends Event {
  declare calendar: CalDAVCalendar;
  declare parentEvent: CalDAVEvent;
  declare readonly instances: ArrayColl<CalDAVEvent | null | undefined>;

  get itemID(): string | null {
    return this.pID;
  }
  set itemID(val: string | null) {
    this.pID = val;
  }

  fromICS(ics: string) {
  }

  async saveToServer() {
  }

  async saveTask() {
  }

  dateString(date: Date, day: boolean = this.allDay): string {
    if (day) {
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
    return (this.alarm.getTime() - this.startTime.getTime()) / -k1MinuteMS | 0;
  }

  async deleteFromServer() {
  }
}
