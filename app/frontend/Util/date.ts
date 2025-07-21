import { getUILocale, gPlural, gt } from "../../l10n/l10n";

/**
* @returns
* For today: Time, e.g. "15:23"
* This week: Weekday, Time, e.g. "Wed 15:23"
* Other this year: Date without year and time, e.g. "23.11. 15:23"
* Other: Date and time, e.g. "23.11.2018 15:23"
* Each in locale
* See also <https://momentjs.com> for relative time
*/
export function getDateTimeString(date: Date): string {
  if (!date) {
    return "";
  }
  let dateDetails = null;
  let today = new Date();
  if (date.getDate() == today.getDate() && today.getTime() - date.getTime() < k1DayMS) { // today
    dateDetails = { hour: "numeric", minute: "numeric" };
  } else if (today.getTime() - date.getTime() < 7 * k1DayMS &&
      today.getTime() - date.getTime() > -7 * k1DayMS) { // this week
    dateDetails = { weekday: "short", hour: "numeric", minute: "numeric" };
  } else if (date.getFullYear() == today.getFullYear()) { // this year
    dateDetails = { month: "2-digit", day: "2-digit", hour: "numeric", minute: "numeric" };
  } else { // full date
    dateDetails = { year: "numeric", month: "2-digit", day: "2-digit", hour: "numeric", minute: "numeric" };
  }
  return date.toLocaleString(getUILocale(), dateDetails);
}

/**
* @returns
* For today: "Today"
* This week: Weekday, long, e.g. "Wednesday"
* Other this year: Date, without year, e.g. "23.11."
* Other: Full Date, e.g. "23.11.2018"
* Each in locale
* See also <https://momentjs.com> for relative time
*/
export function getDateString(date: Date, fullDate = { year: "numeric", month: "2-digit", day: "2-digit" }): string {
  if (!date) {
    return "";
  }
  let dateDetails = null;
  let today = new Date();
  if (date.getDate() == today.getDate() && today.getTime() - date.getTime() < k1DayMS) { // today
    return gt`Today`;
  } else if (today.getTime() - date.getTime() < 7 * k1DayMS &&
      today.getTime() - date.getTime() > -7 * k1DayMS) { // this week
    dateDetails = { weekday: "long" };
  } else if (date.getFullYear() == today.getFullYear()) { // this year
    dateDetails = { month: "2-digit", day: "2-digit" };
  } else { // full date
    dateDetails = fullDate;
  }
  return date.toLocaleString(getUILocale(), dateDetails);
}

/** @returns Time, e.g. "15:23" */
export function getTimeString(date: Date): string {
  if (!date) {
    return "";
  }
  return date.toLocaleString(getUILocale(), { hour: "numeric", minute: "numeric" });
}

/**
 * @param weekday day of the week
 * @param form How long the name should be
 *    narrow = 1 char
 *    short = 2 chars
 *    long = full name
 * @return Name for the weekday, e.g. "Mo" or "Monday" */
export function weekdayLabel(weekday: number, form: "long" | "short" | "narrow") {
  let date = new Date(2010, 2, weekday);
  return date.toLocaleDateString(getUILocale(), { weekday: form });
};

/** Monday to Sunday, in order (sorted).
 *
 * If we ever want to support Sunday being the first day of the week,
 * simply change this to `[0, 1, 2, 3, 4, 5, 6]` at runtime. */
export const kAllWeekdays = [1, 2, 3, 4, 5, 6, 0];

/**
 * @param ianaTimezone IANA timezone, e.g. "Europe/Berlin"
 * @returns the city in English, for most timezones */
export function getTimezoneDisplay(ianaTimezone: string): string {
  return ianaTimezone.split("/").pop();
}
export function myTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
export function isSameTimezone(ianaTimezone: string, time: Date) {
  if (!ianaTimezone) {
    return true;
  }
  let summer = new Date(time);
  summer.setMonth(summer.getMonth() + 6);
  let tz = {
    timeZone: ianaTimezone,
  };
  return time.toLocaleString("de") == time.toLocaleString("de", tz) &&
    summer.toLocaleString("de") == summer.toLocaleString("de", tz);
}

export function getToday() {
  const today = new Date();
  today.setHours(0);
  today.setMinutes(0);
  today.setSeconds(0);
  today.setMilliseconds(0);
  return today;
}

/** @returns Mon-Sun around `start` */
export function getWeekDays(start: Date): Date[] {
  let startTime = new Date(start);
  // Always start with Monday
  startTime.setDate(startTime.getDate() - startTime.getDay() + 1);
  startTime.setHours(0);
  startTime.setMinutes(0);
  startTime.setSeconds(0);
  startTime.setMilliseconds(0);
  let weekDays = [];
  for (let i = 0; i < 7; i++) {
    weekDays.push(new Date(startTime));
    startTime.setDate(startTime.getDate() + 1)
  }
  return weekDays;
}

export function getDurationString(durationInMS: number): string {
  let durationInSec = durationInMS / 1000;
  if (!durationInMS) {
    return "";
  } else if (durationInSec % k1DayS == 0) {
    let days = durationInSec / k1DayS;
    return Math.round(days) + " " + gPlural(days, { one: 'day', other: 'days' });
  } else if (durationInSec % k1HourS == 0) {
    let hours = durationInSec / k1HourS;
    return Math.round(hours) + " " + gPlural(hours, { one: 'hour', other: 'hours' });
  } else {
    let minutes = durationInSec / k1MinuteS;
    return Math.round(minutes) + " " + gPlural(minutes, { one: 'min', other: 'mins' });
  }
}

/** 1 day, in seconds */
export const k1DayS = 86400;
export const k1HourS = 3600;
export const k1MinuteS = 60;
/** 1 day, in milliseconds */
export const k1DayMS = 86400 * 1000;
export const k1HourMS = 3600 * 1000;
export const k1MinuteMS = 60 * 1000;
