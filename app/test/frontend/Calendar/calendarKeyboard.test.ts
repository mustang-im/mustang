// @vitest-environment happy-dom
// app first, to resolve the import cycle around Abstract/Account.ts
import "../../../logic/app";
import { CalendarKeyboard } from "../../../frontend/Calendar/CalendarKeyboard";
import { selectedDate, startDate, type DateInterval } from "../../../frontend/Calendar/selected";
import { getLocalStorage } from "../../../frontend/Util/LocalStorage";
import { get } from "svelte/store";
import { beforeEach, expect, test } from "vitest";

function press(key: string, init: KeyboardEventInit = {}): KeyboardEvent {
  return new KeyboardEvent("keydown", { key, cancelable: true, bubbles: true, ...init });
}

function command(event: KeyboardEvent, isMac = false) {
  return CalendarKeyboard.commandFor(event, isMac);
}

const view = getLocalStorage<DateInterval>("calendar.view", 2);

function showing(viewInterval: DateInterval, start: Date, selected = start) {
  view.value = viewInterval;
  startDate.set(new Date(start));
  selectedDate.set(new Date(selected));
}

function shownDay(): string {
  return get(startDate).toDateString() + " / " + get(selectedDate).toDateString();
}

function day(year: number, month: number, date: number): Date {
  return new Date(year, month - 1, date);
}

beforeEach(() => {
  localStorage.clear();
});

test("Ctrl+Alt+1..4 and Alt+- / Alt+= switch the view", () => {
  expect(command(press("1", { code: "Digit1", ctrlKey: true, altKey: true }))).toEqual({ command: "view", view: 1 });
  expect(command(press("²", { code: "Digit2", ctrlKey: true, altKey: true }))).toEqual({ command: "view", view: 5 });
  expect(command(press("3", { code: "Digit3", ctrlKey: true, altKey: true }))).toEqual({ command: "view", view: 7 });
  expect(command(press("4", { code: "Digit4", ctrlKey: true, altKey: true }))).toEqual({ command: "view", view: 31 });
  expect(command(press("5", { code: "Digit5", ctrlKey: true, altKey: true }))).toBeNull();
  expect(command(press("-", { code: "Minus", altKey: true }))).toEqual({ command: "view", view: 7 });
  expect(command(press("=", { code: "Equal", altKey: true }))).toEqual({ command: "view", view: 31 });
  // Option+- types a dash on macOS
  expect(command(press("–", { code: "Minus", altKey: true }), true)).toBeNull();
});

test("Navigation keys", () => {
  expect(command(press("ArrowRight", { ctrlKey: true }))).toEqual({ command: "step-days", days: 1 });
  expect(command(press("ArrowLeft", { ctrlKey: true }))).toEqual({ command: "step-days", days: -1 });
  expect(command(press("ArrowRight", { ctrlKey: true, altKey: true }))).toEqual({ command: "step-period", direction: 1 });
  expect(command(press("ArrowDown", { altKey: true }))).toEqual({ command: "step-days", days: 7 });
  expect(command(press("ArrowUp", { altKey: true }))).toEqual({ command: "step-days", days: -7 });
  expect(command(press("PageDown", { altKey: true }))).toEqual({ command: "step-months", months: 1 });
  expect(command(press("PageUp", { altKey: true }))).toEqual({ command: "step-months", months: -1 });
  expect(command(press("Home", { altKey: true }))).toEqual({ command: "week-start" });
  expect(command(press("End", { altKey: true }))).toEqual({ command: "week-end" });
  expect(command(press("Y", { code: "KeyY", altKey: true, shiftKey: true }))).toEqual({ command: "today" });
  expect(command(press("ArrowDown"))).toBeNull();
});

test("New event, search and open", () => {
  expect(command(press("n", { ctrlKey: true }))).toEqual({ command: "new-event" });
  expect(command(press("n", { metaKey: true }), true)).toEqual({ command: "new-event" });
  expect(command(press("e", { ctrlKey: true }))).toEqual({ command: "search" });
  expect(command(press("Enter"))).toEqual({ command: "open" });
  expect(command(press("Enter", { shiftKey: true }))).toBeNull();
});

test("Enter on a button stays the button's", () => {
  let button = document.createElement("button");
  document.body.append(button);
  let result: any = "unset";
  button.addEventListener("keydown", event => result = command(event));
  button.dispatchEvent(press("Enter"));
  expect(result).toBeNull();
  button.remove();
});

test("Keys don't act in text fields", async () => {
  showing(1, day(2026, 10, 16));
  let input = document.createElement("input");
  document.body.append(input);
  let event = press("ArrowRight", { ctrlKey: true });
  input.addEventListener("keydown", keyEvent => CalendarKeyboard.onKey(keyEvent));
  input.dispatchEvent(event);
  expect(event.defaultPrevented).toBe(false);
  expect(shownDay()).toBe(day(2026, 10, 16).toDateString() + " / " + day(2026, 10, 16).toDateString());
  input.remove();
});

test("Day view: next and previous day, week, month", async () => {
  showing(1, day(2026, 10, 16));
  await CalendarKeyboard.run({ command: "step-days", days: 1 });
  expect(get(startDate).toDateString()).toBe(day(2026, 10, 17).toDateString());
  expect(get(selectedDate).toDateString()).toBe(day(2026, 10, 17).toDateString());
  await CalendarKeyboard.run({ command: "step-days", days: -7 });
  expect(get(startDate).toDateString()).toBe(day(2026, 10, 10).toDateString());
  await CalendarKeyboard.run({ command: "step-period", direction: 1 });
  expect(get(startDate).toDateString()).toBe(day(2026, 10, 11).toDateString());
  await CalendarKeyboard.run({ command: "step-months", months: 1 });
  expect(get(startDate).toDateString()).toBe(day(2026, 11, 11).toDateString());
});

test("Next month keeps the day, as far as the month has it", async () => {
  showing(1, day(2026, 1, 31));
  await CalendarKeyboard.run({ command: "step-months", months: 1 });
  expect(get(startDate).toDateString()).toBe(day(2026, 2, 28).toDateString());
});

test("Week view: next period is the next week, from the selected day", async () => {
  // Wednesday selected in the week of Monday 12 Oct 2026
  showing(7, day(2026, 10, 12), day(2026, 10, 14));
  await CalendarKeyboard.run({ command: "step-period", direction: 1 });
  expect(get(selectedDate).toDateString()).toBe(day(2026, 10, 21).toDateString());
  await CalendarKeyboard.run({ command: "week-start" });
  expect(get(selectedDate).toDateString()).toBe(day(2026, 10, 19).toDateString());
  await CalendarKeyboard.run({ command: "week-end" });
  expect(get(selectedDate).toDateString()).toBe(day(2026, 10, 25).toDateString());
});

test("Week view: a selected day outside the shown week is ignored", async () => {
  showing(7, day(2026, 10, 12), day(2026, 9, 1));
  await CalendarKeyboard.run({ command: "step-days", days: 1 });
  expect(get(selectedDate).toDateString()).toBe(day(2026, 10, 13).toDateString());
});

test("Month view: next period is the next month, also when the first row starts in the previous month", async () => {
  // November 2026 shown: its first row starts on Monday 26 Oct
  showing(31, day(2026, 10, 26), day(2026, 10, 26));
  await CalendarKeyboard.run({ command: "step-period", direction: 1 });
  expect(get(startDate).getMonth()).toBe(11);
  expect(get(startDate).getFullYear()).toBe(2026);
});

test("Today and view switch", async () => {
  showing(1, day(2020, 1, 1));
  await CalendarKeyboard.run({ command: "today" });
  expect(get(startDate).toDateString()).toBe(new Date().toDateString());
  await CalendarKeyboard.run({ command: "view", view: 31 });
  expect(view.value).toBe(31);
});
