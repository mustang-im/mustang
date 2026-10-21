import { localTime, moveLocalTime, k1DayMS, k1HourMS, k1WeekMS } from '../../../logic/util/date';
import { afterAll, beforeAll, expect, test, vi } from 'vitest';

/* The clocks go forward on 28 March 2027 in Europe/Berlin,
 * and back on 4 April 2027 in Australia/Sydney. */

beforeAll(() => {
  vi.stubEnv("TZ", "Europe/Berlin");
});
afterAll(() => {
  vi.unstubAllEnvs();
});

function wallClock(time: Date, timezone: string): string {
  return time.toLocaleString("en-CA", { timeZone: timezone, hourCycle: "h23" });
}

test("localTime() has the date and time in the time zone in its UTC fields", () => {
  let time = new Date(Date.UTC(2027, 0, 3, 22, 30));
  let local = localTime(time, "Australia/Sydney");
  expect(wallClock(local, "UTC")).toBe(wallClock(time, "Australia/Sydney"));
  expect(local.getUTCDate()).toBe(4);
  expect(local.getUTCDay()).toBe(1);
  expect(local.getUTCHours()).toBe(9);
  expect(local.getUTCMinutes()).toBe(30);
});

test("localTime() without time zone uses the local time zone", () => {
  let time = new Date(2027, 6, 5, 9, 0);
  let local = localTime(time, null);
  expect(wallClock(local, "UTC")).toBe(wallClock(time, "Europe/Berlin"));
});

test("moveLocalTime() keeps the time of day across the clock change", () => {
  let time = new Date(2027, 2, 22, 9, 0);
  let moved = moveLocalTime(time, k1WeekMS, "Europe/Berlin");
  expect(moved.getTime()).toBe(new Date(2027, 2, 29, 9, 0).getTime());
  expect(moved.getTime() - time.getTime()).toBe(k1WeekMS - k1HourMS);
  expect(moveLocalTime(moved, -k1WeekMS, "Europe/Berlin").getTime()).toBe(time.getTime());
});

test("moveLocalTime() keeps the time of day in the given time zone, not the local one", () => {
  const kTimezone = "Australia/Sydney";
  let time = new Date(Date.UTC(2027, 2, 30, 22, 0));
  let moved = moveLocalTime(time, 7 * k1DayMS + k1HourMS, kTimezone);
  expect(wallClock(time, kTimezone)).toBe("2027-03-31, 09:00:00");
  expect(wallClock(moved, kTimezone)).toBe("2027-04-07, 10:00:00");
});

test("moveLocalTime() without a clock change moves by exactly the shift", () => {
  let time = new Date(2027, 0, 4, 9, 0);
  let moved = moveLocalTime(time, 3 * k1DayMS + k1HourMS, "Europe/Berlin");
  expect(moved.getTime() - time.getTime()).toBe(3 * k1DayMS + k1HourMS);
});
