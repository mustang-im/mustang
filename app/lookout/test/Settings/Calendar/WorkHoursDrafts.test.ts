import { WorkHoursDrafts } from "../../../Settings/Calendar/WorkHoursDrafts";
import { WorkTimeOptions } from "../../../Settings/Calendar/WorkTimeOptions";
import { Calendar } from "../../../../logic/Calendar/Calendar";
import { expect, test, vi } from "vitest";

class SharedCalendar extends Calendar {
  get isOtherPersonsCalendar(): boolean {
    return true;
  }
}

function calendarWithSaveSpy(calendar = new Calendar()) {
  let save = vi.spyOn(calendar, "saveWorkHours").mockResolvedValue();
  return { calendar, save };
}

test("Edits go to a draft until saved", async () => {
  let { calendar, save } = calendarWithSaveSpy();
  let drafts = new WorkHoursDrafts();
  let draft = drafts.draftOf(calendar);
  expect(draft).not.toBe(calendar.workHours);
  expect(drafts.draftOf(calendar)).toBe(draft);

  draft.days[6].isWorkDay = true;
  draft.days[1].startMinutes = 7 * 60;
  expect(calendar.workHours.days[6].isWorkDay).toBe(false);
  expect(drafts.changedCalendars).toEqual([ calendar ]);

  await drafts.save();
  expect(calendar.workHours.days[6].isWorkDay).toBe(true);
  expect(calendar.workHours.days[1].startMinutes).toBe(7 * 60);
  expect(save).toHaveBeenCalledTimes(1);
});

test("Unchanged work hours are not saved", async () => {
  let { calendar, save } = calendarWithSaveSpy();
  let drafts = new WorkHoursDrafts();
  drafts.draftOf(calendar);
  expect(drafts.changedCalendars).toEqual([]);
  await drafts.save();
  expect(save).not.toHaveBeenCalled();
});

test("Another person's work hours are shown as they are, not as a draft", async () => {
  let { calendar, save } = calendarWithSaveSpy(new SharedCalendar());
  let drafts = new WorkHoursDrafts();
  expect(drafts.draftOf(calendar)).toBe(calendar.workHours);
  await drafts.save();
  expect(save).not.toHaveBeenCalled();
});

test("Unknown work hours have no draft", () => {
  let calendar = new Calendar();
  calendar.workHours = null;
  expect(new WorkHoursDrafts().draftOf(calendar)).toBeNull();
});

test("Times of the work day convert to minutes, midnight at the end is 24:00", () => {
  let times = new WorkTimeOptions(new Date(2026, 9, 15, 13, 45));
  expect(times.timeOf(8 * 60 + 30)).toEqual(new Date(2026, 9, 15, 8, 30));
  expect(times.minutesOf(new Date(2026, 9, 15, 17, 30))).toBe(17 * 60 + 30);
  expect(times.minutesOf(new Date(2026, 9, 16, 0, 0), true)).toBe(24 * 60);
  expect(times.minutesOf(new Date(2026, 9, 15, 0, 0), true)).toBe(24 * 60);
  expect(times.minutesOf(new Date(2026, 9, 15, 0, 0))).toBe(0);
  expect(times.startTimes[0].time).toEqual(new Date(2026, 9, 15, 0, 0));
  expect(times.endTimes.at(-1).time).toEqual(new Date(2026, 9, 16, 0, 0));
  expect(times.endTimes[0].time).toEqual(new Date(2026, 9, 15, 0, 30));
});

test("Weekdays start on Monday", () => {
  let weekdays = WorkTimeOptions.weekdays("en-US");
  expect(weekdays.map(day => day.weekday)).toEqual([ 1, 2, 3, 4, 5, 6, 0 ]);
  expect(weekdays[0].name).toBe("Monday");
  expect(weekdays[6].name).toBe("Sunday");
});
