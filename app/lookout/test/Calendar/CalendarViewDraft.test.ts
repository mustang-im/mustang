// @vitest-environment happy-dom
import { CalendarViewDraft } from "../../Calendar/ViewSettings/CalendarViewDraft";
import { ColumnOrder } from "../../Calendar/ViewSettings/ColumnOrder";
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
  let order = new ColumnOrder(draft.columns, CalendarViewDraft.allColumns, EventTableColumn.Subject);
  expect(order.available()).toEqual([EventTableColumn.Calendar]);
  order.add(EventTableColumn.Calendar);
  order.add(EventTableColumn.Calendar);
  expect(order.columns.filter(column => column == EventTableColumn.Calendar).length).toBe(1);
  order.remove(EventTableColumn.Subject);
  expect(order.columns[0]).toBe(EventTableColumn.Subject);
  order.move(EventTableColumn.Calendar, -1);
  expect(order.columns.at(-2)).toBe(EventTableColumn.Calendar);
  order.move(EventTableColumn.Subject, -1);
  expect(order.columns[0]).toBe(EventTableColumn.Subject);
  order.remove(EventTableColumn.Location);
  expect(order.columns).not.toContain(EventTableColumn.Location);
  expect(order.available()).toEqual([EventTableColumn.Location]);
  order.add(EventTableColumn.Location, EventTableColumn.Subject);
  expect(order.columns[1]).toBe(EventTableColumn.Location);
  order.moveBefore(EventTableColumn.Subject, null);
  expect(order.columns.at(-1)).toBe(EventTableColumn.Subject);
  order.moveBefore(EventTableColumn.Subject, EventTableColumn.Location);
  expect(order.columns[0]).toBe(EventTableColumn.Subject);
});

test("Column order: unknown and duplicate columns are dropped, the required one is added", () => {
  let order = new ColumnOrder([ "b", "x", "b" ], [ "a", "b", "c" ], "a");
  expect(order.columns).toEqual([ "a", "b" ]);
  expect(order.available([ "c", "b", "y" ])).toEqual([ "c" ]);
  expect(order.canRemove("a")).toBe(false);
  expect(order.canMove("a", -1)).toBe(false);
  expect(order.canMove("a", 1)).toBe(true);
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
