import { WorkHours } from "../../../logic/Calendar/WorkHours";
import { expect, test } from "vitest";

test("Default work hours: Monday to Friday, 8:00 to 17:00", () => {
  let workHours = new WorkHours();
  expect(workHours.days.map(day => day.isWorkDay)).toEqual([false, true, true, true, true, true, false]);
  expect(workHours.days[1].startMinutes).toBe(8 * 60);
  expect(workHours.days[1].endMinutes).toBe(17 * 60);
  expect(workHours.timezone).toBeNull();
});

test("Work periods in the time zone of the work hours", () => {
  let workHours = new WorkHours();
  workHours.timezone = "America/New_York";
  workHours.days[1].startMinutes = 9 * 60;
  workHours.days[1].endMinutes = 17 * 60 + 30;
  workHours.days[5].isWorkDay = false;
  // Monday, 2026-07-06 to Sunday, 2026-07-12, in UTC
  let periods = workHours.workPeriods(new Date("2026-07-06T00:00:00Z"), new Date("2026-07-13T00:00:00Z"));
  expect(periods.map(period => period.start.toISOString())).toEqual([
    "2026-07-06T13:00:00.000Z", // 9:00 EDT
    "2026-07-07T12:00:00.000Z",
    "2026-07-08T12:00:00.000Z",
    "2026-07-09T12:00:00.000Z",
  ]);
  expect(periods[0].end.toISOString()).toBe("2026-07-06T21:30:00.000Z");
  expect(periods[1].end.toISOString()).toBe("2026-07-07T21:00:00.000Z");
});

test("Work periods follow the change to summer time", () => {
  let workHours = new WorkHours();
  workHours.timezone = "Europe/Berlin";
  // Friday before and Monday after the change on Sunday, 2026-03-29
  let periods = workHours.workPeriods(new Date("2026-03-27T00:00:00Z"), new Date("2026-03-31T00:00:00Z"));
  expect(periods.map(period => period.start.toISOString())).toEqual([
    "2026-03-27T07:00:00.000Z", // 8:00 CET
    "2026-03-30T06:00:00.000Z", // 8:00 CEST
  ]);
});

test("Work periods are cut to the requested range", () => {
  let workHours = new WorkHours();
  workHours.timezone = "UTC";
  let periods = workHours.workPeriods(new Date("2026-07-06T10:00:00Z"), new Date("2026-07-06T12:00:00Z"));
  expect(periods).toEqual([{
    start: new Date("2026-07-06T10:00:00Z"),
    end: new Date("2026-07-06T12:00:00Z"),
  }]);
  expect(workHours.workPeriods(new Date("2026-07-06T18:00:00Z"), new Date("2026-07-06T23:00:00Z"))).toEqual([]);
});

test("Work until midnight", () => {
  let workHours = new WorkHours();
  workHours.timezone = "UTC";
  workHours.days[1].startMinutes = 20 * 60;
  workHours.days[1].endMinutes = 24 * 60;
  let periods = workHours.workPeriods(new Date("2026-07-06T00:00:00Z"), new Date("2026-07-07T00:00:00Z"));
  expect(periods).toEqual([{
    start: new Date("2026-07-06T20:00:00Z"),
    end: new Date("2026-07-07T00:00:00Z"),
  }]);
});

test("Work hours in the time zone of this computer", () => {
  let workHours = new WorkHours();
  let monday = new Date(2026, 6, 6);
  let periods = workHours.workPeriods(monday, new Date(2026, 6, 7));
  expect(periods).toEqual([{
    start: new Date(2026, 6, 6, 8),
    end: new Date(2026, 6, 6, 17),
  }]);
  expect(workHours.isWorkTime(new Date(2026, 6, 6, 12))).toBe(true);
  expect(workHours.isWorkTime(new Date(2026, 6, 6, 17))).toBe(false);
  expect(workHours.isWorkTime(new Date(2026, 6, 5, 12))).toBe(false); // Sunday
});

test("Work hours are saved and read back", () => {
  let workHours = new WorkHours();
  workHours.timezone = "Asia/Kolkata";
  workHours.days[6].isWorkDay = true;
  workHours.days[6].startMinutes = 10 * 60;
  workHours.days[6].endMinutes = 14 * 60;
  let json = JSON.parse(JSON.stringify(workHours.toJSON()));
  let readBack = new WorkHours();
  readBack.fromJSON(json);
  expect(readBack.equals(workHours)).toBe(true);
  expect(readBack.days[6].startMinutes).toBe(10 * 60);
});

test("Broken saved work hours fall back to the defaults", () => {
  let workHours = new WorkHours();
  workHours.fromJSON({ days: [null, { isWorkDay: "maybe", startMinutes: -5, endMinutes: 99999 }] });
  expect(workHours.equals(new WorkHours())).toBe(true);
});

test("A change of a day notifies the observers of the work hours", () => {
  let workHours = new WorkHours();
  let notifications = 0;
  workHours.subscribe(() => notifications++);
  notifications = 0; // `subscribe()` calls once immediately
  workHours.days[3].endMinutes = 16 * 60;
  expect(notifications).toBe(1);
});

test("Off-work time is the time outside the work hours", () => {
  let workHours = new WorkHours();
  workHours.timezone = "UTC";
  let periods = workHours.offWorkPeriods(new Date("2026-07-06T00:00:00Z"), new Date("2026-07-07T00:00:00Z"));
  expect(periods).toEqual([
    { start: new Date("2026-07-06T00:00:00Z"), end: new Date("2026-07-06T08:00:00Z") },
    { start: new Date("2026-07-06T17:00:00Z"), end: new Date("2026-07-07T00:00:00Z") },
  ]);
  // Sunday
  expect(workHours.offWorkPeriods(new Date("2026-07-05T00:00:00Z"), new Date("2026-07-06T00:00:00Z"))).toEqual([
    { start: new Date("2026-07-05T00:00:00Z"), end: new Date("2026-07-06T00:00:00Z") },
  ]);
});

test("Off-work time of several people is when none of them works", () => {
  let berlin = new WorkHours();
  berlin.timezone = "Europe/Berlin"; // 6:00 to 15:00 UTC in summer
  let newYork = new WorkHours();
  newYork.timezone = "America/New_York"; // 12:00 to 21:00 UTC in summer
  let periods = WorkHours.offWorkPeriodsOfAll([berlin, newYork], new Date("2026-07-06T00:00:00Z"), new Date("2026-07-07T00:00:00Z"));
  expect(periods).toEqual([
    { start: new Date("2026-07-06T00:00:00Z"), end: new Date("2026-07-06T06:00:00Z") },
    { start: new Date("2026-07-06T21:00:00Z"), end: new Date("2026-07-07T00:00:00Z") },
  ]);
});
