// @vitest-environment happy-dom
import { TimeOptions } from "../../../Calendar/EditEvent/TimeOptions";
import { afterAll, expect, test, vi } from "vitest";

// A time zone with daylight saving time, which changes on 2026-03-29 and 2026-10-25
vi.stubEnv("TZ", "Europe/Berlin");
afterAll(() => vi.unstubAllEnvs());

test("Start times: every half hour of the day", () => {
  let options = TimeOptions.startTimes(new Date(2026, 9, 15, 14, 20));
  expect(options.length).toBe(48);
  expect(options[0].time).toEqual(new Date(2026, 9, 15, 0, 0));
  expect(options[1].time).toEqual(new Date(2026, 9, 15, 0, 30));
  expect(options[47].time).toEqual(new Date(2026, 9, 15, 23, 30));
});

test("End times start at the start time, with the duration", () => {
  let start = new Date(2026, 9, 15, 11, 0);
  let options = TimeOptions.endTimes(start);
  expect(options[0].time).toEqual(start);
  expect(options[0].durationLabel).toBe("0 minutes");
  expect(options[1].time).toEqual(new Date(2026, 9, 15, 11, 30));
  expect(options[1].durationLabel).toBe("30 minutes");
  expect(options[2].durationLabel).toBe("1 hour");
  expect(options[3].durationLabel).toBe("1.5 hours");
  expect(options[4].durationLabel).toBe("2 hours");
  // Until the end of the day only
  expect(options.at(-1).time).toEqual(new Date(2026, 9, 15, 23, 30));
});

test("End times keep the minutes of an uneven start time", () => {
  let start = new Date(2026, 9, 15, 9, 10);
  let options = TimeOptions.endTimes(start);
  expect(options[1].time).toEqual(new Date(2026, 9, 15, 9, 40));
  expect(options[1].durationLabel).toBe("30 minutes");
});

test("End times on a later day are relative to the start", () => {
  let start = new Date(2026, 9, 15, 10, 0);
  let options = TimeOptions.endTimes(start, new Date(2026, 9, 16, 15, 0));
  expect(options[0].time).toEqual(new Date(2026, 9, 16, 0, 0));
  expect(options[0].durationLabel).toBe("14 hours");
  let sameTimeNextDay = options.find(option => option.time.getHours() == 10 && option.time.getMinutes() == 0);
  expect(sameTimeNextDay.durationLabel).toBe("1 day");
  let dayAndAHalf = options.find(option => option.time.getHours() == 22 && option.time.getMinutes() == 0);
  expect(dayAndAHalf.durationLabel).toBe("1.5 days");
});

test("On the day of the change to summer time, the lists skip 2:00 and show the real durations", () => {
  let starts = TimeOptions.startTimes(new Date(2026, 2, 29, 10, 0));
  expect(starts.length).toBe(46);
  expect(starts[4].time).toEqual(new Date(2026, 2, 29, 3, 0));
  let ends = TimeOptions.endTimes(new Date(2026, 2, 29, 1, 0));
  expect(ends[2].time).toEqual(new Date(2026, 2, 29, 3, 0));
  expect(ends[2].durationLabel).toBe("1 hour");
  expect(ends.at(-1).time).toEqual(new Date(2026, 2, 29, 23, 30));
});

test("On the day of the change to winter time, the lists end at the end of the day", () => {
  let starts = TimeOptions.startTimes(new Date(2026, 9, 25, 10, 0));
  expect(starts.at(-1).time).toEqual(new Date(2026, 9, 25, 23, 30));
  let ends = TimeOptions.endTimes(new Date(2026, 9, 25, 1, 0));
  expect(ends.find(option => option.time.getHours() == 3).durationLabel).toBe("3 hours");
  expect(ends.at(-1).time).toEqual(new Date(2026, 9, 25, 23, 30));
});

test("Duration labels", () => {
  expect(TimeOptions.durationLabel(0)).toBe("0 minutes");
  expect(TimeOptions.durationLabel(1)).toBe("1 minute");
  expect(TimeOptions.durationLabel(45)).toBe("45 minutes");
  expect(TimeOptions.durationLabel(60)).toBe("1 hour");
  expect(TimeOptions.durationLabel(90)).toBe("1.5 hours");
  expect(TimeOptions.durationLabel(23 * 60 + 30)).toBe("23.5 hours");
  expect(TimeOptions.durationLabel(24 * 60)).toBe("1 day");
  expect(TimeOptions.durationLabel(25 * 60)).toBe("25 hours");
  expect(TimeOptions.durationLabel(48 * 60)).toBe("2 days");
});

test("Typed times: 24 hours, am/pm, with and without minutes", () => {
  let day = new Date(2026, 9, 15, 10, 0);
  expect(TimeOptions.parseTime("14:30", day)).toEqual(new Date(2026, 9, 15, 14, 30));
  expect(TimeOptions.parseTime("2:30 PM", day)).toEqual(new Date(2026, 9, 15, 14, 30));
  expect(TimeOptions.parseTime("12:22 am", day)).toEqual(new Date(2026, 9, 15, 0, 22));
  expect(TimeOptions.parseTime("9", day)).toEqual(new Date(2026, 9, 15, 9, 0));
  expect(TimeOptions.parseTime(" 11 p.m. ", day)).toEqual(new Date(2026, 9, 15, 23, 0));
  expect(TimeOptions.parseTime("1130", day)).toEqual(new Date(2026, 9, 15, 11, 30));
  expect(() => TimeOptions.parseTime("25:00", day)).toThrow();
  expect(() => TimeOptions.parseTime("13 pm", day)).toThrow();
  expect(() => TimeOptions.parseTime("10:75", day)).toThrow();
  expect(() => TimeOptions.parseTime("lunch", day)).toThrow();
});
