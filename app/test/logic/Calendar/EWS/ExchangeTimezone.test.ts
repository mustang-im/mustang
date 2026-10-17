import { ExchangeTimezone } from "../../../../logic/Calendar/EWS/ExchangeTimezone";
import { utcOffset } from "../../../../logic/Calendar/ICal/VTimezone";
import { expect, test } from "vitest";

/** Every 5 days of 2026 */
function sampleTimes(): Date[] {
  let times: Date[] = [];
  for (let day = 0; day < 365; day += 5) {
    times.push(new Date(Date.UTC(2026, 0, 1 + day, 12)));
  }
  return times;
}

test("Rules of Europe/Berlin, as Windows has them", () => {
  let timezone = ExchangeTimezone.fromIANA("Europe/Berlin", new Date("2026-07-01T00:00:00Z"));
  expect(timezone.bias).toBe(-60);
  // Last Sunday in October, 3:00 summer time
  expect(timezone.standard).toMatchObject({ bias: 0, month: 10, week: 5, weekday: 0, minutes: 3 * 60 });
  // Last Sunday in March, 2:00 winter time
  expect(timezone.daylight).toMatchObject({ bias: -60, month: 3, week: 5, weekday: 0, minutes: 2 * 60 });
});

test("Rules of America/New_York, as Windows has them", () => {
  let timezone = ExchangeTimezone.fromIANA("America/New_York", new Date("2026-07-01T00:00:00Z"));
  expect(timezone.bias).toBe(300);
  expect(timezone.standard).toMatchObject({ bias: 0, month: 11, week: 1, weekday: 0, minutes: 2 * 60 });
  expect(timezone.daylight).toMatchObject({ bias: -60, month: 3, week: 2, weekday: 0, minutes: 2 * 60 });
});

test("A time zone without daylight saving time", () => {
  let timezone = ExchangeTimezone.fromIANA("Asia/Tokyo");
  expect(timezone.bias).toBe(-540);
  expect(timezone.standard).toBeNull();
  expect(timezone.daylight).toBeNull();
  expect(timezone.utcOffset(new Date())).toBe(540);
});

test("The rules give the same UTC offsets as the time zone database", () => {
  for (let name of ["Europe/Berlin", "America/New_York", "Australia/Sydney", "America/Santiago", "Asia/Kolkata"]) {
    let timezone = ExchangeTimezone.fromIANA(name, new Date("2026-07-01T00:00:00Z"));
    for (let time of sampleTimes()) {
      expect(timezone.utcOffset(time), name + " " + time.toISOString()).toBe(utcOffset(time, name));
    }
  }
});

test("Find the IANA time zone for rules without name", () => {
  for (let name of ["Europe/Berlin", "America/Los_Angeles", "Australia/Sydney", "Asia/Kolkata"]) {
    let rules = ExchangeTimezone.fromIANA(name);
    let found = rules.toIANA();
    for (let time of sampleTimes()) {
      expect(utcOffset(time, found), name + " found " + found).toBe(utcOffset(time, name));
    }
  }
});

test("Find the IANA time zone for rules without daylight saving time", () => {
  let rules = new ExchangeTimezone();
  rules.bias = -2 * 60;
  let found = rules.toIANA();
  for (let time of sampleTimes()) {
    expect(utcOffset(time, found), found).toBe(2 * 60);
  }
});
