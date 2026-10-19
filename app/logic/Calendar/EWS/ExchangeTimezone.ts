import { VTimezone, utcOffset } from "../ICal/VTimezone";
import { WindowsToIANATimezone } from "../ICal/WindowsTimezone";
import { k1MinuteMS, myTimezone } from "../../util/date";

/** Time zone rules as Windows and Exchange describe them:
 * an offset from UTC, and one yearly change to and from daylight saving time. */
export class ExchangeTimezone {
  /** Minutes to add to the local standard time to get UTC, e.g. -60 for Europe/Berlin */
  bias = 0;
  /** null, if the time zone has no daylight saving time */
  standard: ExchangeTimezoneChange | null = null;
  daylight: ExchangeTimezoneChange | null = null;

  /** How many minutes the local time is ahead of UTC at `time` */
  utcOffset(time: Date): number {
    if (!this.standard || !this.daylight) {
      return -this.bias;
    }
    let standardOffset = -(this.bias + this.standard.bias);
    let daylightOffset = -(this.bias + this.daylight.bias);
    let year = new Date(time.getTime() + standardOffset * k1MinuteMS).getUTCFullYear();
    let toDaylight = this.daylight.localTimeIn(year).getTime() - standardOffset * k1MinuteMS;
    let toStandard = this.standard.localTimeIn(year).getTime() - daylightOffset * k1MinuteMS;
    let ms = time.getTime();
    let isDaylight = toDaylight < toStandard
      ? ms >= toDaylight && ms < toStandard
      : ms >= toDaylight || ms < toStandard; // southern hemisphere
    return isDaylight ? daylightOffset : standardOffset;
  }

  static fromIANA(timezone: string, when = new Date()): ExchangeTimezone {
    let rules = new ExchangeTimezone();
    let observances = new VTimezone(timezone, when).observances;
    let standard = observances.find(observance => !observance.isDaylight);
    let daylight = observances.find(observance => observance.isDaylight);
    rules.bias = -standard.offsetTo;
    if (daylight) {
      rules.standard = ExchangeTimezoneChange.fromObservance(standard, 0);
      rules.daylight = ExchangeTimezoneChange.fromObservance(daylight, standard.offsetTo - daylight.offsetTo);
    }
    return rules;
  }

  /** The IANA time zone with the same rules, preferring the one of this computer */
  toIANA(): string {
    let now = new Date();
    let january = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
    let july = new Date(Date.UTC(now.getUTCFullYear(), 6, 1));
    let sameOffsets: string | null = null;
    for (let timezone of new Set([myTimezone(), ...Object.values(WindowsToIANATimezone)])) {
      try {
        if (utcOffset(january, timezone) != this.utcOffset(january) ||
            utcOffset(july, timezone) != this.utcOffset(july)) {
          continue;
        }
        sameOffsets ??= timezone;
        if (ExchangeTimezone.fromIANA(timezone, now).equals(this)) {
          return timezone;
        }
      } catch (ex) {
        // This JS engine doesn't know the time zone name
      }
    }
    if (sameOffsets) {
      return sameOffsets;
    }
    let hours = this.utcOffset(now) / 60;
    return Number.isInteger(hours) && hours != 0
      ? "Etc/GMT" + (hours > 0 ? "-" : "+") + Math.abs(hours) // The sign is inverted in these names
      : "UTC";
  }

  equals(rules: ExchangeTimezone): boolean {
    return this.bias == rules.bias &&
      !!this.daylight == !!rules.daylight &&
      (!this.daylight ||
        this.standard.equals(rules.standard) && this.daylight.equals(rules.daylight));
  }
}

export class ExchangeTimezoneChange {
  /** Minutes to add to the `bias` of the time zone after the change, e.g. -60 for summer time */
  bias = 0;
  /** 1 = January */
  month = 1;
  /** 1 to 4 = the first to 4th of these weekdays in the month, 5 = the last */
  week = 1;
  /** 0 = Sunday */
  weekday = 0;
  /** The local time when the change happens, as minutes after midnight, in the time before the change */
  minutes = 0;

  /** When the change happens in `year`, as local time in the UTC fields of the result */
  localTimeIn(year: number): Date {
    let firstWeekday = new Date(Date.UTC(year, this.month - 1, 1)).getUTCDay();
    let day = 1 + (this.weekday - firstWeekday + 7) % 7 + (this.week - 1) * 7;
    let daysInMonth = new Date(Date.UTC(year, this.month, 0)).getUTCDate();
    if (day > daysInMonth) {
      day -= 7;
    }
    return new Date(Date.UTC(year, this.month - 1, day, 0, this.minutes));
  }

  static fromObservance(observance: VTimezone["observances"][number], bias: number): ExchangeTimezoneChange {
    let change = new ExchangeTimezoneChange();
    change.bias = bias;
    change.month = observance.month;
    change.week = observance.nth < 0 ? 5 : observance.nth;
    change.weekday = observance.weekday;
    change.minutes = observance.start.getUTCHours() * 60 + observance.start.getUTCMinutes();
    return change;
  }

  equals(change: ExchangeTimezoneChange): boolean {
    return this.bias == change.bias &&
      this.month == change.month &&
      this.week == change.week &&
      this.weekday == change.weekday &&
      this.minutes == change.minutes;
  }
}
