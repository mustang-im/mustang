// @vitest-environment happy-dom
import { CalendarViewDraft } from "../../Calendar/ViewSettings/CalendarViewDraft";
import { CalendarSettings, EventTableColumn, EventTableGrouping } from "../../Calendar/CalendarSettings";
import { expect, test } from "vitest";

test("The draft changes the settings only on save", () => {
  CalendarSettings.weekNumbers.value = false;
  let draft = CalendarViewDraft.fromSettings();
  draft.weekNumbers = true;
  draft.timeScale = 15;
  expect(CalendarSettings.weekNumbers.value).toBe(false);
  draft.save();
  expect(CalendarSettings.weekNumbers.value).toBe(true);
  expect(CalendarSettings.timeScale.value).toBe(15);
  CalendarViewDraft.defaults().save();
  expect(CalendarSettings.timeScale.value).toBe(30);
  expect(CalendarSettings.weekNumbers.value).toBe(false);
});

test("Columns can be added, removed and moved, but Subject stays", () => {
  let draft = CalendarViewDraft.defaults();
  expect(draft.availableColumns()).toEqual([EventTableColumn.Calendar]);
  draft.addColumn(EventTableColumn.Calendar);
  draft.addColumn(EventTableColumn.Calendar);
  expect(draft.columns.filter(column => column == EventTableColumn.Calendar).length).toBe(1);
  draft.removeColumn(EventTableColumn.Subject);
  expect(draft.columns[0]).toBe(EventTableColumn.Subject);
  draft.moveColumn(EventTableColumn.Calendar, -1);
  expect(draft.columns.at(-2)).toBe(EventTableColumn.Calendar);
  draft.moveColumn(EventTableColumn.Subject, -1);
  expect(draft.columns[0]).toBe(EventTableColumn.Subject);
  draft.removeColumn(EventTableColumn.Location);
  expect(draft.columns).not.toContain(EventTableColumn.Location);
  expect(draft.availableColumns()).toEqual([EventTableColumn.Location]);
});

test("Summaries name the sort column, order and grouping", () => {
  let draft = CalendarViewDraft.defaults();
  draft.sortColumn = EventTableColumn.Subject;
  draft.sortAscending = false;
  expect(draft.sortSummary).toBe("Subject (descending)");
  draft.grouping = EventTableGrouping.None;
  expect(draft.groupSummary).toBe("None");
  expect(draft.columnsSummary.startsWith("Subject, Location")).toBe(true);
});
