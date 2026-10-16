import { WorkHours, kMinutesPerDay } from "../WorkHours";
import { ICalParser, type ICalContainer } from "../ICal/ICalParser";
import { line2ical } from "../ICal/ICalGenerator";
import { VTimezone } from "../ICal/VTimezone";
import { WindowsToIANATimezone } from "../ICal/WindowsTimezone";
import { iCalWeekday } from "../RecurrenceRule";
import { k1DayMS, k1MinuteMS, myTimezone } from "../../../frontend/Util/date";
import { appName } from "../../build";

/**
 * The work hours as `VAVAILABILITY` (RFC 7953), which CalDAV servers keep
 * in the `calendar-availability` property of the scheduling inbox of the user.
 *
 * It allows several time ranges per day, e.g. with a lunch break.
 * We keep them, as long as the user doesn't change the work hours of that day.
 */
export class CalDAVAvailability {
  /** Index 0 = Sunday */
  readonly periods: WorkTimeRange[][] = [[], [], [], [], [], [], []];
  /** IANA time zone */
  timezone: string = myTimezone();

  static fromICal(ical: string): CalDAVAvailability {
    let availability = new CalDAVAvailability();
    let parser = new ICalParser(ical);
    for (let available of parser.containers["available"] ?? []) {
      availability.addAvailable(available);
    }
    for (let day of availability.periods) {
      day.sort((a, b) => a.startMinutes - b.startMinutes);
    }
    return availability;
  }

  protected addAvailable(available: ICalContainer) {
    let dtstart = available.entries["dtstart"]?.[0];
    let rrule = available.entries["rrule"]?.[0]?.value;
    let byDay = /(?:^|;)BYDAY=([^;]+)/i.exec(rrule ?? "")?.[1];
    if (!dtstart || !/(?:^|;)FREQ=WEEKLY/i.test(rrule ?? "")) {
      return; // Only weekly repeating times are work hours
    }
    let start = CalDAVAvailability.parseDateTime(dtstart.value);
    if (!start) {
      return;
    }
    this.timezone = start.isUTC ? "UTC" : CalDAVAvailability.ianaTimezone(dtstart.properties["tzid"]);
    let startMinutes = start.minutes;
    let endMinutes: number;
    let dtend = available.entries["dtend"]?.[0];
    let duration = available.entries["duration"]?.[0];
    if (dtend) {
      let end = CalDAVAvailability.parseDateTime(dtend.value);
      let days = end ? Math.round((end.date.getTime() - start.date.getTime()) / k1DayMS) : 0;
      endMinutes = end ? days * kMinutesPerDay + end.minutes : startMinutes;
    } else if (duration) {
      endMinutes = startMinutes + CalDAVAvailability.parseDuration(duration.value);
    } else {
      return;
    }
    endMinutes = Math.min(endMinutes, kMinutesPerDay);
    if (endMinutes <= startMinutes) {
      return;
    }
    let weekdays = byDay
      ? byDay.split(",").map(day => iCalWeekday[day.trim().slice(-2).toUpperCase() as keyof typeof iCalWeekday])
      : [start.date.getUTCDay()];
    for (let weekday of weekdays) {
      if (weekday != null) {
        this.periods[weekday].push({ startMinutes, endMinutes });
      }
    }
  }

  /** One time range per day, from the start of the first range to the end of the last */
  toWorkHours(): WorkHours {
    let workHours = new WorkHours();
    workHours.timezone = this.timezone;
    for (let [weekday, day] of workHours.days.entries()) {
      let periods = this.periods[weekday];
      day.isWorkDay = periods.length > 0;
      if (periods.length) {
        day.startMinutes = Math.min(...periods.map(period => period.startMinutes));
        day.endMinutes = Math.max(...periods.map(period => period.endMinutes));
      }
    }
    return workHours;
  }

  /**
   * @param previous What the server has now, or null.
   *   For the days that the user didn't change, we keep all its time ranges.
   */
  static fromWorkHours(workHours: WorkHours, previous: CalDAVAvailability | null): CalDAVAvailability {
    let availability = new CalDAVAvailability();
    availability.timezone = workHours.timezone ?? myTimezone();
    let previousHours = previous?.timezone == availability.timezone ? previous.toWorkHours() : null;
    for (let [weekday, day] of workHours.days.entries()) {
      if (!day.isWorkDay || day.endMinutes <= day.startMinutes) {
        continue;
      }
      availability.periods[weekday] = previousHours?.days[weekday].equals(day)
        ? previous.periods[weekday]
        : [{ startMinutes: day.startMinutes, endMinutes: day.endMinutes }];
    }
    return availability;
  }

  toICal(): string {
    // A week in the past, for the start of the weekly repetition. Index 0 = Sunday.
    let referenceSunday = Date.UTC(2024, 0, 7);
    let now = CalDAVAvailability.utcDateTime(new Date());
    let lines: (string | string[])[] = [
      ["BEGIN", "VCALENDAR"],
      ["VERSION", "2.0"],
      ["PRODID", `-//Beonex//${appName}//EN`],
    ];
    let isUTC = this.timezone == "UTC";
    if (!isUTC) {
      lines.push(...new VTimezone(this.timezone, new Date(referenceSunday)).toICalLines());
    }
    lines.push(
      ["BEGIN", "VAVAILABILITY"],
      ["UID", crypto.randomUUID()],
      ["DTSTAMP", now]);
    let ranges = new Map<string, { range: WorkTimeRange, weekdays: number[] }>();
    for (let [weekday, periods] of this.periods.entries()) {
      for (let range of periods) {
        let key = range.startMinutes + "-" + range.endMinutes;
        if (!ranges.has(key)) {
          ranges.set(key, { range, weekdays: [] });
        }
        ranges.get(key).weekdays.push(weekday);
      }
    }
    for (let { range, weekdays } of ranges.values()) {
      let day = referenceSunday + weekdays[0] * k1DayMS;
      let start = CalDAVAvailability.localDateTime(new Date(day + range.startMinutes * k1MinuteMS));
      let end = CalDAVAvailability.localDateTime(new Date(day + range.endMinutes * k1MinuteMS));
      lines.push(
        ["BEGIN", "AVAILABLE"],
        ["UID", crypto.randomUUID()],
        ["DTSTAMP", now],
        isUTC ? ["DTSTART", start + "Z"] : ["DTSTART", "TZID", this.timezone, start],
        isUTC ? ["DTEND", end + "Z"] : ["DTEND", "TZID", this.timezone, end],
        // `RRULE` contains ";"s, which must not be escaped as normal text values
        `RRULE:FREQ=WEEKLY;BYDAY=${weekdays.map(weekday => iCalWeekday[weekday]).join(",")}\r\n`,
        ["END", "AVAILABLE"]);
    }
    lines.push(
      ["END", "VAVAILABILITY"],
      ["END", "VCALENDAR"]);
    return lines.map(line2ical).join("");
  }

  protected static parseDateTime(value: string): { date: Date, minutes: number, isUTC: boolean } | null {
    let match = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})\d{0,2}(Z?))?/.exec(value?.trim() ?? "");
    if (!match) {
      return null;
    }
    return {
      date: new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))),
      minutes: Number(match[4] ?? 0) * 60 + Number(match[5] ?? 0),
      isUTC: match[6] == "Z",
    };
  }

  protected static parseDuration(value: string): number {
    let match = /^P(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?)?/.exec(value?.trim() ?? "");
    if (!match) {
      return 0;
    }
    return Number(match[1] ?? 0) * 7 * kMinutesPerDay + Number(match[2] ?? 0) * kMinutesPerDay +
      Number(match[3] ?? 0) * 60 + Number(match[4] ?? 0);
  }

  protected static ianaTimezone(tzid: string | undefined): string {
    if (!tzid) {
      return myTimezone();
    }
    try {
      new Intl.DateTimeFormat("en", { timeZone: tzid });
      return tzid;
    } catch (ex) {
      return WindowsToIANATimezone[tzid] ?? myTimezone();
    }
  }

  /** `date` has the local time in its UTC fields */
  protected static localDateTime(date: Date): string {
    return date.toISOString().replace(/-|:|\..*/g, "");
  }

  protected static utcDateTime(date: Date): string {
    return CalDAVAvailability.localDateTime(date) + "Z";
  }
}

export interface WorkTimeRange {
  /** Minutes after midnight */
  startMinutes: number;
  endMinutes: number;
}
