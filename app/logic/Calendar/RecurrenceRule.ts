import { sanitize } from "../../../lib/util/sanitizeDatatypes";

export enum Frequency {
  None = "NONE",
  Daily = "DAILY",
  Weekly = "WEEKLY",
  Monthly = "MONTHLY",
  Yearly = "YEARLY",
}

/**
 * Maps between pretty names (also used by Exchange) and
 * JavaScript day of week values (as returned by getDay)
 */
export enum Weekday {
  Sunday = 0,
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
}

/** Maps between iCal names and JavaScript day of week values */
export enum iCalWeekday {
  SU = 0,
  MO = 1,
  TU = 2,
  WE = 3,
  TH = 4,
  FR = 5,
  SA = 6,
}

/**
 * This class does not support all RFC 5545 recurrence rule parts, only
 * FREQ UNTIL COUNT INTERVAL and BYDAY.
 * It does still support more rules than Exchange Server supports;
 * Exchange Server does not support yearly intervals other than 1,
 * nor does it support multiple weekdays except for weekly intervals.
 * The Outlook Web Access UI does allow a daily recurrence on specific weekdays,
 * but this is just a weekly recurrence with an interval of 1.
 */
export interface RecurrenceInit {
  /**
   * The date of the first occurrence; the same as the master event date.
   */
  startDate: Date;
  /**
   * The date beyond which the recurrence stops.
   * If you also provide the count, the earlier is used.
   */
  endDate?: Date;
  /**
   * The number of occurrences beyond which the recurrence stops.
   * If also provide the end date, the earlier is used.
   */
  count?: number;
  /**
   * The base time period of the pattern.
   */
  frequency: Frequency;
  /**
   * The interval between occurrences.
   * Note that in the case of occurrences that can happen multiple times in
   * a given week, this is the interval between each set of occurrences.
   */
  interval?: number;
  /**
   * Limits occurrences to those that happen on these days of the week.
   */
  weekdays?: Weekday[];
  /**
   * The week of the month; 5 means the last week in the month.
   * Applies to monthly and yearly repeating rules.
   */
  week?: number;
  /**
   * The first day of the week. Only affects weekly recurrences with multiple
   * days of the week and an interval. Defaults to Monday.
   */
  first?: Weekday;
}

export class RecurrenceRule implements Readonly<RecurrenceInit> {
  readonly startDate!: Date;
  readonly endDate: Date | null = null;
  readonly count: number = Infinity;
  readonly frequency!: Frequency;
  readonly interval: number = 1;
  readonly weekdays: Weekday[] | null = null;
  readonly week: number = 0;
  readonly first: Weekday = Weekday.Monday;
  /** The occurrences that have already been calculated. */
  readonly occurrences: Date[] = [];
  /**
   * The intended date fields of the last calculated occurrence.
   * The day will be different if the occurrence happened in a short month.
   */
  weekday: number;
  year: number;
  month: number;
  day: number;
  hours: number;
  minutes: number;
  seconds: number;

  constructor(data: RecurrenceInit) {
    Object.assign(this, data);
    // EditEvent mutates the start time, so clone it to be safe.
    let startDate = this.startDate = new Date(this.startDate);
    this.occurrences.push(startDate);
    this.weekday = startDate.getDay();
    this.year = startDate.getFullYear();
    this.month = startDate.getMonth();
    this.day = startDate.getDate();
    this.hours = startDate.getHours();
    this.minutes = startDate.getMinutes();
    this.seconds = startDate.getSeconds();
    // this.fillOccurrences(this.count, this.endDate || new Date(Date.now() + 1e11));
  }

  static fromCalString(startDate: Date, calString: string): RecurrenceRule {
    if (!/^RRULE:/i.test(sanitize.string(calString))) {
      throw new Error("Malformed recurrence rule string missing RRULE:");
    }
    let { FREQ: frequency, UNTIL: endDate, COUNT: count, INTERVAL: interval, BYDAY: byday, WKST: first } = Object.fromEntries(calString.slice(6).toUpperCase().split(";").map(part => part.split("=")));
    if (!Object.values(Frequency).includes(frequency)) {
      throw new Error(`Malformed ${frequency} frequency recurrence rule string`);
    }
    let data: RecurrenceInit = { startDate, frequency };
    if (endDate) {
      data.endDate = sanitizeCalDate(endDate);
      if (data.endDate < data.startDate) {
        throw new Error("Malformed end date in recurrence rule string");
      }
    }
    if (count) {
      data.count = sanitize.integerRange(count, 1, Infinity);
    }
    if (interval) {
      data.interval = sanitize.integerRange(interval, 1, Infinity);
    }
    if (byday) {
      if (byday.startsWith("-1")) {
        data.week = 5;
        byday = byday.replace(/-1/g, "");
      } else if (/^[1-4]/.test(byday)) {
        data.week = sanitize.integer(byday[0]);
        byday = byday.split(byday[0]).join("");
      }
      data.weekdays = byday.split(",").map(day => iCalWeekday[day]);
      for (let day of data.weekdays) {
        sanitize.integer(day);
      }
    }
    if (first) {
      data.first = sanitize.integer(iCalWeekday[first]);
    }
    return new RecurrenceRule(data);
  }

  getCalString(allDay: boolean): string {
    let rule: { FREQ: string, UNTIL?: string, COUNT?: number, INTERVAL?: number, BYDAY?: string, WKST?: string } = { FREQ: this.frequency };
    if (this.endDate) {
      rule.UNTIL = this.endDate.toISOString().replace(/-|:|\..../g, "").slice(0, allDay ? 8 : 16);
    }
    if (this.count != Infinity) {
      rule.COUNT = this.count;
    }
    if (this.interval > 1) {
      rule.INTERVAL = this.interval;
    }
    if (this.weekdays) {
      let weekstr = String((this.week + 1) % 6 - 1 || "");
      rule.BYDAY = this.weekdays.map(day => weekstr + iCalWeekday[day]).join(",");
    }
    if (this.first != Weekday.Monday) {
      rule.WKST = iCalWeekday[this.first];
    }
    return 'RRULE:' + Object.entries(rule).map(entry => entry.join("=")).join(";");
  }

  /**
   * Checks whether this rule will invalidate existing occurrences.
   * We don't check the series length though, as the UI never sets one.
   */
  isCompatible(rule: RecurrenceRule) {
    let allWeekdays = [0, 1, 2, 3, 4, 5, 6];
    let thisWeekdays = this.weekdays || allWeekdays;
    let ruleWeekdays = rule.weekdays || allWeekdays;
    return rule.startDate.getTime() == this.startDate.getTime() && rule.frequency == this.frequency && rule.interval == this.interval && rule.week == this.week && rule.first == this.first && allWeekdays.every(weekday => ruleWeekdays.includes(weekday) == thisWeekdays.includes(weekday));
  }

  getOccurrencesByDate(endDate: Date, startDate: Date = this.startDate): Date[] {
    if (this.endDate && this.endDate < endDate) {
      endDate = this.endDate;
    }
    if (this.occurrences.length < this.count && this.occurrences.at(-1)! < endDate) {
      this.fillOccurrences(this.count, endDate);
    }
    return this.occurrences.filter(date => date >= startDate && date <= endDate);
  }

  /** 1-indexed */
  getOccurrenceByIndex(index: number): Date | void {
    if (index > this.count) {
      return;
    }
    if (this.occurrences.length < index) {
      this.fillOccurrences(index);
    }
    return this.occurrences[index - 1];
  }

  fillOccurrences(count: number, endDate?: Date) {
    while (this.occurrences.length < count) {
      switch (this.frequency) {
      case Frequency.Daily:
        this.day += this.interval;
        break;
      case Frequency.Weekly:
        if (!this.weekdays) {
          // optimisation for when the event only happens once per week
          this.day += this.interval * 7;
        } else {
          this.day++;
          this.weekday = (this.weekday + 1) % 7;
          if (this.weekday == this.first) {
            this.day += (this.interval - 1) * 7;
          }
        };
        break;
      case Frequency.Monthly:
        if (!this.weekdays) {
          this.month += this.interval;
        } else {
          this.day++;
          if (this.day > this.week * 7) {
            this.month += this.interval;
            this.day -= 7;
          }
        }
        break;
      case Frequency.Yearly:
        if (!this.weekdays) {
          this.year += this.interval;
        } else {
          this.day++;
          if (this.day > this.week * 7) {
            this.year += this.interval;
            this.day -= 7;
          }
        }
        break;
      }
      let occurrence = new Date(this.year, this.month, this.day, this.hours, this.minutes, this.seconds);
      if (this.week == 5 && occurrence.getDate() != this.day) {
        // Month ran out of days. Advance to the next month/year.
        if (this.frequency == Frequency.Yearly) {
          this.year += this.interval;
        } else {
          this.month += this.interval;
        }
        occurrence.setFullYear(this.year);
        occurrence.setMonth(this.month);
        // Temporarily advance to the next month.
        occurrence.setDate(32);
        // Rewind to the last week of the month.
        occurrence.setDate(-6);
        this.day = occurrence.getDate();
      }
      if (endDate && occurrence > endDate) {
        break;
      }
      if (this.weekdays && !this.weekdays.includes(occurrence.getDay())) {
        continue;
      }
      if ((this.frequency == Frequency.Yearly || this.frequency == Frequency.Monthly) && occurrence.getDate() != this.day) {
        // Ran out of days in the month, so rewind to the last day in the month.
        occurrence.setDate(0);
      }
      this.occurrences.push(occurrence);
    }
  }
}

function sanitizeCalDate(dateStr: string) {
  if (/^\d{8}$/.test(dateStr)) {
    dateStr = dateStr.replace(/(....)(..)(..)/, "$1-$2-$3T23:59:59");
  } else if (/^\d{8}T\d{6}Z?$/.test(dateStr)) {
    dateStr = dateStr.replace(/(....)(..)(..T..)(..)(..)/, "$1-$2-$3:$4:$5");
  }
  return sanitize.date(dateStr);
}
