import { Event } from "../Event";

export class ExchangeEvent extends Event {
  // Except for ActiveSync 16.x, whose all-day events are special-cased in
  // fromCompact(), Exchange provides a time zone and the time in UTC that
  // would be midnight in that time zone, but we need them to use local time.
  protected setAllDayTimeToLocalMidnight() {
    if (this.allDay && this.timezone) {
      this.startTime = new Date(this.startTime.toLocaleDateString('lt', { timeZone: this.timezone }) + "T00:00:00");
      this.endTime = new Date(this.endTime.toLocaleDateString('lt', { timeZone: this.timezone }) + "T00:00:00");
      this.timezone = null;
    }
  }
}
