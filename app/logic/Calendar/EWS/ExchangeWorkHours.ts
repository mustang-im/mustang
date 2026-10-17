import { WorkHours, kMinutesPerDay } from "../WorkHours";
import { ExchangeTimezone, ExchangeTimezoneChange } from "./ExchangeTimezone";
import { IANAToWindowsTimezone, WindowsToIANATimezone } from "../ICal/WindowsTimezone";
import { myTimezone } from "../../../frontend/Util/date";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { ensureArray } from "../../util/util";

/**
 * The work hours as Exchange has them: one time range for all work days.
 *
 * Exchange stores them in the user configuration `WorkHours` of the calendar
 * folder, as XML of the schema `WorkingHours.xsd`, and returns them for other
 * people in the free/busy responses.
 */
export class ExchangeWorkHours {
  static readonly configurationName = "WorkHours";
  static readonly configurationFolder = "calendar";
  /** Bit field: 1 = Sunday, 2 = Monday, 4 = Tuesday, ... 64 = Saturday */
  workDays = 0;
  startMinutes = 8 * 60;
  endMinutes = 17 * 60;
  /** IANA time zone */
  timezone: string;

  static fromWorkHours(workHours: WorkHours): ExchangeWorkHours {
    let exchange = new ExchangeWorkHours();
    exchange.timezone = workHours.timezone ?? myTimezone();
    let workDays = workHours.days.filter(day => day.isWorkDay && day.endMinutes > day.startMinutes);
    for (let [weekday, day] of workHours.days.entries()) {
      if (workDays.includes(day)) {
        exchange.workDays |= 1 << weekday;
      }
    }
    if (workDays.length) {
      // Exchange has only one time range for all work days, so use the longest work day
      exchange.startMinutes = Math.min(...workDays.map(day => day.startMinutes));
      exchange.endMinutes = Math.max(...workDays.map(day => day.endMinutes));
    }
    return exchange;
  }

  toWorkHours(): WorkHours {
    let workHours = new WorkHours();
    workHours.timezone = this.timezone;
    for (let [weekday, day] of workHours.days.entries()) {
      day.isWorkDay = !!(this.workDays & (1 << weekday));
      day.startMinutes = this.startMinutes;
      day.endMinutes = this.endMinutes;
    }
    return workHours;
  }

  /** Exchange has `workHours` already, apart from the details that it can't store */
  isSummaryOf(workHours: WorkHours): boolean {
    let summary = ExchangeWorkHours.fromWorkHours(workHours);
    return summary.workDays == this.workDays &&
      summary.startMinutes == this.startMinutes &&
      summary.endMinutes == this.endMinutes &&
      summary.timezone == this.timezone;
  }

  static fromXML(xml: string): ExchangeWorkHours | null {
    let document = new DOMParser().parseFromString(xml, "text/xml");
    let version1 = document.getElementsByTagName("WorkHoursVersion1")[0];
    let timeSlot = version1?.getElementsByTagName("TimeSlot")[0];
    if (!timeSlot) {
      return null;
    }
    let workHours = new ExchangeWorkHours();
    workHours.workDays = ExchangeWorkHours.workDaysFromNames(ExchangeWorkHours.childText(version1, "WorkDays"));
    workHours.startMinutes = ExchangeWorkHours.minutesFromTimeSpan(ExchangeWorkHours.childText(timeSlot, "Start"));
    workHours.endMinutes = ExchangeWorkHours.minutesFromTimeSpan(ExchangeWorkHours.childText(timeSlot, "End"));
    let timezone = version1.getElementsByTagName("TimeZone")[0];
    let name = ExchangeWorkHours.childText(timezone, "Name");
    workHours.timezone = WindowsToIANATimezone[name] ??
      (timezone ? ExchangeWorkHours.timezoneFromXML(timezone).toIANA() : myTimezone());
    return workHours;
  }

  /**
   * @param previousXML What the server has now, or null.
   *   If the time zone did not change, we keep it exactly as it is on the server.
   */
  toXML(previousXML: string | null): string {
    let timezoneXML: string | null = null;
    if (previousXML && ExchangeWorkHours.fromXML(previousXML)?.timezone == this.timezone) {
      let previous = new DOMParser().parseFromString(previousXML, "text/xml");
      let timezone = previous.getElementsByTagName("TimeZone")[0];
      timezoneXML = timezone ? ExchangeWorkHours.innerXML(timezone) : null;
    }
    timezoneXML ??= ExchangeWorkHours.timezoneToXML(this.timezone);
    return `<?xml version="1.0"?>` +
      `<Root xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns="WorkingHours.xsd">` +
      `<WorkHoursVersion1>` +
      `<TimeZone>${timezoneXML}</TimeZone>` +
      `<TimeSlot>` +
      `<Start>${ExchangeWorkHours.minutesToTimeSpan(this.startMinutes)}</Start>` +
      `<End>${ExchangeWorkHours.minutesToTimeSpan(this.endMinutes)}</End>` +
      `</TimeSlot>` +
      `<WorkDays>${ExchangeWorkHours.workDaysToNames(this.workDays)}</WorkDays>` +
      `</WorkHoursVersion1>` +
      `</Root>`;
  }

  /** From the `WorkingHours` of an EWS `GetUserAvailability` response, after `XML2JSON()`
   * @returns null, if the response has no work hours */
  static fromEWSAvailability(json: any): ExchangeWorkHours[] | null {
    let periods = ensureArray(json?.WorkingPeriodArray?.WorkingPeriod).filter(period => period);
    if (!periods.length) {
      return null;
    }
    let timezone = ExchangeWorkHours.timezoneFromEWS(json.TimeZone).toIANA();
    return periods.map(period => {
      let workHours = new ExchangeWorkHours();
      workHours.timezone = timezone;
      workHours.workDays = ExchangeWorkHours.workDaysFromNames(sanitize.string(period.DayOfWeek, ""));
      workHours.startMinutes = sanitize.integerRange(period.StartTimeInMinutes, 0, kMinutesPerDay);
      workHours.endMinutes = sanitize.integerRange(period.EndTimeInMinutes, 0, kMinutesPerDay);
      return workHours;
    });
  }

  /** From the `WorkingHours` of an OWA `GetUserAvailabilityInternal` response
   * @param timezone The time zone of the request. OWA converts the times into it,
   *   and may then return times before midnight or after the next midnight.
   * @returns null, if the response has no work hours */
  static fromOWAAvailability(json: any, timezone: string): ExchangeWorkHours | null {
    if (json?.WorkHoursStartTimeInMinutes == null || json?.WorkHoursEndTimeInMinutes == null) {
      return null;
    }
    let workHours = new ExchangeWorkHours();
    workHours.timezone = timezone;
    workHours.workDays = sanitize.integerRange(json.WorkDays, 0, 127);
    let start = sanitize.integer(json.WorkHoursStartTimeInMinutes);
    let end = sanitize.integer(json.WorkHoursEndTimeInMinutes);
    workHours.startMinutes = Math.min(Math.max(start, 0), kMinutesPerDay);
    workHours.endMinutes = Math.min(Math.max(end, 0), kMinutesPerDay);
    return workHours;
  }

  static mergeToWorkHours(periods: ExchangeWorkHours[]): WorkHours {
    let workHours = periods[0].toWorkHours();
    for (let period of periods.slice(1)) {
      let periodHours = period.toWorkHours();
      for (let [weekday, day] of workHours.days.entries()) {
        let periodDay = periodHours.days[weekday];
        if (!periodDay.isWorkDay) {
          continue;
        }
        if (!day.isWorkDay) {
          day.copyFrom(periodDay);
          continue;
        }
        // Our model has only one time range per day
        day.startMinutes = Math.min(day.startMinutes, periodDay.startMinutes);
        day.endMinutes = Math.max(day.endMinutes, periodDay.endMinutes);
      }
    }
    return workHours;
  }

  protected static timezoneFromXML(element: Element): ExchangeTimezone {
    let timezone = new ExchangeTimezone();
    timezone.bias = sanitize.integer(ExchangeWorkHours.childText(element, "Bias"), 0);
    let standard = ExchangeWorkHours.changeFromXML(element.getElementsByTagName("Standard")[0]);
    let daylight = ExchangeWorkHours.changeFromXML(element.getElementsByTagName("DaylightSavings")[0]);
    if (standard && daylight) {
      timezone.standard = standard;
      timezone.daylight = daylight;
    }
    return timezone;
  }

  protected static changeFromXML(element: Element | undefined): ExchangeTimezoneChange | null {
    let changeDate = element?.getElementsByTagName("ChangeDate")[0];
    // Year/Month/Day, where Day is the week in the month, as in the Windows `SYSTEMTIME`
    let date = ExchangeWorkHours.childText(changeDate, "Date")?.split("/").map(Number);
    if (!changeDate || !date || date.length != 3 || !date[1]) {
      return null;
    }
    let change = new ExchangeTimezoneChange();
    change.bias = sanitize.integer(ExchangeWorkHours.childText(element, "Bias"), 0);
    change.month = sanitize.integerRange(date[1], 1, 12);
    change.week = sanitize.integerRange(date[2], 1, 5);
    change.weekday = sanitize.integerRange(ExchangeWorkHours.childText(changeDate, "DayOfWeek"), 0, 6);
    change.minutes = ExchangeWorkHours.minutesFromTimeSpan(ExchangeWorkHours.childText(changeDate, "Time"));
    return change;
  }

  protected static timezoneToXML(ianaTimezone: string): string {
    let timezone = ExchangeTimezone.fromIANA(ianaTimezone);
    let noChange = new ExchangeTimezoneChange();
    noChange.month = 0;
    noChange.week = 0;
    let standard = timezone.standard ?? noChange;
    let daylight = timezone.daylight ?? noChange;
    let name = IANAToWindowsTimezone[ianaTimezone];
    return `<Bias>${timezone.bias}</Bias>` +
      `<Standard>${ExchangeWorkHours.changeToXML(standard)}</Standard>` +
      `<DaylightSavings>${ExchangeWorkHours.changeToXML(daylight)}</DaylightSavings>` +
      (name ? `<Name>${name}</Name>` : "");
  }

  protected static changeToXML(change: ExchangeTimezoneChange): string {
    let twoDigits = ExchangeWorkHours.twoDigits;
    return `<Bias>${change.bias}</Bias>` +
      `<ChangeDate>` +
      `<Time>${ExchangeWorkHours.minutesToTimeSpan(change.minutes)}</Time>` +
      `<Date>00/${twoDigits(change.month)}/${twoDigits(change.week)}</Date>` +
      `<DayOfWeek>${change.weekday}</DayOfWeek>` +
      `</ChangeDate>`;
  }

  protected static timezoneFromEWS(json: any): ExchangeTimezone {
    let timezone = new ExchangeTimezone();
    timezone.bias = sanitize.integer(json?.Bias, 0);
    let standard = ExchangeWorkHours.changeFromEWS(json?.StandardTime);
    let daylight = ExchangeWorkHours.changeFromEWS(json?.DaylightTime);
    if (standard && daylight) {
      timezone.standard = standard;
      timezone.daylight = daylight;
    }
    return timezone;
  }

  protected static changeFromEWS(json: any): ExchangeTimezoneChange | null {
    let month = sanitize.integer(json?.Month, 0);
    if (!month) {
      return null;
    }
    let change = new ExchangeTimezoneChange();
    change.bias = sanitize.integer(json.Bias, 0);
    change.month = sanitize.integerRange(month, 1, 12);
    change.week = sanitize.integerRange(json.DayOrder, 1, 5);
    change.weekday = Math.max(kWeekdayNames.indexOf(json.DayOfWeek), 0);
    change.minutes = ExchangeWorkHours.minutesFromTimeSpan(json.Time);
    return change;
  }

  /** @param names e.g. "Monday Tuesday Wednesday Thursday Friday" or "Weekdays" */
  protected static workDaysFromNames(names: string | null): number {
    let workDays = 0;
    for (let name of names?.split(/\s+/) ?? []) {
      let weekday = kWeekdayNames.indexOf(name);
      if (weekday >= 0) {
        workDays |= 1 << weekday;
      } else if (name == "Weekdays" || name == "Weekday") {
        workDays |= 0b0111110;
      } else if (name == "WeekendDays" || name == "WeekendDay") {
        workDays |= 0b1000001;
      } else if (name == "AllDays" || name == "Day") {
        workDays |= 0b1111111;
      }
    }
    return workDays;
  }

  protected static workDaysToNames(workDays: number): string {
    let names = kWeekdayNames.filter((name, weekday) => workDays & (1 << weekday));
    return names.length ? names.join(" ") : "None";
  }

  /** @param timeSpan .NET `TimeSpan`, e.g. "08:30:00", or "1.00:00:00" for 24 hours */
  protected static minutesFromTimeSpan(timeSpan: string | null): number {
    let match = /^(?:(\d+)\.)?(\d+):(\d+)/.exec(timeSpan?.trim() ?? "");
    if (!match) {
      return 0;
    }
    let minutes = Number(match[1] ?? 0) * kMinutesPerDay + Number(match[2]) * 60 + Number(match[3]);
    return Math.min(minutes, kMinutesPerDay);
  }

  protected static minutesToTimeSpan(minutes: number): string {
    if (minutes >= kMinutesPerDay) {
      return "1.00:00:00";
    }
    let twoDigits = ExchangeWorkHours.twoDigits;
    return `${twoDigits(Math.floor(minutes / 60))}:${twoDigits(minutes % 60)}:00`;
  }

  protected static twoDigits(value: number): string {
    return String(value).padStart(2, "0");
  }

  protected static childText(element: Element | undefined, name: string): string | null {
    return element?.getElementsByTagName(name)[0]?.textContent ?? null;
  }

  protected static innerXML(element: Element): string {
    let serializer = new XMLSerializer();
    return [...element.childNodes]
      .map(node => serializer.serializeToString(node))
      .join("")
      .replaceAll(` xmlns="${element.namespaceURI}"`, "");
  }
}

const kWeekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
