import type { Event } from "../../../logic/Calendar/Event";
import { TimeOptions } from "./TimeOptions";
import { gt } from "../../../l10n/l10n";

export type ReminderMinutes = number | null;

export class Reminder {
  static minutesBefore(event: Event): ReminderMinutes {
    if (!event.alarm || !event.startTime) {
      return null;
    }
    return Math.round((event.startTime.getTime() - event.alarm.getTime()) / 60000);
  }

  static setMinutesBefore(event: Event, minutes: ReminderMinutes) {
    if (minutes == null) {
      event.alarm = null;
      return;
    }
    event.alarm = new Date(event.startTime.getTime() - minutes * 60000);
  }

  static choices(current: ReminderMinutes): ReminderMinutes[] {
    const kChoices: ReminderMinutes[] = [null, 0, 5, 10, 15, 30, 60, 120, 180, 240, 480, 720, 1080, 1440, 2880, 4320, 10080, 20160];
    if (kChoices.includes(current)) {
      return kChoices;
    }
    return [...kChoices, current].sort((a, b) => (a ?? -1) - (b ?? -1));
  }

  static label(minutes: ReminderMinutes): string {
    if (minutes == null) {
      return gt`None *=> No reminder`;
    }
    const kWeek = 7 * 24 * 60;
    if (minutes > 0 && minutes % kWeek == 0) {
      return TimeOptions.amount(minutes / kWeek, { one: "week", other: "weeks" });
    }
    if (minutes == 12 * 60) {
      return TimeOptions.amount(0.5, { one: "day", other: "days" });
    }
    if (minutes > 60 && minutes % 30 != 0) {
      return TimeOptions.amount(minutes, { one: "minute", other: "minutes" });
    }
    return TimeOptions.durationLabel(minutes);
  }
}
