import { sanitize } from "../../../lib/util/sanitizeDatatypes";

export enum Frequency {
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

  constructor(data: RecurrenceInit) {
    Object.assign(this, data);
    // EditEvent mutates the start time, so clone it to be safe.
    this.occurrences.push(this.startDate = new Date(this.startDate));
    // this.fillOccurrences(this.count, this.endDate || new Date(Date.now() + 1e11));
  }

  static fromCalString(startDate: Date, calString: string): RecurrenceRule {
    if (!sanitize.string(calString).startsWith("RRULE:")) {
      throw new Error("Malformed recurrence rule string missing RRULE:");
    }
    let { FREQ: frequency, UNTIL: endDate, COUNT: count, INTERVAL: interval, BYDAY: byday, WKST: first } = Object.fromEntries(calString.slice(6).split(";").map(part => part.split("=")));
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

  getCalString(): string {
    let rule: { FREQ: string, UNTIL?: string, COUNT?: number, INTERVAL?: number, BYDAY?: string, WKST?: string } = { FREQ: this.frequency };
    if (this.endDate) {
      rule.UNTIL = this.endDate.toISOString().replace(/\W/g, "").slice(0, 15);
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

  getOccurrencesByDate(endDate: Date, startDate: Date = this.startDate) {
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
    let startDate = this.occurrences.at(-1)!;
    let weekday = startDate.getDay();
    let year = startDate.getFullYear();
    let month = startDate.getMonth();
    let day = startDate.getDate();
    let hours = startDate.getHours();
    let minutes = startDate.getMinutes();
    let seconds = startDate.getSeconds();
    while (this.occurrences.length < count) {
      switch (this.frequency) {
      case Frequency.Daily:
        day += this.interval;
        break;
      case Frequency.Weekly:
        if (!this.weekdays) {
          // optimisation for when the event only happens once per week
          day += this.interval * 7;
        } else {
          day++;
          weekday = (weekday + 1) % 7;
          if (weekday == this.first) {
            day += (this.interval - 1) * 7;
          }
        };
        break;
      case Frequency.Monthly:
        if (!this.weekdays) {
          month += this.interval;
        } else {
          day++;
          if (day > this.week * 7) {
            month += this.interval;
            day -= 7;
          }
        }
        break;
      case Frequency.Yearly:
        if (!this.weekdays) {
          year += this.interval;
        } else {
          day++;
          if (day > this.week * 7) {
            year += this.interval;
            day -= 7;
          }
        }
        break;
      }
      let occurrence = new Date(year, month, day, hours, minutes, seconds);
      if (this.week == 5 && occurrence.getDate() != day) {
        // Month ran out of days. Advance to the next month/year.
        if (this.frequency == Frequency.Yearly) {
          year += this.interval;
        } else {
          month += this.interval;
        }
        occurrence.setFullYear(year);
        occurrence.setMonth(month);
        // Temporarily advance to the next month.
        occurrence.setDate(32);
        // Rewind to the last week of the month.
        occurrence.setDate(-6);
        day = occurrence.getDate();
      }
      if (endDate && occurrence > endDate) {
        break;
      }
      if (this.weekdays && !this.weekdays.includes(occurrence.getDay())) {
        continue;
      }
      if ((this.frequency == Frequency.Yearly || this.frequency == Frequency.Monthly) && occurrence.getDate() != day) {
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
