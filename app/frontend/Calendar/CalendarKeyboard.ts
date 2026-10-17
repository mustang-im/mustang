import { selectedCalendar, selectedDate, selectedEvent, startDate, type DateInterval } from "./selected";
import { createNewEvent } from "./event";
import { openEvent } from "./open";
import { GlobalKeyboard } from "../MainWindow/GlobalKeyboard";
import { Keyboard } from "../Util/Keyboard";
import { getLocalStorage } from "../Util/LocalStorage";
import { getToday, getWeekStart } from "../Util/date";
import { get } from "svelte/store";

export type CalendarKeyCommand =
  { command: "new-event" } |
  { command: "view", view: DateInterval } |
  { command: "step-days", days: number } |
  { command: "step-months", months: number } |
  { command: "step-period", direction: number } |
  { command: "week-start" } |
  { command: "week-end" } |
  { command: "today" } |
  { command: "open" } |
  { command: "search" };

export class CalendarKeyboard {
  static async onKey(event: KeyboardEvent) {
    if (event.defaultPrevented || Keyboard.isTextField(event.target)) {
      return;
    }
    let command = CalendarKeyboard.commandFor(event);
    if (!command) {
      return;
    }
    Keyboard.consume(event);
    await CalendarKeyboard.run(command);
  }

  static commandFor(event: KeyboardEvent, isMac = Keyboard.isMac()): CalendarKeyCommand | null {
    let ctrl = Keyboard.isCtrl(event);
    let alt = event.altKey;
    let shift = event.shiftKey;
    let key = event.key.length == 1 ? event.key.toLowerCase() : event.key;
    let arrow = key == "ArrowRight" ? 1 : key == "ArrowLeft" ? -1 : 0;
    if (ctrl && alt && !shift) {
      const kViews: DateInterval[] = [null, 1, 5, 7, 31];
      let digit = Keyboard.digit(event);
      let view = digit ? kViews[digit] : null;
      if (view) {
        return { command: "view", view };
      }
      return arrow ? { command: "step-period", direction: arrow } : null;
    }
    if (ctrl && !alt && !shift) {
      if (key == "n") {
        return { command: "new-event" };
      } else if (key == "e") {
        return { command: "search" };
      }
      return arrow ? { command: "step-days", days: arrow } : null;
    }
    if (alt && !ctrl && !isMac) {
      if (shift) {
        return event.code == "KeyY" ? { command: "today" } : null;
      } else if (key == "ArrowDown" || key == "ArrowUp") {
        return { command: "step-days", days: key == "ArrowDown" ? 7 : -7 };
      } else if (key == "PageDown" || key == "PageUp") {
        return { command: "step-months", months: key == "PageDown" ? 1 : -1 };
      } else if (key == "Home") {
        return { command: "week-start" };
      } else if (key == "End") {
        return { command: "week-end" };
      } else if (key == "-") {
        return { command: "view", view: 7 };
      } else if (key == "=") {
        return { command: "view", view: 31 };
      }
      return null;
    }
    if (key == "Enter" && !ctrl && !alt && !shift &&
        !(event.target as HTMLElement)?.closest?.("button, a")) {
      return { command: "open" };
    }
    return null;
  }

  static async run(command: CalendarKeyCommand) {
    let view = getLocalStorage<DateInterval>("calendar.view", 2);
    let day = CalendarKeyboard.currentDay(view.value);
    if (command.command == "new-event") {
      createNewEvent(get(selectedCalendar), get(selectedDate), false);
    } else if (command.command == "view") {
      view.value = command.view;
    } else if (command.command == "step-days") {
      CalendarKeyboard.show(CalendarKeyboard.addDays(day, command.days));
    } else if (command.command == "step-months") {
      CalendarKeyboard.show(CalendarKeyboard.addMonths(day, command.months));
    } else if (command.command == "step-period") {
      CalendarKeyboard.show(CalendarKeyboard.nextPeriod(day, view.value, command.direction));
    } else if (command.command == "week-start") {
      CalendarKeyboard.show(getWeekStart(day));
    } else if (command.command == "week-end") {
      CalendarKeyboard.show(CalendarKeyboard.addDays(getWeekStart(day), 6));
    } else if (command.command == "today") {
      CalendarKeyboard.show(getToday());
    } else if (command.command == "open") {
      let event = get(selectedEvent);
      if (event) {
        openEvent(event, true);
      }
    } else if (command.command == "search") {
      GlobalKeyboard.focusSearch();
    }
  }

  static currentDay(view: DateInterval): Date {
    let start = get(startDate);
    let selected = get(selectedDate);
    if (view == 2 || view == 0) {
      return selected;
    } else if (view == 5 || view == 7) {
      return getWeekStart(start).getTime() == getWeekStart(selected).getTime() ? selected : start;
    } else if (view == 31) {
      // The month view's first row may start in the previous month
      let month = CalendarKeyboard.addDays(start, 7);
      return month.getMonth() == selected.getMonth() && month.getFullYear() == selected.getFullYear() ? selected : month;
    }
    return start;
  }

  static nextPeriod(day: Date, view: DateInterval, direction: number): Date {
    if (view == 31) {
      return CalendarKeyboard.addMonths(day, direction);
    } else if (view == 5 || view == 7 || view == 28) {
      return CalendarKeyboard.addDays(day, view == 28 ? 28 * direction : 7 * direction);
    }
    return CalendarKeyboard.addDays(day, direction);
  }

  static addDays(date: Date, days: number): Date {
    let result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  static addMonths(date: Date, months: number): Date {
    let result = new Date(date);
    result.setDate(1);
    result.setMonth(result.getMonth() + months);
    let daysInMonth = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
    result.setDate(Math.min(date.getDate(), daysInMonth));
    return result;
  }

  static show(date: Date) {
    startDate.set(new Date(date));
    selectedDate.set(new Date(date));
  }
}
