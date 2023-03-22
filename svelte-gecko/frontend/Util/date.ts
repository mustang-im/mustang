
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
  let day = getDay(date);
  var dateDetails = null;
  let today = getDay(null);
  if (day.getMilliseconds() == today.getMilliseconds()) {
    dateDetails = { hour: "numeric", minute: "numeric" };
  } else if (today.getMilliseconds() - day.getMilliseconds() < 7 * 24 * 60 * 60 * 1000) { // this week
    dateDetails = { weekday: "short", hour: "numeric", minute: "numeric" };
  } else if (day.getFullYear() == today.getFullYear()) { // this year
    dateDetails = { month: "numeric", day: "numeric", hour: "numeric", minute: "numeric" };
  } else {
    dateDetails = { year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric" };
  }
  return date.toLocaleString(navigator.language, dateDetails);
}

export function getDay(date: Date): Date {
  let day = new Date(date);
  day.setHours(0);
  day.setMinutes(0);
  day.setSeconds(0);
  day.setMilliseconds(0);
  return day;
}
