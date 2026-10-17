import { SMLTimeOptions } from "../../Mail/SML/SMLTimeOptions";
import { SMLData } from "../../../logic/Mail/SML/SMLData";
import { TSMLMeetingTimePreference, type TSMLMeetingTimeVote } from "../../../logic/Mail/SML/TSML";
import { expect, test } from "vitest";

const at = (day: number, hour: number, minute = 0) => new Date(2026, 9, day, hour, minute);

test("Time options are grouped by day and sorted", () => {
  let days = SMLTimeOptions.byDay([at(21, 14), at(20, 10), at(21, 9), at(20, 8, 30)]);
  expect(days.map(day => day.day.getDate())).toEqual([20, 21]);
  expect(days[0].times.map(time => time.getHours())).toEqual([8, 10]);
  expect(days[1].times.map(time => time.getHours())).toEqual([9, 14]);
  expect(SMLTimeOptions.byDay([])).toEqual([]);
});

test("Conflicts are the overlapping events, without all-day and cancelled ones", () => {
  let events = [
    { title: "Before", startTime: at(20, 8), endTime: at(20, 9) },
    { title: "Overlap start", startTime: at(20, 9, 30), endTime: at(20, 10, 15) },
    { title: "Inside", startTime: at(20, 10, 15), endTime: at(20, 10, 30) },
    { title: "Right after", startTime: at(20, 11), endTime: at(20, 12) },
    { title: "All day", startTime: at(20, 0), endTime: at(21, 0), allDay: true },
    { title: "Cancelled", startTime: at(20, 10), endTime: at(20, 11), isCancelled: true },
  ] as any[];
  let conflicts = SMLTimeOptions.conflicts(at(20, 10), 60, events);
  expect(conflicts.map(event => event.title)).toEqual(["Overlap start", "Inside"]);
});

test("A vote replaces the earlier vote for the same time", () => {
  let votes: TSMLMeetingTimeVote[] = [];
  SMLTimeOptions.vote(votes, at(20, 10), TSMLMeetingTimePreference.Accept);
  SMLTimeOptions.vote(votes, at(20, 14), TSMLMeetingTimePreference.Reject);
  SMLTimeOptions.vote(votes, new Date(at(20, 10)), TSMLMeetingTimePreference.Maybe);
  expect(votes.length).toBe(2);
  expect(SMLTimeOptions.preference(votes, at(20, 10))).toBe(TSMLMeetingTimePreference.Maybe);
  expect(SMLTimeOptions.preference(votes, at(20, 14))).toBe(TSMLMeetingTimePreference.Reject);
  expect(SMLTimeOptions.preference(votes, at(20, 16))).toBeNull();
});

test("Adding keeps the options sorted and unique, removing finds equal times", () => {
  let options = [at(20, 14)];
  SMLTimeOptions.add(options, at(20, 10));
  SMLTimeOptions.add(options, new Date(at(20, 14)));
  expect(options).toEqual([at(20, 10), at(20, 14)]);
  SMLTimeOptions.remove(options, new Date(at(20, 10)));
  expect(options).toEqual([at(20, 14)]);
});

test("The next proposed time follows the last option, else tomorrow at the next full hour", () => {
  expect(SMLTimeOptions.nextOption([at(20, 14), at(20, 9)], 30)).toEqual(at(20, 14, 30));
  expect(SMLTimeOptions.nextOption([], 60, at(20, 9, 41))).toEqual(at(21, 10));
});
