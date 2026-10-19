// @vitest-environment happy-dom
import "../../../../logic/app"; // first, to resolve the import cycle around Abstract/Account.ts
import { Calendar } from "../../../../logic/Calendar/Calendar";
import { RecurrenceCase, type Event } from "../../../../logic/Calendar/Event";
import { Frequency } from "../../../../logic/Calendar/RecurrenceRule";
import { DummyCalendarStorage } from "../../../../logic/Calendar/SQL/DummyCalendarStorage";
import { openEvent } from "../../../../frontend/Calendar/open";
import { EventEditFlow } from "../../../Calendar/EditEvent/EventEditFlow";
import { EventTimeEditor } from "../../../Calendar/EditEvent/EventTimeEditor";
import RecurrenceDialog from "../../../Calendar/EditEvent/RecurrenceDialog.svelte";
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
  HTMLDialogElement.prototype.showModal ??= function () { this.open = true; };
  HTMLDialogElement.prototype.close ??= function () { this.open = false; };
});

beforeEach(() => {
  vi.mocked(openEvent).mockClear();
});

let dialog: Record<string, any> | null = null;
let onClose = vi.fn();

afterEach(() => {
  if (dialog) {
    unmount(dialog);
    dialog = null;
  }
  document.body.innerHTML = "";
  onClose = vi.fn();
});

/** Weekly on Mondays at 10:00, from 2026-09-07 */
async function weeklySeries(): Promise<Event> {
  let calendar = new Calendar();
  calendar.storage = new DummyCalendarStorage();
  let master = calendar.newEvent();
  master.title = "Planning";
  master.startTime = new Date(2026, 8, 7, 10, 0);
  master.endTime = new Date(2026, 8, 7, 10, 30);
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
  expect(occurrence.recurrenceCase).toBe(RecurrenceCase.Exception);
  return occurrence;
}

function showRecurrence(event: Event) {
  event.startEditing();
  let flow = new EventEditFlow(event, () => {});
  let timeEditor = new EventTimeEditor(event);
  dialog = mount(RecurrenceDialog, { target: document.body, props: { event, flow, timeEditor }, events: { close: onClose } });
  flushSync();
}

function dialogButton(label: string): HTMLButtonElement | null {
  return [...document.body.querySelectorAll<HTMLButtonElement>(".dialog-button")]
    .find(button => button.textContent.trim() == label) ?? null;
}

test("The recurrence of an exception is read-only, and offers to open the series", async () => {
  let master = await weeklySeries();
  let exception = await makeException(master, 21);
  showRecurrence(exception);

  expect(document.body.textContent).toContain("This is an exception to a recurring appointment");
  let groups = [...document.body.querySelectorAll<HTMLFieldSetElement>("fieldset")];
  expect(groups.length).toBe(3);
  expect(groups.every(group => group.disabled)).toBe(true);
  expect(dialogButton("OK")).toBeNull();
  expect(dialogButton("Remove Recurrence")).toBeNull();
  expect(dialogButton("Close")).not.toBeNull();
  expect(dialogButton("Open Series")).not.toBeNull();
});

test("Open Series opens the regular occurrence right before the exception", async () => {
  let master = await weeklySeries();
  await makeException(master, 14);
  let exception = await makeException(master, 21);
  showRecurrence(exception);

  dialogButton("Open Series").click();
  await vi.waitFor(() => expect(openEvent).toHaveBeenCalledOnce());
  expect(vi.mocked(openEvent).mock.calls[0][0]).toBe(occurrenceOn(master, 7));
  expect(onClose).toHaveBeenCalled();
  expect(master.unedited).toBeNull();
});

test("Open Series for an exception at the start of the series opens the next regular occurrence", async () => {
  let master = await weeklySeries();
  let exception = await makeException(master, 7);
  showRecurrence(exception);

  dialogButton("Open Series").click();
  await vi.waitFor(() => expect(openEvent).toHaveBeenCalledOnce());
  expect(vi.mocked(openEvent).mock.calls[0][0]).toBe(occurrenceOn(master, 14));
});

test("The recurrence of a regular occurrence can be changed", async () => {
  let master = await weeklySeries();
  showRecurrence(occurrenceOn(master, 21));

  expect(document.body.textContent).not.toContain("This is an exception");
  expect([...document.body.querySelectorAll<HTMLFieldSetElement>("fieldset")].some(group => group.disabled)).toBe(false);
  expect(dialogButton("OK")).not.toBeNull();
  expect(dialogButton("Remove Recurrence")).not.toBeNull();
  expect(dialogButton("Open Series")).toBeNull();
});
