// app first, to resolve the import cycle around Abstract/Account.ts
import "../../../logic/app";
import { Event } from "../../../logic/Calendar/Event";
import { DateNavigatorMonth } from "../../Calendar/FolderPane/DateNavigatorMonth";
import { WeekNumber } from "../../Calendar/View/WeekNumber";
import { HourLabel } from "../../Calendar/TimeGrid/HourLabel";
import { expect, test } from "vitest";

function newEvent(start: Date, end: Date, allDay = false): Event {
  let event = new Event();
  event.startTime = start;
  event.endTime = end;
  event.allDay = allDay;
  return event;
}

test("Month grid: 6 weeks from Monday, with the days of the neighbor months", () => {
  let month = new DateNavigatorMonth(new Date(2026, 9, 15));
  expect(month.weeks.length).toBe(6);
  expect(month.weeks[0][0]).toEqual(new Date(2026, 8, 28));
  expect(month.weeks[5][6]).toEqual(new Date(2026, 10, 8));
  expect(month.isInMonth(new Date(2026, 8, 30))).toBe(false);
  expect(month.isInMonth(new Date(2026, 9, 1))).toBe(true);
  expect(month.title("en-US")).toBe("October 2026");
  expect(month.next(1).title("en-US")).toBe("November 2026");
  expect(month.next(-10).title("en-US")).toBe("December 2025");
});

test("Weekday labels with 2 letters", () => {
  let month = new DateNavigatorMonth(new Date(2026, 9, 15));
  expect(month.weekdayLabels("en-US")).toEqual(["MO", "TU", "WE", "TH", "FR", "SA", "SU"]);
  expect(month.weekdayLabels("de")).toEqual(["MO", "DI", "MI", "DO", "FR", "SA", "SO"]);
});

test("Days with events, including multi-day and all-day events", () => {
  let month = new DateNavigatorMonth(new Date(2026, 9, 15));
  let events = [
    newEvent(new Date(2026, 9, 15, 9), new Date(2026, 9, 15, 10)),
    newEvent(new Date(2026, 9, 20), new Date(2026, 9, 22), true),
    newEvent(new Date(2026, 9, 25, 22), new Date(2026, 9, 26, 1)),
    newEvent(new Date(2026, 5, 1, 9), new Date(2026, 5, 1, 10)),
    newEvent(new Date(2026, 8, 20), new Date(2026, 8, 29), true),
  ];
  let keys = month.daysWithEvents(events);
  let has = (month: number, day: number) => keys.has(DateNavigatorMonth.dayKey(new Date(2026, month, day)));
  expect(has(9, 15)).toBe(true);
  expect(has(9, 14)).toBe(false);
  expect(has(9, 20)).toBe(true);
  expect(has(9, 21)).toBe(true);
  expect(has(9, 22)).toBe(false);
  expect(has(9, 25)).toBe(true);
  expect(has(9, 26)).toBe(true);
  expect(has(8, 28)).toBe(true);
  expect(has(8, 29)).toBe(false);
  expect(keys.size).toBe(6);
});

test("ISO week numbers", () => {
  expect(WeekNumber.of(new Date(2026, 9, 15))).toBe(42);
  expect(WeekNumber.of(new Date(2026, 0, 1))).toBe(1);
  expect(WeekNumber.of(new Date(2027, 0, 1))).toBe(53);
  expect(WeekNumber.of(new Date(2027, 0, 4))).toBe(1);
  expect(WeekNumber.of(new Date(2024, 11, 30))).toBe(1);
  expect(WeekNumber.of(new Date(2026, 2, 29))).toBe(13);
});

test("Hour labels: 12-hour locales without minutes, 24-hour locales with", () => {
  let english = new HourLabel("en-US");
  expect(english.label(8)).toBe("8 AM");
  expect(english.label(12)).toBe("12 PM");
  expect(english.label(0)).toBe("12 AM");
  let german = new HourLabel("de");
  expect(german.label(8)).toBe("08:00");
  expect(german.label(0)).toBe("00:00");
  expect(german.label(17)).toBe("17:00");
});
