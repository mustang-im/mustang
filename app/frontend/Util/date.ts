import { getUILocale, gPlural } from "../../l10n/l10n";

/**
* Returns:
* For today: Time, e.g. "15:23"
* This week: Weekday, Time, e.g. "Wed 15:23"
* Other this year: Date without year and time, e.g. "23.11. 15:23"
* Other: Date and time, e.g. "23.11.2018 15:23"
* Each in locale
* See also <https://momentjs.com> for relative time
*/
export function getDateString(date: Date): string {
  var dateDetails = null;
  let today = new Date();
  if (date.getDate() == today.getDate() && today.getTime() - date.getTime() < 24 * 60 * 60 * 1000) {
    dateDetails = { hour: "numeric", minute: "numeric" };
  } else if (today.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000) { // this week
    dateDetails = { weekday: "short", hour: "numeric", minute: "numeric" };
  } else if (date.getFullYear() == today.getFullYear()) { // this year
    dateDetails = { month: "2-digit", day: "2-digit", hour: "numeric", minute: "numeric" };
  } else {
    dateDetails = { year: "numeric", month: "2-digit", day: "2-digit", hour: "numeric", minute: "numeric" };
  }
  return date.toLocaleString(getUILocale(), dateDetails);
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
  } else if (durationInSec % k1Day == 0) {
    let days = durationInSec / k1Day;
    return Math.round(days) + " " + gPlural(days, { one: 'day', other: 'days' });
  } else if (durationInSec % k1Hour == 0) {
    let hours = durationInSec / k1Hour;
    return Math.round(hours) + " " + gPlural(hours, { one: 'hour', other: 'hours' });
  } else {
    let minutes = durationInSec / k1Minute;
    return Math.round(minutes) + " " + gPlural(minutes, { one: 'min', other: 'mins' });
  }
}

export const k1Day = 86400;
export const k1Hour = 3600;
export const k1Minute = 60;
