import { Event } from "../Event";

export class ExchangeEvent extends Event {
  // ActiveSync 16.x gives all-day events as a UTC-style string with no time
  // part and no time zone. This is special-cased in the ActiveSync code.
  // Other Exchange protocols provide a time zone and the time in UTC that
  // would be midnight in that time zone, but we need them to use local time.
  protected fixupExchangeAllDayEvent() {
    if (this.allDay && this.timezone) {
      this.startTime = new Date(this.startTime.toLocaleDateString('lt', { timeZone: this.timezone }) + "T00:00:00");
      this.endTime = new Date(this.endTime.toLocaleDateString('lt', { timeZone: this.timezone }) + "T00:00:00");
      this.timezone = null;
    }
  }
}
