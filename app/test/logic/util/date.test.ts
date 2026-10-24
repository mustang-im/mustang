// @vitest-environment happy-dom
import { getDayStart, getTimeString, getTimeStringWithoutDayPeriod, getWeekStart } from "../../../logic/util/date";
import { saveDateTimeLocale } from "../../../l10n/l10n";
import { afterEach, expect, test } from "vitest";

const time = new Date(2026, 9, 29, 15, 5);

afterEach(() => {
  saveDateTimeLocale("");
});

test("Time without AM/PM leaves out only the day period", () => {
  for (let locale of ["en-US", "es-US", "ko-KR"]) {
    saveDateTimeLocale(locale);
    let dayPeriod = new Intl.DateTimeFormat(locale, { hour: "numeric", hour12: true })
      .formatToParts(time)
      .find(part => part.type == "dayPeriod")
      .value;
    let withoutDayPeriod = getTimeStringWithoutDayPeriod(time);
    expect(getTimeString(time)).toContain(dayPeriod);
    expect(withoutDayPeriod).not.toContain(dayPeriod);
    expect(getTimeString(time)).toContain(withoutDayPeriod);
    expect(withoutDayPeriod).toContain("05");
    expect(withoutDayPeriod).toBe(withoutDayPeriod.trim());
  }
});

test("Time without AM/PM is the normal time in 24-hour locales", () => {
  for (let locale of ["de-DE", "en-GB"]) {
    saveDateTimeLocale(locale);
    expect(getTimeStringWithoutDayPeriod(time)).toBe(getTimeString(time));
  }
});

test("Day start is midnight of the same day, and the week starts on Monday", () => {
  let dayStart = getDayStart(time);
  expect(dayStart).toEqual(new Date(2026, 9, 29));
  expect(time.getTime()).toBe(new Date(2026, 9, 29, 15, 5).getTime());
  // Sunday belongs to the week before
  expect(getWeekStart(new Date(2026, 10, 1, 12, 0))).toEqual(new Date(2026, 9, 26));
});
