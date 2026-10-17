import { kMinutesPerDay } from "../../../logic/Calendar/WorkHours";
import { TimeOptions, type TimeOption } from "../../Calendar/EditEvent/TimeOptions";
import { k1DayMS } from "../../../frontend/Util/date";
import { getDateTimeLocale } from "../../../l10n/l10n";

export class WorkTimeOptions {
  readonly day: Date;

  constructor(today = new Date()) {
    this.day = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  }

  timeOf(minutes: number): Date {
    return new Date(this.day.getFullYear(), this.day.getMonth(), this.day.getDate(), 0, minutes);
  }

  minutesOf(time: Date, isEnd = false): number {
    let minutes = time.toDateString() == this.day.toDateString()
      ? time.getHours() * 60 + time.getMinutes()
      : kMinutesPerDay;
    return isEnd && minutes == 0 ? kMinutesPerDay : minutes;
  }

  get startTimes(): TimeOption[] {
    return TimeOptions.startTimes(this.day);
  }

  get endTimes(): TimeOption[] {
    let midnight = this.timeOf(kMinutesPerDay);
    return [ ...this.startTimes.slice(1), { time: midnight, label: TimeOptions.timeLabel(midnight) } ];
  }

  static weekdays(locale = getDateTimeLocale()): { weekday: number, name: string }[] {
    const kWeekOrder = [ 1, 2, 3, 4, 5, 6, 0 ];
    const kASunday = new Date(Date.UTC(2024, 0, 7));
    return kWeekOrder.map(weekday => ({
      weekday,
      name: new Date(kASunday.getTime() + weekday * k1DayMS).toLocaleDateString(locale, { weekday: "long", timeZone: "UTC" }),
    }));
  }
}
