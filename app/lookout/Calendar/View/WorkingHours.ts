import type { Calendar } from "../../../logic/Calendar/Calendar";
import { WorkHours, kMinutesPerDay } from "../../../logic/Calendar/WorkHours";
import { derived, type Readable } from "svelte/store";

export interface MinuteRange {
  from: number;
  to: number;
}

export class WorkingHours {
  static readonly kDefaultStartHour = 8;
  readonly list: WorkHours[];

  constructor(list: WorkHours[]) {
    this.list = list;
  }

  static of(calendar: Calendar): Readable<WorkingHours> {
    return derived(calendar as Readable<Calendar>, changed => WorkingHours.ofCalendar(changed));
  }

  static ofAll(workHours: Readable<WorkHours[]>): Readable<WorkingHours> {
    return derived(workHours, list => new WorkingHours(list));
  }

  static ofCalendar(calendar: Calendar | null): WorkingHours {
    return new WorkingHours(calendar?.workHours ? [ calendar.workHours ] : []);
  }

  static combined(all: WorkingHours[]): WorkingHours {
    return new WorkingHours([ ...new Set(all.flatMap(workingHours => workingHours.list)) ]);
  }

  get isKnown(): boolean {
    return this.list.length > 0;
  }

  offWorkMinutes(day: Date): MinuteRange[] {
    if (!this.isKnown) {
      return [];
    }
    let dayStart = WorkingHours.dayStart(day);
    let dayEnd = WorkingHours.dayStart(day, 1);
    return WorkHours.offWorkPeriodsOfAll(this.list, dayStart, dayEnd)
      .map(period => ({
        from: WorkingHours.minuteOfDay(period.start, dayEnd),
        to: WorkingHours.minuteOfDay(period.end, dayEnd),
      }))
      .filter(range => range.to > range.from);
  }

  workStart(day: Date): Date | null {
    let starts = this.list
      .flatMap(workHours => workHours.workPeriods(WorkingHours.dayStart(day), WorkingHours.dayStart(day, 1)))
      .map(period => period.start.getTime());
    return starts.length ? new Date(Math.min(...starts)) : null;
  }

  workStartOrDefault(day: Date): Date {
    return this.workStart(day) ?? new Date(day.getFullYear(), day.getMonth(), day.getDate(), WorkingHours.kDefaultStartHour);
  }

  firstWorkMinute(days: Date[]): number {
    let dayEnds = days.map(day => WorkingHours.dayStart(day, 1));
    let minutes = days
      .map((day, d) => ({ start: this.workStart(day), dayEnd: dayEnds[d] }))
      .filter(entry => entry.start)
      .map(entry => WorkingHours.minuteOfDay(entry.start, entry.dayEnd));
    return minutes.length ? Math.min(...minutes) : WorkingHours.kDefaultStartHour * 60;
  }

  workDays(): boolean[] | null {
    if (!this.isKnown) {
      return null;
    }
    return Array.from({ length: 7 }, (_, weekday) =>
      this.list.some(workHours => workHours.days[weekday].isWorkDay));
  }

  static workStartOf(calendar: Calendar | null, day: Date): Date {
    return WorkingHours.ofCalendar(calendar).workStartOrDefault(day);
  }

  protected static dayStart(day: Date, addDays = 0): Date {
    return new Date(day.getFullYear(), day.getMonth(), day.getDate() + addDays);
  }

  protected static minuteOfDay(time: Date, dayEnd: Date): number {
    if (time >= dayEnd) {
      return kMinutesPerDay;
    }
    return time.getHours() * 60 + time.getMinutes();
  }
}
