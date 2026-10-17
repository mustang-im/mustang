import type { Event } from "../../../../logic/Calendar/Event";
import type { TSMLMeetingTimeVote, TSMLMeetingTimePreference } from "../../../../logic/Mail/SML/TSML";
import { getDateTimeLocale } from "../../../../l10n/l10n";

export interface TimeOptionDay {
  day: Date;
  times: Date[];
}

export class SMLTimeOptions {
  static byDay(options: Date[]): TimeOptionDay[] {
    let days: TimeOptionDay[] = [];
    let sorted = [...options].sort((a, b) => a.getTime() - b.getTime());
    for (let time of sorted) {
      let day = new Date(time.getFullYear(), time.getMonth(), time.getDate());
      let last = days[days.length - 1];
      if (last?.day.getTime() == day.getTime()) {
        last.times.push(time);
      } else {
        days.push({ day, times: [time] });
      }
    }
    return days;
  }

  static dayLabel(day: Date, locale = getDateTimeLocale()): string {
    return day.toLocaleDateString(locale, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  }

  static end(start: Date, durationMinutes: number): Date {
    return new Date(start.getTime() + durationMinutes * 60000);
  }

  static conflicts(start: Date, durationMinutes: number, events: Iterable<Event>): Event[] {
    let end = SMLTimeOptions.end(start, durationMinutes);
    let found: Event[] = [];
    for (let event of events) {
      if (event.allDay || event.isCancelled || !event.startTime || !event.endTime) {
        continue;
      }
      if (event.startTime < end && event.endTime > start) {
        found.push(event);
      }
    }
    return found.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }

  static preference(votes: TSMLMeetingTimeVote[], time: Date): TSMLMeetingTimePreference | null {
    return votes?.find(vote => vote.time?.getTime() == time.getTime())?.preference ?? null;
  }

  static vote(votes: TSMLMeetingTimeVote[], time: Date, preference: TSMLMeetingTimePreference): void {
    let index = votes.findIndex(vote => vote.time?.getTime() == time.getTime());
    if (index >= 0) {
      votes.splice(index, 1);
    }
    votes.push({ time, preference } as TSMLMeetingTimeVote);
  }

  static has(options: Date[], time: Date): boolean {
    return options.some(option => option.getTime() == time.getTime());
  }

  static add(options: Date[], time: Date): void {
    if (SMLTimeOptions.has(options, time)) {
      return;
    }
    options.push(time);
    options.sort((a, b) => a.getTime() - b.getTime());
  }

  static remove(options: Date[], time: Date): void {
    let index = options.findIndex(option => option.getTime() == time.getTime());
    if (index >= 0) {
      options.splice(index, 1);
    }
  }

  static nextOption(options: Date[], durationMinutes: number, now = new Date()): Date {
    if (options.length) {
      let last = options.reduce((latest, option) => option > latest ? option : latest);
      return SMLTimeOptions.end(last, durationMinutes);
    }
    let next = new Date(now);
    next.setMinutes(0, 0, 0);
    next.setHours(next.getHours() + 1);
    next.setDate(next.getDate() + 1);
    return next;
  }
}
