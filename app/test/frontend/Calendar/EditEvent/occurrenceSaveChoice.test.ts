// @vitest-environment happy-dom
// app first, to resolve the import cycle around Abstract/Account.ts
import { appGlobal } from "../../../../logic/app";
import { Calendar } from "../../../../logic/Calendar/Calendar";
import { RecurrenceCase, type Event } from "../../../../logic/Calendar/Event";
import { Frequency } from "../../../../logic/Calendar/RecurrenceRule";
import { DummyCalendarStorage } from "../../../../logic/Calendar/SQL/DummyCalendarStorage";
import { calendarMustangApp } from "../../../../frontend/Calendar/CalendarMustangApp";
import { selectedEvent } from "../../../../frontend/Calendar/selected";
import { openEvent } from "../../../../frontend/Calendar/open";
import ShowEvent from "../../../../frontend/Calendar/DisplayEvent/ShowEvent.svelte";
import { flushSync, mount, unmount } from "svelte";
import { afterEach, beforeAll, beforeEach, expect, test, vi } from "vitest";

vi.mock("../../../../frontend/Calendar/open", async (importOriginal) => ({
  ...await importOriginal<typeof import("../../../../frontend/Calendar/open")>(),
  openEvent: vi.fn(),
}));

beforeAll(() => {
  (globalThis as any).ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

beforeEach(() => {
  appGlobal.calendars.clear();
  calendarMustangApp.subApps.clear();
  selectedEvent.set(null);
  vi.mocked(openEvent).mockClear();
});

let dialog: Record<string, any> | null = null;

afterEach(() => {
  if (dialog) {
    unmount(dialog);
    dialog = null;
  }
  document.body.innerHTML = "";
});

/** Weekly on Mondays at 10:00, from 2026-09-07 */
async function weeklySeries(): Promise<Event> {
  let calendar = new Calendar();
  calendar.name = "Test calendar";
  calendar.storage = new DummyCalendarStorage();
  appGlobal.calendars.add(calendar);
  let master = calendar.newEvent();
  master.title = "Planning";
  master.startTime = new Date(2026, 8, 7, 10, 0);
  master.endTime = new Date(2026, 8, 7, 11, 0);
  master.newRecurrenceRule(Frequency.Weekly);
  calendar.events.add(master);
  await master.save();
  return master;
}

function occurrenceOn(master: Event, day: number): Event {
  return master.instances.contents.find(instance => instance.recurrenceStartTime.getTime() == new Date(2026, 8, day, 10, 0).getTime());
}

async function makeException(master: Event, day: number): Promise<Event> {
  let occurrence = occurrenceOn(master, day);
  occurrence.startEditing();
  occurrence.location = "Room 2";
  await occurrence.save();
  occurrence.finishEditing();
  occurrence.dbID = "exception-" + day;
  expect(occurrence.recurrenceCase).toBe(RecurrenceCase.Exception);
  return occurrence;
}

function edit(event: Event) {
  event.startEditing();
  dialog = mount(ShowEvent, { target: document.body, props: { event } });
  flushSync();
}

function button(label: string): HTMLElement | null {
  return document.body.querySelector(`button[title="${label}"]`);
}

function menuItem(label: string): HTMLElement | null {
  return [...document.body.querySelectorAll<HTMLElement>(".menuitem")]
    .find(item => item.textContent.trim() == label) ?? null;
}

function openSaveMenu() {
  button("Save").click();
  flushSync();
}

test("A changed occurrence can be saved only for this occurrence, or for the series", async () => {
  let master = await weeklySeries();
  let occurrence = occurrenceOn(master, 21);
  edit(occurrence);
  occurrence.title = "Planning, with Fred";
  flushSync();

  openSaveMenu();
  let onlyThis = menuItem("Change only this instance");
  expect(onlyThis).not.toBeNull();
  expect(onlyThis.classList.contains("disabled")).toBe(false);
  expect(menuItem("Change remainder of series")).not.toBeNull();
  expect(menuItem("Change entire series")).not.toBeNull();
});

test("After a change of the recurrence pattern, the occurrence can't be saved on its own", async () => {
  let master = await weeklySeries();
  let occurrence = occurrenceOn(master, 21);
  edit(occurrence);
  occurrence.title = "Planning, with Fred";
  let interval = document.body.querySelector<HTMLInputElement>("input#every");
  interval.value = "2";
  interval.dispatchEvent(new window.Event("change"));
  flushSync();
  expect(master.recurrenceRule.interval).toBe(2);

  openSaveMenu();
  let onlyThis = menuItem("Change only this instance");
  expect(onlyThis.classList.contains("disabled")).toBe(true);
  expect(onlyThis.title).toBe("You changed the recurrence pattern");
  expect(menuItem("Change entire series").classList.contains("disabled")).toBe(false);
});

test("Only a changed recurrence pattern shows the occurrence choice as disabled", async () => {
  let master = await weeklySeries();
  let occurrence = occurrenceOn(master, 21);
  edit(occurrence);
  let frequency = document.body.querySelector<HTMLSelectElement>("select.selector");
  frequency.value = Frequency.Daily;
  frequency.dispatchEvent(new window.Event("change"));
  flushSync();
  expect(master.recurrenceRule.frequency).toBe(Frequency.Daily);

  openSaveMenu();
  expect(menuItem("Change only this instance").title).toBe("You changed the recurrence pattern");
});

test("An exception shows the recurrence read-only, and saves only itself", async () => {
  let master = await weeklySeries();
  let exception = await makeException(master, 21);
  edit(exception);

  expect(document.body.textContent).toContain("This is an exception to a recurring meeting");
  expect(document.body.querySelector<HTMLInputElement>("input#every").disabled).toBe(true);
  for (let select of document.body.querySelectorAll<HTMLSelectElement>("select.selector")) {
    expect(select.disabled).toBe(true);
  }
  for (let weekday of document.body.querySelectorAll<HTMLElement>(".weekday")) {
    expect(weekday.classList.contains("disabled")).toBe(true);
  }
  expect(master.unedited).toBeNull();

  exception.title = "Planning, moved";
  flushSync();
  expect(master.unedited).toBeNull();
  button("Save").click();
  await vi.waitFor(() => expect(exception.unedited).toBeNull());
  expect(menuItem("Change entire series")).toBeNull();
  expect(exception.title).toBe("Planning, moved");
  expect(master.title).toBe("Planning");
});

test("Open series opens the regular occurrence right before the exception", async () => {
  let master = await weeklySeries();
  await makeException(master, 14);
  let exception = await makeException(master, 21);
  edit(exception);

  button("Open series").click();
  flushSync();

  expect(openEvent).toHaveBeenCalledOnce();
  let opened = vi.mocked(openEvent).mock.calls[0][0];
  expect(opened).toBe(occurrenceOn(master, 7));
  expect(opened.recurrenceCase).toBe(RecurrenceCase.Instance);
});

test("Open series for an exception at the start of the series opens the next regular occurrence", async () => {
  let master = await weeklySeries();
  let exception = await makeException(master, 7);
  await makeException(master, 14);
  edit(exception);

  button("Open series").click();
  flushSync();

  expect(vi.mocked(openEvent).mock.calls[0][0]).toBe(occurrenceOn(master, 21));
});
