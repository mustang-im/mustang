import { getWeekStart } from "../../../frontend/Util/date";
import { gt } from "../../../l10n/l10n";

export enum ReceivedRange {
  Any = "any",
  Today = "today",
  Yesterday = "yesterday",
  ThisWeek = "this-week",
  LastWeek = "last-week",
  ThisMonth = "this-month",
  LastMonth = "last-month",
  ThisYear = "this-year",
  LastYear = "last-year",
  Custom = "custom",
}

export interface DateSpan {
  start: Date | null;
  end: Date | null;
}

export class ReceivedRanges {
  static readonly named = [
    ReceivedRange.Today,
    ReceivedRange.Yesterday,
    ReceivedRange.ThisWeek,
    ReceivedRange.LastWeek,
    ReceivedRange.ThisMonth,
    ReceivedRange.LastMonth,
    ReceivedRange.ThisYear,
    ReceivedRange.LastYear,
  ];

  static label(range: ReceivedRange): string {
    switch (range) {
      case ReceivedRange.Any: return gt`Any Time`;
      case ReceivedRange.Today: return gt`Today`;
      case ReceivedRange.Yesterday: return gt`Yesterday`;
      case ReceivedRange.ThisWeek: return gt`This Week`;
      case ReceivedRange.LastWeek: return gt`Last Week`;
      case ReceivedRange.ThisMonth: return gt`This Month`;
      case ReceivedRange.LastMonth: return gt`Last Month`;
      case ReceivedRange.ThisYear: return gt`This Year`;
      case ReceivedRange.LastYear: return gt`Last Year`;
      case ReceivedRange.Custom: return gt`Custom Dates`;
    }
  }

  static dates(range: ReceivedRange, now: Date, customStart: Date | null = null, customEnd: Date | null = null): DateSpan {
    let today = ReceivedRanges.startOfDay(now);
    let year = now.getFullYear();
    let month = now.getMonth();
    switch (range) {
      case ReceivedRange.Today:
        return ReceivedRanges.span(today, ReceivedRanges.addDays(today, 1));
      case ReceivedRange.Yesterday:
        return ReceivedRanges.span(ReceivedRanges.addDays(today, -1), today);
      case ReceivedRange.ThisWeek: {
        let weekStart = getWeekStart(now);
        return ReceivedRanges.span(weekStart, ReceivedRanges.addDays(weekStart, 7));
      }
      case ReceivedRange.LastWeek: {
        let weekStart = getWeekStart(now);
        return ReceivedRanges.span(ReceivedRanges.addDays(weekStart, -7), weekStart);
      }
      case ReceivedRange.ThisMonth:
        return ReceivedRanges.span(new Date(year, month, 1), new Date(year, month + 1, 1));
      case ReceivedRange.LastMonth:
        return ReceivedRanges.span(new Date(year, month - 1, 1), new Date(year, month, 1));
      case ReceivedRange.ThisYear:
        return ReceivedRanges.span(new Date(year, 0, 1), new Date(year + 1, 0, 1));
      case ReceivedRange.LastYear:
        return ReceivedRanges.span(new Date(year - 1, 0, 1), new Date(year, 0, 1));
      case ReceivedRange.Custom:
        return {
          start: customStart ? ReceivedRanges.startOfDay(customStart) : null,
          end: customEnd ? new Date(ReceivedRanges.addDays(ReceivedRanges.startOfDay(customEnd), 1).getTime() - 1) : null,
        };
      default:
        return { start: null, end: null };
    }
  }

  static inputValue(date: Date | null): string {
    if (!date) {
      return "";
    }
    let month = String(date.getMonth() + 1).padStart(2, "0");
    let day = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${month}-${day}`;
  }

  static parseInputValue(value: string): Date | null {
    let match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? "");
    return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null;
  }

  static span(start: Date, nextStart: Date): DateSpan {
    return { start, end: new Date(nextStart.getTime() - 1) };
  }

  static startOfDay(date: Date): Date {
    let result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  static addDays(date: Date, days: number): Date {
    let result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
}

export enum SizeRange {
  Any = "any",
  Tiny = "tiny",
  Small = "small",
  Medium = "medium",
  Large = "large",
  VeryLarge = "very-large",
  Huge = "huge",
  Enormous = "enormous",
}

export class SizeRanges {
  static readonly named = [
    SizeRange.Tiny,
    SizeRange.Small,
    SizeRange.Medium,
    SizeRange.Large,
    SizeRange.VeryLarge,
    SizeRange.Huge,
    SizeRange.Enormous,
  ];

  static label(size: SizeRange): string {
    switch (size) {
      case SizeRange.Any: return gt`Any Size`;
      case SizeRange.Tiny: return gt`Tiny (< 10 KB)`;
      case SizeRange.Small: return gt`Small (10 - 25 KB)`;
      case SizeRange.Medium: return gt`Medium (25 - 100 KB)`;
      case SizeRange.Large: return gt`Large (100 - 500 KB)`;
      case SizeRange.VeryLarge: return gt`Very Large (500 KB - 1 MB)`;
      case SizeRange.Huge: return gt`Huge (1 - 5 MB)`;
      case SizeRange.Enormous: return gt`Enormous (> 5 MB)`;
    }
  }

  static bytes(size: SizeRange): { min: number | null, max: number | null } {
    const kKB = 1024;
    const kMB = 1024 * kKB;
    switch (size) {
      case SizeRange.Tiny: return { min: null, max: 10 * kKB - 1 };
      case SizeRange.Small: return { min: 10 * kKB, max: 25 * kKB - 1 };
      case SizeRange.Medium: return { min: 25 * kKB, max: 100 * kKB - 1 };
      case SizeRange.Large: return { min: 100 * kKB, max: 500 * kKB - 1 };
      case SizeRange.VeryLarge: return { min: 500 * kKB, max: kMB - 1 };
      case SizeRange.Huge: return { min: kMB, max: 5 * kMB - 1 };
      case SizeRange.Enormous: return { min: 5 * kMB, max: null };
      default: return { min: null, max: null };
    }
  }
}
