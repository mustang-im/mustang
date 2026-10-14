// app first, to resolve the import cycle around Abstract/Account.ts
import "../../../logic/app";
import { Event } from "../../../logic/Calendar/Event";
import { layoutDayRow, layoutTimeColumn, limitLanes, kRowsPerHour } from "../../../frontend/Calendar/eventLayout";
import { expect, test } from "vitest";

/** Monday */
const kDay = new Date(2026, 8, 7);

function at(dayOffset: number, hours: number, minutes = 0): Date {
  return new Date(2026, 8, 7 + dayOffset, hours, minutes);
}

function newEvent(title: string, start: Date, end: Date, allDay = false): Event {
  let event = new Event();
  event.title = title;
  event.startTime = start;
  event.endTime = end;
  event.allDay = allDay;
  return event;
}

function weekDays(): Date[] {
  return [0, 1, 2, 3, 4, 5, 6].map(i => at(i, 0));
}

test("A 5 hour event is one block spanning 5 hours", () => {
  let event = newEvent("Long", at(0, 10), at(0, 15));
  let layout = layoutTimeColumn([event], kDay);
  expect(layout).toEqual([{
    event,
    startRow: 10 * kRowsPerHour,
    endRow: 15 * kRowsPerHour,
    lane: 0,
    lanes: 1,
    continuesBefore: false,
    continuesAfter: false,
  }]);
});

test("Times snap to 5 minutes, outwards", () => {
  let layout = layoutTimeColumn([newEvent("Odd", at(0, 10, 7), at(0, 10, 52))], kDay);
  expect(layout[0].startRow).toBe(10 * kRowsPerHour + 1); // 10:05
  expect(layout[0].endRow).toBe(10 * kRowsPerHour + 11); // 10:55
});

test("An event without duration still gets one row", () => {
  let layout = layoutTimeColumn([newEvent("Reminder", at(0, 10), at(0, 10))], kDay);
  expect(layout[0].endRow - layout[0].startRow).toBe(1);
});

test("Overlapping events share the width, and keep it for their whole duration", () => {
  let a = newEvent("A", at(0, 9), at(0, 11));
  let b = newEvent("B", at(0, 10), at(0, 12));
  let c = newEvent("C", at(0, 11, 30), at(0, 13));
  let d = newEvent("D", at(0, 14), at(0, 15));
  let layout = layoutTimeColumn([d, c, b, a], kDay);
  let byTitle = Object.fromEntries(layout.map(item => [item.event.title, item]));
  expect(byTitle.A).toMatchObject({ lane: 0, lanes: 2 });
  expect(byTitle.B).toMatchObject({ lane: 1, lanes: 2 });
  // C starts after A ended, so it takes A's lane, but still overlaps B
  expect(byTitle.C).toMatchObject({ lane: 0, lanes: 2 });
  // D overlaps nothing, so it gets the full width
  expect(byTitle.D).toMatchObject({ lane: 0, lanes: 1 });
});

test("Back-to-back events don't overlap", () => {
  let layout = layoutTimeColumn([
    newEvent("First", at(0, 9), at(0, 10)),
    newEvent("Second", at(0, 10), at(0, 11)),
  ], kDay);
  expect(layout.map(item => item.lanes)).toEqual([1, 1]);
});

test("An event over midnight is split into one block per day", () => {
  let event = newEvent("Night", at(0, 22), at(1, 2));
  let monday = layoutTimeColumn([event], at(0, 0));
  let tuesday = layoutTimeColumn([event], at(1, 0));
  expect(monday[0]).toMatchObject({ startRow: 22 * kRowsPerHour, endRow: 24 * kRowsPerHour, continuesBefore: false, continuesAfter: true });
  expect(tuesday[0]).toMatchObject({ startRow: 0, endRow: 2 * kRowsPerHour, continuesBefore: true, continuesAfter: false });
});

test("An event ending at midnight is not shown on the next day", () => {
  let event = newEvent("Evening", at(0, 20), at(1, 0));
  expect(layoutTimeColumn([event], at(0, 0))[0].endRow).toBe(24 * kRowsPerHour);
  expect(layoutTimeColumn([event], at(1, 0))).toEqual([]);
});

test("Rows count from the first shown hour", () => {
  let event = newEvent("Early", at(0, 7), at(0, 9));
  let layout = layoutTimeColumn([event], kDay, 8, 18);
  expect(layout[0]).toMatchObject({ startRow: 0, endRow: kRowsPerHour, continuesBefore: true });
});

test("A 3 day all-day event is one block spanning 3 days", () => {
  let event = newEvent("Trip", at(0, 0), at(3, 0), true);
  let layout = layoutDayRow([event], weekDays());
  expect(layout).toEqual({
    events: [{ event, startDay: 0, endDay: 3, lane: 0, continuesBefore: false, continuesAfter: false }],
    lanes: 1,
  });
});

test("An event longer than the shown days is cut at both ends", () => {
  let event = newEvent("Vacation", at(-3, 0), at(10, 0), true);
  let layout = layoutDayRow([event], weekDays());
  expect(layout.events[0]).toMatchObject({ startDay: 0, endDay: 7, continuesBefore: true, continuesAfter: true });
});

test("A timed event over midnight spans both days", () => {
  let layout = layoutDayRow([newEvent("Night", at(0, 22), at(1, 2))], weekDays());
  expect(layout.events[0]).toMatchObject({ startDay: 0, endDay: 2 });
});

test("Events outside the shown days are left out", () => {
  let layout = layoutDayRow([newEvent("Later", at(8, 10), at(8, 11))], weekDays());
  expect(layout).toEqual({ events: [], lanes: 0 });
});

test("Multi-day events are packed into as few lanes as possible", () => {
  let a = newEvent("A", at(0, 0), at(3, 0), true); // Mon-Wed
  let b = newEvent("B", at(1, 0), at(2, 0), true); // Tue
  let c = newEvent("C", at(3, 0), at(4, 0), true); // Thu
  let d = newEvent("D", at(2, 0), at(5, 0), true); // Wed-Fri
  let layout = layoutDayRow([c, d, b, a], weekDays());
  let lanes = Object.fromEntries(layout.events.map(item => [item.event.title, item.lane]));
  expect(lanes).toEqual({ A: 0, B: 1, D: 1, C: 0 });
  expect(layout.lanes).toBe(2);
});

test("Within a day, all-day events come first, then the others by time", () => {
  let afternoon = newEvent("Afternoon", at(0, 14), at(0, 15));
  let morning = newEvent("Morning", at(0, 9), at(0, 10));
  let holiday = newEvent("Holiday", at(0, 0), at(1, 0), true);
  let layout = layoutDayRow([afternoon, morning, holiday], weekDays());
  expect(layout.events.map(item => [item.event.title, item.lane])).toEqual([
    ["Holiday", 0],
    ["Morning", 1],
    ["Afternoon", 2],
  ]);
});

test("When all lanes fit, nothing is hidden", () => {
  let events = [newEvent("A", at(0, 9), at(0, 10)), newEvent("B", at(0, 11), at(0, 12))];
  let limited = limitLanes(layoutDayRow(events, weekDays()), 7, 2);
  expect(limited.events.map(item => item.event.title)).toEqual(["A", "B"]);
  expect(limited.hiddenEvents.every(hidden => hidden.length == 0)).toBe(true);
});

test("A day with too many events hides the rest, to make room for the '+N more'", () => {
  let monday = [9, 10, 11, 12].map(hour => newEvent(`Mon ${hour}`, at(0, hour), at(0, hour, 30)));
  let tuesday = [9, 10, 11].map(hour => newEvent(`Tue ${hour}`, at(1, hour), at(1, hour, 30)));
  let limited = limitLanes(layoutDayRow([...monday, ...tuesday], weekDays()), 7, 3);
  // Monday: 2 events, and the 3rd lane is for "+2"
  expect(limited.hiddenEvents[0].map(event => event.title)).toEqual(["Mon 11", "Mon 12"]);
  // Tuesday fits into 3 lanes, so it uses the 3rd lane for its event
  expect(limited.hiddenEvents[1]).toEqual([]);
  expect(limited.events.map(item => item.event.title)).toEqual(["Mon 9", "Mon 10", "Tue 9", "Tue 10", "Tue 11"]);
});

test("A multi-day event in the last lane is hidden on all its days, if one of its days overflows", () => {
  let a = newEvent("A", at(0, 0), at(2, 0), true); // Mon-Tue, lane 0
  let b = newEvent("B", at(0, 0), at(2, 0), true); // Mon-Tue, lane 1
  let late = newEvent("Late", at(1, 0), at(3, 0), true); // Tue-Wed, lane 2
  let wednesday = [9, 10, 11].map(hour => newEvent(`Wed ${hour}`, at(2, hour), at(2, hour, 30))); // lanes 0, 1, 3
  let layout = layoutDayRow([a, b, late, ...wednesday], weekDays());
  expect(layout.events.find(item => item.event == late)!.lane).toBe(2);
  let limited = limitLanes(layout, 7, 3);
  expect(limited.hiddenEvents[0]).toEqual([]);
  // Tuesday itself has room, but "Late" can't be cut in half
  expect(limited.hiddenEvents[1].map(event => event.title)).toEqual(["Late"]);
  expect(limited.hiddenEvents[2].map(event => event.title)).toEqual(["Late", "Wed 11"]);
  expect(limited.events.map(item => item.event.title)).toEqual(["A", "B", "Wed 9", "Wed 10"]);
});

test("With room for only 1 lane, all events of an overflowing day are hidden", () => {
  let events = [newEvent("A", at(0, 9), at(0, 10)), newEvent("B", at(0, 11), at(0, 12)), newEvent("C", at(1, 9), at(1, 10))];
  let limited = limitLanes(layoutDayRow(events, weekDays()), 7, 1);
  expect(limited.hiddenEvents[0].map(event => event.title)).toEqual(["A", "B"]);
  expect(limited.events.map(item => item.event.title)).toEqual(["C"]);
});
