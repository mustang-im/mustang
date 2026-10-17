import { utcOffset } from "./ICal/VTimezone";
import { Observable, notifyChangedProperty } from "../util/Observable";
import { k1DayMS, k1MinuteMS, myTimezone } from "../../frontend/Util/date";
import { sanitize } from "../../../lib/util/sanitizeDatatypes";

export class WorkHours extends Observable {
  /** Index 0 = Sunday, as `Date.getDay()` */
  readonly days: WorkDay[] = [];
  /** IANA time zone of the work times, e.g. "Europe/Berlin".
   * null = the time zone of this computer */
  @notifyChangedProperty
  timezone: string | null = null;

  constructor() {
    super();
    for (let weekday = 0; weekday < 7; weekday++) {
      let day = new WorkDay(weekday >= 1 && weekday <= 5);
      day.subscribe(() => this.notifyObservers("days"));
      this.days.push(day);
    }
  }

  workPeriods(from: Date, to: Date): WorkPeriod[] {
    let timezone = this.timezone == myTimezone() ? null : this.timezone;
    let periods: WorkPeriod[] = [];
    let date = ZonedDate.of(new Date(from.getTime() - k1DayMS), timezone);
    let lastDate = ZonedDate.of(new Date(to.getTime() + k1DayMS), timezone);
    for (; !date.isAfter(lastDate); date = date.nextDay()) {
      let day = this.days[date.weekday];
      if (!day.isWorkDay || day.endMinutes <= day.startMinutes) {
        continue;
      }
      let start = date.at(day.startMinutes, timezone);
      let end = date.at(day.endMinutes, timezone);
      if (end <= from || start >= to) {
        continue;
      }
      periods.push({
        start: start < from ? from : start,
        end: end > to ? to : end,
      });
    }
    return periods;
  }

  offWorkPeriods(from: Date, to: Date): WorkPeriod[] {
    return WorkHours.offWorkPeriodsOfAll([this], from, to);
  }

  /** The times between `from` and `to` when none of `workHoursList` works */
  static offWorkPeriodsOfAll(workHoursList: WorkHours[], from: Date, to: Date): WorkPeriod[] {
    let workPeriods = workHoursList
      .flatMap(workHours => workHours.workPeriods(from, to))
      .sort((a, b) => a.start.getTime() - b.start.getTime());
    let offWork: WorkPeriod[] = [];
    let offWorkStart = from;
    for (let period of workPeriods) {
      if (period.start > offWorkStart) {
        offWork.push({ start: offWorkStart, end: period.start });
      }
      if (period.end > offWorkStart) {
        offWorkStart = period.end;
      }
    }
    if (offWorkStart < to) {
      offWork.push({ start: offWorkStart, end: to });
    }
    return offWork;
  }

  isWorkTime(time: Date): boolean {
    return this.workPeriods(time, new Date(time.getTime() + 1)).length > 0;
  }

  copyFrom(source: WorkHours) {
    this.timezone = source.timezone;
    for (let [weekday, day] of this.days.entries()) {
      day.copyFrom(source.days[weekday]);
    }
  }

  equals(workHours: WorkHours): boolean {
    return this.timezone == workHours.timezone &&
      this.days.every((day, weekday) => day.equals(workHours.days[weekday]));
  }

  fromJSON(json: any) {
    this.timezone = sanitize.string(json?.timezone, null);
    for (let [weekday, day] of this.days.entries()) {
      let dayJSON = json?.days?.[weekday];
      if (!dayJSON) {
        continue;
      }
      day.isWorkDay = sanitize.boolean(dayJSON.isWorkDay, day.isWorkDay);
      day.startMinutes = sanitize.integerRange(dayJSON.startMinutes, 0, kMinutesPerDay, day.startMinutes);
      day.endMinutes = sanitize.integerRange(dayJSON.endMinutes, 0, kMinutesPerDay, day.endMinutes);
    }
  }

  toJSON(): any {
    return {
      timezone: this.timezone,
      days: this.days.map(day => ({
        isWorkDay: day.isWorkDay,
        startMinutes: day.startMinutes,
        endMinutes: day.endMinutes,
      })),
    };
  }
}

export class WorkDay extends Observable {
  @notifyChangedProperty
  isWorkDay: boolean;
  /** Minutes after midnight */
  @notifyChangedProperty
  startMinutes: number;
  /** Minutes after midnight. 24 * 60 = until midnight */
  @notifyChangedProperty
  endMinutes: number;

  constructor(isWorkDay: boolean, startMinutes = 8 * 60, endMinutes = 17 * 60) {
    super();
    this.isWorkDay = isWorkDay;
    this.startMinutes = startMinutes;
    this.endMinutes = endMinutes;
  }

  copyFrom(source: WorkDay) {
    this.isWorkDay = source.isWorkDay;
    this.startMinutes = source.startMinutes;
    this.endMinutes = source.endMinutes;
  }

  equals(day: WorkDay): boolean {
    return this.isWorkDay == day.isWorkDay &&
      this.startMinutes == day.startMinutes &&
      this.endMinutes == day.endMinutes;
  }
}

export interface WorkPeriod {
  start: Date;
  end: Date;
}

export const kMinutesPerDay = 24 * 60;

class ZonedDate {
  readonly year: number;
  readonly month: number;
  readonly day: number;

  constructor(year: number, month: number, day: number) {
    let date = new Date(Date.UTC(year, month, day));
    this.year = date.getUTCFullYear();
    this.month = date.getUTCMonth();
    this.day = date.getUTCDate();
  }

  static of(time: Date, timezone: string | null): ZonedDate {
    if (!timezone) {
      return new ZonedDate(time.getFullYear(), time.getMonth(), time.getDate());
    }
    let local = new Date(time.getTime() + utcOffset(time, timezone) * k1MinuteMS);
    return new ZonedDate(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate());
  }

  get weekday(): number {
    return new Date(Date.UTC(this.year, this.month, this.day)).getUTCDay();
  }

  nextDay(): ZonedDate {
    return new ZonedDate(this.year, this.month, this.day + 1);
  }

  isAfter(date: ZonedDate): boolean {
    return Date.UTC(this.year, this.month, this.day) > Date.UTC(date.year, date.month, date.day);
  }

  at(minutes: number, timezone: string | null): Date {
    if (!timezone) {
      return new Date(this.year, this.month, this.day, 0, minutes);
    }
    let wallClock = Date.UTC(this.year, this.month, this.day, 0, minutes);
    // The UTC offset at the result may differ from the one at the wall clock time read as UTC
    let guess = new Date(wallClock - utcOffset(new Date(wallClock), timezone) * k1MinuteMS);
    return new Date(wallClock - utcOffset(guess, timezone) * k1MinuteMS);
  }
}
