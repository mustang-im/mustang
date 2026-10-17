import { WorkingHours } from "../../Calendar/WorkingHours";
import { CalendarRange } from "../../Calendar/CalendarRange";
import { WorkHours } from "../../../logic/Calendar/WorkHours";
import { get, writable } from "svelte/store";
import { expect, test } from "vitest";

// Thursday, 2026-10-15
const kThursday = new Date(2026, 9, 15);
const kSaturday = new Date(2026, 9, 17);

function workHours(startHour: number, endHour: number, workDays = [1, 2, 3, 4, 5]): WorkHours {
  let workHours = new WorkHours();
  for (let [weekday, day] of workHours.days.entries()) {
    day.isWorkDay = workDays.includes(weekday);
    day.startMinutes = startHour * 60;
    day.endMinutes = endHour * 60;
  }
  return workHours;
}

function days(range: CalendarRange): string[] {
  return range.days.map(day => `${day.getMonth() + 1}/${day.getDate()}`);
}

test("Off-work time of a work day is before the start and after the end", () => {
  let working = new WorkingHours([ workHours(9, 17) ]);
  expect(working.offWorkMinutes(kThursday)).toEqual([
    { from: 0, to: 9 * 60 },
    { from: 17 * 60, to: 24 * 60 },
  ]);
});

test("A day off is off work all day", () => {
  let working = new WorkingHours([ workHours(9, 17) ]);
  expect(working.offWorkMinutes(kSaturday)).toEqual([ { from: 0, to: 24 * 60 } ]);
});

test("Work until midnight leaves no off-work time at the end", () => {
  let working = new WorkingHours([ workHours(9, 24) ]);
  expect(working.offWorkMinutes(kThursday)).toEqual([ { from: 0, to: 9 * 60 } ]);
});

test("Unknown work hours shade nothing", () => {
  let working = new WorkingHours([]);
  expect(working.isKnown).toBe(false);
  expect(working.offWorkMinutes(kThursday)).toEqual([]);
  expect(working.workDays()).toBeNull();
});

test("Several calendars: off work only when nobody works", () => {
  let working = new WorkingHours([ workHours(8, 12), workHours(14, 18) ]);
  expect(working.offWorkMinutes(kThursday)).toEqual([
    { from: 0, to: 8 * 60 },
    { from: 12 * 60, to: 14 * 60 },
    { from: 18 * 60, to: 24 * 60 },
  ]);
});

test("The work day starts at the earliest work start", () => {
  let working = new WorkingHours([ workHours(10, 18), workHours(7, 15) ]);
  expect(working.workStart(kThursday)).toEqual(new Date(2026, 9, 15, 7));
  expect(working.workStart(kSaturday)).toBeNull();
  expect(working.workStartOrDefault(kSaturday)).toEqual(new Date(2026, 9, 17, 8));
  expect(working.firstWorkMinute([ kThursday, kSaturday ])).toBe(7 * 60);
  expect(new WorkingHours([]).firstWorkMinute([ kThursday ])).toBe(8 * 60);
});

test("Work days are the days on which anybody works", () => {
  let working = new WorkingHours([ workHours(8, 17, [1, 2, 3]), workHours(8, 17, [3, 4, 6]) ]);
  expect(working.workDays()).toEqual([ false, true, true, true, true, false, true ]);
});

test("Work week shows the work days of the week", () => {
  let tuesdayToSaturday = [ false, false, true, true, true, true, true ];
  expect(days(new CalendarRange("workweek", kThursday, 1, tuesdayToSaturday))).toEqual(["10/13", "10/14", "10/15", "10/16", "10/17"]);
  let mondayWednesdayFriday = [ false, true, false, true, false, true, false ];
  let range = new CalendarRange("workweek", kThursday, 1, mondayWednesdayFriday);
  expect(days(range)).toEqual(["10/12", "10/14", "10/16"]);
  expect(range.end).toEqual(new Date(2026, 9, 17));
});

test("Work week without work days shows Monday to Friday", () => {
  expect(days(new CalendarRange("workweek", kThursday, 1, [ false, false, false, false, false, false, false ])))
    .toEqual(["10/12", "10/13", "10/14", "10/15", "10/16"]);
  expect(days(new CalendarRange("workweek", kThursday, 1, null))).toEqual(["10/12", "10/13", "10/14", "10/15", "10/16"]);
});

test("Store of combined work hours updates when the work hours change", () => {
  let first = workHours(9, 17);
  let list = writable([ first ]);
  let store = WorkingHours.ofAll(list);
  expect(get(store).firstWorkMinute([ kThursday ])).toBe(9 * 60);
  list.set([ first, workHours(6, 10) ]);
  expect(get(store).firstWorkMinute([ kThursday ])).toBe(6 * 60);
});
