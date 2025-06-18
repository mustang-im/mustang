import { expect, test } from 'vitest';
import { Frequency, Weekday, RecurrenceInit, RecurrenceRule } from './RecurrenceRule';

function check(calString: string, data: RecurrenceInit, expected: [number, number, number][]) {
  data.masterDuration = 36e5;
  let rule = new RecurrenceRule(data);
  if (calString) {
    expect(rule.getCalString()).toEqual(calString);
    let ruleFromString = RecurrenceRule.fromCalString(36e5, data.seriesStartTime, calString);
    expect(rule).toEqual(ruleFromString);
  }
  expect(rule.getOccurrenceByIndex(2)).toEqual(new Date(...expected[1]));
  expect(rule.getOccurrencesByDate(new Date(2010, 10, 10))).toEqual(expected.map(args => new Date(...args)));
}

test("Daily with interval and end date", () => {
  check("RRULE:FREQ=DAILY;UNTIL=20000105T000000;INTERVAL=2", {
    seriesStartTime: new Date(2000, 0, 1),
    seriesEndTime: new Date(2000, 0, 5),
    frequency: Frequency.Daily,
    interval: 2,
  }, [[2000, 0, 1], [2000, 0, 3], [2000, 0, 5]]);
});

test("Daily with interval and count", () => {
  check("RRULE:FREQ=DAILY;COUNT=3;INTERVAL=2", {
    seriesStartTime: new Date(2000, 0, 1),
    count: 3,
    frequency: Frequency.Daily,
    interval: 2,
  }, [[2000, 0, 1], [2000, 0, 3], [2000, 0, 5]]);
});

test("Daily with days and end date", () => {
  check("RRULE:FREQ=DAILY;UNTIL=20000105T000000;BYDAY=SA,MO,WE", {
    seriesStartTime: new Date(2000, 0, 1),
    seriesEndTime: new Date(2000, 0, 5),
    frequency: Frequency.Daily,
    weekdays: [Weekday.Saturday, Weekday.Monday, Weekday.Wednesday],
  }, [[2000, 0, 1], [2000, 0, 3], [2000, 0, 5]]);
});

test("Daily with days and count", () => {
  check("RRULE:FREQ=DAILY;COUNT=3;BYDAY=SA,SU", {
    seriesStartTime: new Date(2000, 0, 1),
    count: 3,
    frequency: Frequency.Daily,
    weekdays: [Weekday.Saturday, Weekday.Sunday],
  }, [[2000, 0, 1], [2000, 0, 2], [2000, 0, 8]]);
});

test("Weekly with interval and end date", () => {
  check("RRULE:FREQ=WEEKLY;UNTIL=20000131T000000;INTERVAL=2", {
    seriesStartTime: new Date(2000, 0, 1),
    seriesEndTime: new Date(2000, 0, 31),
    frequency: Frequency.Weekly,
    interval: 2,
  }, [[2000, 0, 1], [2000, 0, 15], [2000, 0, 29]]);
});

test("Weekly with interval and count", () => {
  check("RRULE:FREQ=WEEKLY;COUNT=3;INTERVAL=2", {
    seriesStartTime: new Date(2000, 0, 1),
    count: 3,
    frequency: Frequency.Weekly,
    interval: 2,
  }, [[2000, 0, 1], [2000, 0, 15], [2000, 0, 29]]);
});

test("Weekly with days and end date", () => {
  check("RRULE:FREQ=WEEKLY;UNTIL=20000131T000000;INTERVAL=3;BYDAY=SA,SU", {
    seriesStartTime: new Date(2000, 0, 1),
    seriesEndTime: new Date(2000, 0, 31),
    frequency: Frequency.Weekly,
    interval: 3,
    weekdays: [Weekday.Saturday, Weekday.Sunday],
  }, [[2000, 0, 1], [2000, 0, 2], [2000, 0, 22], [2000, 0, 23]]);
});

test("Weekly with days and count", () => {
  check("RRULE:FREQ=WEEKLY;COUNT=3;INTERVAL=3;BYDAY=SA,SU", {
    seriesStartTime: new Date(2000, 0, 1),
    count: 3,
    frequency: Frequency.Weekly,
    interval: 3,
    weekdays: [Weekday.Saturday, Weekday.Sunday],
  }, [[2000, 0, 1], [2000, 0, 2], [2000, 0, 22]]);
});

test("Monthly with date and end date", () => {
  check("RRULE:FREQ=MONTHLY;UNTIL=20001230T000000;INTERVAL=3", {
    seriesStartTime: new Date(2000, 0, 31),
    seriesEndTime: new Date(2000, 11, 30),
    frequency: Frequency.Monthly,
    interval: 3,
  }, [[2000, 0, 31], [2000, 3, 30], [2000, 6, 31], [2000, 9, 31]]);
});

test("Monthly with date and count", () => {
  check("RRULE:FREQ=MONTHLY;COUNT=3;INTERVAL=3", {
    seriesStartTime: new Date(2000, 0, 31),
    count: 3,
    frequency: Frequency.Monthly,
    interval: 3,
  }, [[2000, 0, 31], [2000, 3, 30], [2000, 6, 31]]);
});

test("Monthly with day of week of month and end date", () => {
  check("RRULE:FREQ=MONTHLY;UNTIL=20001201T000000;INTERVAL=3;BYDAY=2SU", {
    seriesStartTime: new Date(2000, 0, 9),
    seriesEndTime: new Date(2000, 11, 1),
    frequency: Frequency.Monthly,
    interval: 3,
    weekdays: [Weekday.Sunday],
    week: 2,
  }, [[2000, 0, 9], [2000, 3, 9], [2000, 6, 9], [2000, 9, 8]]);
});

test("Monthly with day of week of month and count", () => {
  check("RRULE:FREQ=MONTHLY;COUNT=3;INTERVAL=3;BYDAY=2SU", {
    seriesStartTime: new Date(2000, 0, 9),
    count: 3,
    frequency: Frequency.Monthly,
    interval: 3,
    weekdays: [Weekday.Sunday],
    week: 2,
  }, [[2000, 0, 9], [2000, 3, 9], [2000, 6, 9]]);
});

test("Monthly with day of last week of month and end date", () => {
  check("RRULE:FREQ=MONTHLY;UNTIL=20001201T000000;INTERVAL=3;BYDAY=-1SU", {
    seriesStartTime: new Date(2000, 0, 30),
    seriesEndTime: new Date(2000, 11, 1),
    frequency: Frequency.Monthly,
    interval: 3,
    weekdays: [Weekday.Sunday],
    week: 5,
  }, [[2000, 0, 30], [2000, 3, 30], [2000, 6, 30], [2000, 9, 29]]);
});

test("Monthly with day of last week of month and count", () => {
  check("RRULE:FREQ=MONTHLY;COUNT=3;INTERVAL=3;BYDAY=-1SU", {
    seriesStartTime: new Date(2000, 0, 30),
    count: 3,
    frequency: Frequency.Monthly,
    interval: 3,
    weekdays: [Weekday.Sunday],
    week: 5,
  }, [[2000, 0, 30], [2000, 3, 30], [2000, 6, 30]]);
});

test("Yearly with date and end date", () => {
  check("RRULE:FREQ=YEARLY;UNTIL=20021201T000000", {
    seriesStartTime: new Date(2000, 1, 29),
    seriesEndTime: new Date(2002, 11, 1),
    frequency: Frequency.Yearly,
  }, [[2000, 1, 29], [2001, 1, 28], [2002, 1, 28]]);
});

test("Yearly with date and count", () => {
  check("RRULE:FREQ=YEARLY;COUNT=3", {
    seriesStartTime: new Date(2000, 1, 29),
    count: 3,
    frequency: Frequency.Yearly,
  }, [[2000, 1, 29], [2001, 1, 28], [2002, 1, 28]]);
});

test("Yearly with day of week of month and end date", () => {
  check("RRULE:FREQ=YEARLY;UNTIL=20021201T000000;BYDAY=2SU", {
    seriesStartTime: new Date(2000, 0, 9),
    seriesEndTime: new Date(2002, 11, 1),
    frequency: Frequency.Yearly,
    weekdays: [Weekday.Sunday],
    week: 2,
  }, [[2000, 0, 9], [2001, 0, 14], [2002, 0, 13]]);
});

test("Yearly with day of week of month and count", () => {
  check("RRULE:FREQ=YEARLY;COUNT=3;BYDAY=2SU", {
    seriesStartTime: new Date(2000, 0, 9),
    count: 3,
    frequency: Frequency.Yearly,
    weekdays: [Weekday.Sunday],
    week: 2,
  }, [[2000, 0, 9], [2001, 0, 14], [2002, 0, 13]]);
});

test("Yearly with day of last week of month and end date", () => {
  check("RRULE:FREQ=YEARLY;UNTIL=20021201T000000;BYDAY=-1SU", {
    seriesStartTime: new Date(2000, 0, 30),
    seriesEndTime: new Date(2002, 11, 1),
    frequency: Frequency.Yearly,
    weekdays: [Weekday.Sunday],
    week: 5,
  }, [[2000, 0, 30], [2001, 0, 28], [2002, 0, 27]]);
});

test("Yearly with day of last week of month and count", () => {
  check("RRULE:FREQ=YEARLY;COUNT=3;BYDAY=-1SU", {
    seriesStartTime: new Date(2000, 0, 30),
    count: 3,
    frequency: Frequency.Yearly,
    weekdays: [Weekday.Sunday],
    week: 5,
  }, [[2000, 0, 30], [2001, 0, 28], [2002, 0, 27]]);
});
