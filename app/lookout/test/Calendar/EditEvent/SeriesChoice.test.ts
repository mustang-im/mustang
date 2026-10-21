// @vitest-environment happy-dom
import "../../../../logic/app"; // first, to resolve the import cycle around Abstract/Account.ts
import { Calendar } from "../../../../logic/Calendar/Calendar";
import type { Event } from "../../../../logic/Calendar/Event";
import { Frequency } from "../../../../logic/Calendar/RecurrenceRule";
import { DummyCalendarStorage } from "../../../../logic/Calendar/SQL/DummyCalendarStorage";
import { EventEditFlow } from "../../../Calendar/EditEvent/EventEditFlow";
import SeriesChoiceMenuItems from "../../../Calendar/EditEvent/SeriesChoiceMenuItems.svelte";
import SeriesChoiceDialog from "../../../Calendar/EditEvent/SeriesChoiceDialog.svelte";
import { mockMessageBox } from "../../Shared/Dialog/mockMessageBox";
import { flushSync, mount, unmount } from "svelte";
import { afterEach, beforeAll, beforeEach, expect, test, vi } from "vitest";

const messageBox = mockMessageBox();
beforeEach(() => {
  messageBox.mockReset();
  messageBox.mockResolvedValue(true);
});

beforeAll(() => {
  HTMLDialogElement.prototype.showModal ??= function () { this.open = true; };
  HTMLDialogElement.prototype.close ??= function () { this.open = false; };
});

let component: Record<string, any> | null = null;

afterEach(() => {
  if (component) {
    unmount(component);
    component = null;
  }
  document.body.innerHTML = "";
});

/** An occurrence in the middle of a weekly series, with a new title */
async function changedOccurrence(): Promise<{ master: Event, flow: EventEditFlow }> {
  let calendar = new Calendar();
  calendar.storage = new DummyCalendarStorage();
  let master = calendar.newEvent();
  master.title = "Planning";
  master.startTime = new Date(2026, 8, 7, 10, 0);
  master.endTime = new Date(2026, 8, 7, 10, 30);
  master.newRecurrenceRule(Frequency.Weekly);
  calendar.events.add(master);
  await master.save();
  let occurrence = master.instances.get(2);
  occurrence.startEditing();
  occurrence.title = "Planning with Fred";
  return { master, flow: new EventEditFlow(occurrence, () => {}) };
}

function changeRecurrence(flow: EventEditFlow) {
  let pattern = flow.pattern.clone();
  pattern.interval = 2;
  flow.applyPattern(pattern);
}

function menuItem(label: string): HTMLButtonElement | null {
  return [...document.body.querySelectorAll<HTMLButtonElement>(".lo-menuitem")]
    .find(item => item.textContent.trim() == label) ?? null;
}

function showMenuItems(flow: EventEditFlow) {
  component = mount(SeriesChoiceMenuItems, { target: document.body, props: { flow } });
  flushSync();
}

test("The save menu of an occurrence offers this occurrence, this and following, and the entire series", async () => {
  let { flow } = await changedOccurrence();
  showMenuItems(flow);
  let items = [...document.body.querySelectorAll<HTMLButtonElement>(".lo-menuitem")];
  expect(items.map(item => item.textContent.trim())).toEqual(["Just this one", "This and all following occurrences", "The entire series"]);
  expect(items.some(item => item.disabled)).toBe(false);
});

test("After a change of the recurrence, the save menu doesn't allow to save only the occurrence", async () => {
  let { flow } = await changedOccurrence();
  changeRecurrence(flow);
  showMenuItems(flow);
  let onlyThis = menuItem("Just this one");
  expect(onlyThis.disabled).toBe(true);
  expect(onlyThis.title).toBe("You changed the recurrence pattern");
  expect(menuItem("The entire series").disabled).toBe(false);
});

test("The entire series from the save menu saves the series", async () => {
  let { master, flow } = await changedOccurrence();
  changeRecurrence(flow);
  showMenuItems(flow);
  menuItem("The entire series").click();
  await vi.waitFor(() => expect(master.title).toBe("Planning with Fred"));
  expect(master.recurrenceRule.interval).toBe(2);
});

test("The series dialog selects the first choice that is allowed", async () => {
  let { flow } = await changedOccurrence();
  changeRecurrence(flow);
  component = mount(SeriesChoiceDialog, { target: document.body, props: { title: "Recurring Appointment", okLabel: "Save", flow } });
  flushSync();
  let radios = [...document.body.querySelectorAll<HTMLInputElement>("input[type=radio]")];
  expect(radios.map(radio => radio.disabled)).toEqual([true, false, false]);
  expect(radios.map(radio => radio.checked)).toEqual([false, true, false]);
  expect(radios[0].closest("label").title).toBe("You changed the recurrence pattern");
});
