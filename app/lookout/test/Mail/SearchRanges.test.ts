import { ReceivedRange, ReceivedRanges, SizeRange, SizeRanges } from "../../Mail/Search/SearchRanges";
import { expect, test } from "vitest";

// Thursday, 15 October 2026, 14:30 local time
const now = new Date(2026, 9, 15, 14, 30);

function day(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
}

test("Today and Yesterday cover whole days", () => {
  let today = ReceivedRanges.dates(ReceivedRange.Today, now);
  expect(day(today.start)).toBe("2026-10-15 0:0");
  expect(day(today.end)).toBe("2026-10-15 23:59");
  let yesterday = ReceivedRanges.dates(ReceivedRange.Yesterday, now);
  expect(day(yesterday.start)).toBe("2026-10-14 0:0");
  expect(day(yesterday.end)).toBe("2026-10-14 23:59");
});

test("Weeks start on Monday", () => {
  let thisWeek = ReceivedRanges.dates(ReceivedRange.ThisWeek, now);
  expect(day(thisWeek.start)).toBe("2026-10-12 0:0");
  expect(day(thisWeek.end)).toBe("2026-10-18 23:59");
  let lastWeek = ReceivedRanges.dates(ReceivedRange.LastWeek, now);
  expect(day(lastWeek.start)).toBe("2026-10-5 0:0");
  expect(day(lastWeek.end)).toBe("2026-10-11 23:59");
});

test("Months and years, also across the year boundary", () => {
  let lastMonth = ReceivedRanges.dates(ReceivedRange.LastMonth, now);
  expect(day(lastMonth.start)).toBe("2026-9-1 0:0");
  expect(day(lastMonth.end)).toBe("2026-9-30 23:59");
  let january = new Date(2027, 0, 10);
  let december = ReceivedRanges.dates(ReceivedRange.LastMonth, january);
  expect(day(december.start)).toBe("2026-12-1 0:0");
  expect(day(december.end)).toBe("2026-12-31 23:59");
  let lastYear = ReceivedRanges.dates(ReceivedRange.LastYear, now);
  expect(day(lastYear.start)).toBe("2025-1-1 0:0");
  expect(day(lastYear.end)).toBe("2025-12-31 23:59");
});

test("Custom dates include the whole end day, and either end may be open", () => {
  let custom = ReceivedRanges.dates(ReceivedRange.Custom, now, new Date(2026, 8, 21, 10), new Date(2026, 9, 1, 8));
  expect(day(custom.start)).toBe("2026-9-21 0:0");
  expect(day(custom.end)).toBe("2026-10-1 23:59");
  let since = ReceivedRanges.dates(ReceivedRange.Custom, now, new Date(2026, 8, 21), null);
  expect(since.end).toBeNull();
  let any = ReceivedRanges.dates(ReceivedRange.Any, now, new Date(2026, 8, 21), null);
  expect(any.start).toBeNull();
  expect(any.end).toBeNull();
});

test("Size ranges don't overlap", () => {
  let previousMax = -1;
  for (let size of SizeRanges.named) {
    let bytes = SizeRanges.bytes(size);
    expect(bytes.min ?? 0).toBe(previousMax + 1);
    previousMax = bytes.max;
  }
  expect(previousMax).toBeNull();
  expect(SizeRanges.bytes(SizeRange.Any)).toEqual({ min: null, max: null });
});
