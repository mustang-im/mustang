import { CalendarKeys, type KeyPress } from "../../Calendar/CalendarKeys";
import { expect, test } from "vitest";

function press(key: string, modifiers: Partial<KeyPress> = {}): KeyPress {
  let code = /^\d$/.test(key) ? "Digit" + key : /^[a-z]$/i.test(key) ? "Key" + key.toUpperCase() : key;
  return { key, code, ctrlKey: false, metaKey: false, altKey: false, shiftKey: false, ...modifiers };
}

test("New appointment and meeting", () => {
  expect(CalendarKeys.commandFor(press("n", { ctrlKey: true }))).toEqual({ command: "new-appointment" });
  expect(CalendarKeys.commandFor(press("A", { ctrlKey: true, shiftKey: true }))).toEqual({ command: "new-appointment" });
  expect(CalendarKeys.commandFor(press("Q", { ctrlKey: true, shiftKey: true }))).toEqual({ command: "new-meeting" });
  expect(CalendarKeys.commandFor(press("n", { metaKey: true }))).toEqual({ command: "new-appointment" });
});

test("Views", () => {
  expect(CalendarKeys.commandFor(press("1", { ctrlKey: true, altKey: true }))).toEqual({ command: "view", view: "day" });
  expect(CalendarKeys.commandFor(press("2", { ctrlKey: true, altKey: true }))).toEqual({ command: "view", view: "workweek" });
  expect(CalendarKeys.commandFor(press("3", { ctrlKey: true, altKey: true }))).toEqual({ command: "view", view: "week" });
  expect(CalendarKeys.commandFor(press("4", { ctrlKey: true, altKey: true }))).toEqual({ command: "view", view: "month" });
  expect(CalendarKeys.commandFor(press("5", { ctrlKey: true, altKey: true }))).toEqual({ command: "view", view: "schedule" });
  expect(CalendarKeys.commandFor(press("6", { ctrlKey: true, altKey: true }))).toBe(null);
  expect(CalendarKeys.commandFor(press("-", { altKey: true }))).toEqual({ command: "view", view: "week" });
  expect(CalendarKeys.commandFor(press("=", { altKey: true }))).toEqual({ command: "view", view: "month" });
});

test("Alt+digit shows that many days, Alt+0 ten days", () => {
  expect(CalendarKeys.commandFor(press("3", { altKey: true }))).toEqual({ command: "day-count", days: 3 });
  expect(CalendarKeys.commandFor(press("0", { altKey: true }))).toEqual({ command: "day-count", days: 10 });
});

test("Alt+digit works with the key code, also when the layout gives another character", () => {
  let key = { key: "¡", code: "Digit1", ctrlKey: false, metaKey: false, altKey: true, shiftKey: false };
  expect(CalendarKeys.commandFor(key)).toEqual({ command: "day-count", days: 1 });
});

test("Navigation", () => {
  expect(CalendarKeys.commandFor(press("g", { ctrlKey: true }))).toEqual({ command: "go-to-date" });
  expect(CalendarKeys.commandFor(press("ArrowRight", { ctrlKey: true }))).toEqual({ command: "step-days", days: 1 });
  expect(CalendarKeys.commandFor(press("ArrowLeft", { ctrlKey: true }))).toEqual({ command: "step-days", days: -1 });
  expect(CalendarKeys.commandFor(press("ArrowDown", { altKey: true }))).toEqual({ command: "step-days", days: 7 });
  expect(CalendarKeys.commandFor(press("ArrowUp", { altKey: true }))).toEqual({ command: "step-days", days: -7 });
  expect(CalendarKeys.commandFor(press("PageDown", { altKey: true }))).toEqual({ command: "step-months", months: 1 });
  expect(CalendarKeys.commandFor(press("PageUp", { altKey: true }))).toEqual({ command: "step-months", months: -1 });
  expect(CalendarKeys.commandFor(press("ArrowRight", { ctrlKey: true, altKey: true }))).toEqual({ command: "step-period", direction: 1 });
  expect(CalendarKeys.commandFor(press("Y", { altKey: true, shiftKey: true }))).toEqual({ command: "today" });
});

test("Item commands", () => {
  expect(CalendarKeys.commandFor(press("Enter"))).toEqual({ command: "open" });
  expect(CalendarKeys.commandFor(press("Delete"))).toEqual({ command: "delete" });
  expect(CalendarKeys.commandFor(press("f", { ctrlKey: true }))).toEqual({ command: "forward" });
  expect(CalendarKeys.commandFor(press("Escape"))).toEqual({ command: "escape" });
});

test("Plain letters and other keys do nothing", () => {
  expect(CalendarKeys.commandFor(press("n"))).toBe(null);
  expect(CalendarKeys.commandFor(press("Enter", { shiftKey: true }))).toBe(null);
  expect(CalendarKeys.commandFor(press("x", { ctrlKey: true }))).toBe(null);
  expect(CalendarKeys.commandFor(press("ArrowDown"))).toBe(null);
});
