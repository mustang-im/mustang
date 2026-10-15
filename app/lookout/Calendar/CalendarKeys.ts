import type { CalendarViewType } from "./CalendarSettings";

export type CalendarCommand =
  { command: "new-appointment" } |
  { command: "new-meeting" } |
  { command: "view", view: CalendarViewType } |
  { command: "day-count", days: number } |
  { command: "go-to-date" } |
  { command: "today" } |
  { command: "step-days", days: number } |
  { command: "step-months", months: number } |
  { command: "step-period", direction: number } |
  { command: "open" } |
  { command: "delete" } |
  { command: "forward" } |
  { command: "escape" };

export interface KeyPress {
  key: string;
  code: string;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
}

export class CalendarKeys {
  static commandFor(press: KeyPress): CalendarCommand | null {
    let ctrl = press.ctrlKey || press.metaKey;
    let alt = press.altKey;
    let shift = press.shiftKey;
    let key = press.key.length == 1 ? press.key.toLowerCase() : press.key;
    let digit = /^Digit(\d)$/.exec(press.code)?.[1] ?? /^Numpad(\d)$/.exec(press.code)?.[1];
    if (ctrl && alt && !shift && digit) {
      const kViews: Record<string, CalendarViewType> = { "1": "day", "2": "workweek", "3": "week", "4": "month", "5": "schedule" };
      return kViews[digit] ? { command: "view", view: kViews[digit] } : null;
    }
    if (ctrl && alt && !shift && (key == "ArrowRight" || key == "ArrowLeft")) {
      return { command: "step-period", direction: key == "ArrowRight" ? 1 : -1 };
    }
    if (ctrl && !alt) {
      if (!shift && key == "n") {
        return { command: "new-appointment" };
      }
      if (shift && key == "a") {
        return { command: "new-appointment" };
      }
      if (shift && key == "q") {
        return { command: "new-meeting" };
      }
      if (!shift && key == "g") {
        return { command: "go-to-date" };
      }
      if (!shift && key == "f") {
        return { command: "forward" };
      }
      if (!shift && (key == "ArrowRight" || key == "ArrowLeft")) {
        return { command: "step-days", days: key == "ArrowRight" ? 1 : -1 };
      }
      return null;
    }
    if (alt && !ctrl) {
      if (shift && key == "y") {
        return { command: "today" };
      }
      if (shift) {
        return null;
      }
      if (digit) {
        return { command: "day-count", days: digit == "0" ? 10 : parseInt(digit) };
      }
      if (key == "-") {
        return { command: "view", view: "week" };
      }
      if (key == "=") {
        return { command: "view", view: "month" };
      }
      if (key == "ArrowDown" || key == "ArrowUp") {
        return { command: "step-days", days: key == "ArrowDown" ? 7 : -7 };
      }
      if (key == "PageDown" || key == "PageUp") {
        return { command: "step-months", months: key == "PageDown" ? 1 : -1 };
      }
      return null;
    }
    if (ctrl || alt || shift) {
      return null;
    }
    switch (key) {
    case "Enter":
      return { command: "open" };
    case "Delete":
      return { command: "delete" };
    case "Escape":
      return { command: "escape" };
    }
    return null;
  }
}
