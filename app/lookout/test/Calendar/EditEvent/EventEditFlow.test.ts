// @vitest-environment happy-dom
import "../../../../logic/app"; // first, to resolve the import cycle around Abstract/Account.ts
import { Calendar } from "../../../../logic/Calendar/Calendar";
import type { Event } from "../../../../logic/Calendar/Event";
import { Participant } from "../../../../logic/Calendar/Participant";
import { InvitationResponse } from "../../../../logic/Calendar/Invitation/InvitationStatus";
import { Frequency } from "../../../../logic/Calendar/RecurrenceRule";
import { DummyCalendarStorage } from "../../../../logic/Calendar/SQL/DummyCalendarStorage";
import { EventEditFlow } from "../../../Calendar/EditEvent/EventEditFlow";
import { expect, test, vi } from "vitest";

vi.stubGlobal("confirm", () => true);

function newCalendar(): Calendar {
  let calendar = new Calendar();
  calendar.storage = new DummyCalendarStorage();
  return calendar;
}

function newEvent(calendar = newCalendar(), start = new Date(2026, 9, 15, 10, 0)): Event {
  let event = calendar.newEvent();
  event.title = "Planning";
  event.startTime = start;
  event.endTime = new Date(start.getTime() + 30 * 60000);
  return event;
}

test("Title and times are needed", () => {
  let event = newEvent();
  event.startEditing();
  let flow = new EventEditFlow(event, () => {});
  expect(flow.missingPropsReason).toBe(null);
  event.title = "";
  expect(flow.hasMinimalProps).toBe(false);
  expect(flow.missingPropsReason).toBe("Please enter a title");
});

test("Attendees are the participants without the organizer", () => {
  let event = newEvent();
  event.myParticipation = InvitationResponse.Organizer;
  event.participants.add(new Participant("me@example.com", "Me", InvitationResponse.Organizer));
  event.participants.add(new Participant("anna@example.com", "Anna", InvitationResponse.Accept));
  let flow = new EventEditFlow(event, () => {});
  expect(flow.isMeeting).toBe(true);
  expect(flow.willSend).toBe(true);
  expect(flow.attendees.map(attendee => attendee.name)).toEqual(["Anna"]);
});

test("Save adds a new appointment to its calendar, saves and closes the form", async () => {
  let event = newEvent();
  event.startEditing();
  let onClosed = vi.fn();
  let flow = new EventEditFlow(event, onClosed);
  event.title = "Planning session";
  expect(flow.hasChanges).toBe(true);
  expect(flow.needsSeriesChoice).toBe(false);
  await flow.saveWith(null);
  expect(event.calendar.events.contains(event)).toBe(true);
  expect(event.unedited).toBeFalsy();
  expect(onClosed).toHaveBeenCalledOnce();
});

test("Cancel reverts the changes", () => {
  let event = newEvent();
  event.startEditing();
  let flow = new EventEditFlow(event, () => {});
  event.title = "Something else";
  flow.cancel();
  expect(event.title).toBe("Planning");
});

test("An occurrence asks which part of the series to change", async () => {
  let calendar = newCalendar();
  let master = newEvent(calendar);
  master.newRecurrenceRule(Frequency.Weekly);
  calendar.events.add(master);
  await master.save();
  let occurrence = master.instances.get(2);
  occurrence.startEditing();
  let flow = new EventEditFlow(occurrence, () => {});
  expect(flow.needsSeriesChoice).toBe(false);
  occurrence.title = "Planning, moved";
  expect(flow.needsSeriesChoice).toBe(true);
  expect(flow.seriesChoices()).toEqual(["occurrence", "following", "series"]);

  let first = master.instances.get(0);
  first.startEditing();
  first.title = "First planning";
  expect(new EventEditFlow(first, () => {}).seriesChoices()).toEqual(["occurrence", "series"]);
  first.cancelEditing();
});

test("A changed series end allows to save the series, from an occurrence", async () => {
  let calendar = newCalendar();
  let master = newEvent(calendar);
  master.newRecurrenceRule(Frequency.Weekly);
  calendar.events.add(master);
  await master.save();
  let occurrence = master.instances.get(1);
  occurrence.startEditing();
  let flow = new EventEditFlow(occurrence, () => {});
  expect(flow.canSaveSeries).toBe(false);
  flow.pattern.end = "count";
  flow.pattern.count = 5;
  expect(flow.seriesEndChanged).toBe(true);
  expect(flow.canSaveSeries).toBe(true);
  expect(flow.seriesChoices()).toEqual(["following", "series"]);
  await flow.saveWith("series");
  expect(master.recurrenceRule.count).toBe(5);
  expect(master.startTime).toEqual(new Date(2026, 9, 15, 10, 0));
});

async function savedWeeklySeries(): Promise<Event> {
  let calendar = newCalendar();
  let master = newEvent(calendar); // Thursday
  master.location = "Room 1";
  master.newRecurrenceRule(Frequency.Weekly, 1, 0, [1, 4]);
  calendar.events.add(master);
  await master.save();
  return master;
}

test("A changed title for the entire series, from an occurrence, keeps the series start and its times", async () => {
  let master = await savedWeeklySeries();
  let occurrence = master.instances.get(3);
  occurrence.startEditing();
  occurrence.title = "Weekly planning";
  let confirm = vi.fn(() => true);
  vi.stubGlobal("confirm", confirm);
  await new EventEditFlow(occurrence, () => {}).saveWith("series");
  vi.stubGlobal("confirm", () => true);
  expect(confirm).not.toHaveBeenCalled();
  expect(master.title).toBe("Weekly planning");
  expect(master.startTime).toEqual(new Date(2026, 9, 15, 10, 0));
  expect(master.recurrenceRule.seriesStartTime).toEqual(new Date(2026, 9, 15, 10, 0));
  expect(master.recurrenceRule.weekdays.sort()).toEqual([1, 4]);
});

test("A later time and another day of an occurrence, for the entire series, move all occurrences", async () => {
  let master = await savedWeeklySeries();
  let occurrence = master.instances.contents.find(instance => instance.startTime.getDay() == 4 && instance.startTime > master.startTime);
  occurrence.startEditing();
  let moved = new Date(occurrence.startTime);
  moved.setDate(moved.getDate() + 1);
  moved.setHours(14, 0);
  occurrence.startTime = moved;
  occurrence.endTime = new Date(moved.getTime() + 60 * 60000);
  occurrence.alarm = new Date(moved.getTime() - 15 * 60000);
  await new EventEditFlow(occurrence, () => {}).saveWith("series");
  expect(master.startTime).toEqual(new Date(2026, 9, 16, 14, 0));
  expect(master.endTime).toEqual(new Date(2026, 9, 16, 15, 0));
  expect(master.alarm).toEqual(new Date(2026, 9, 16, 13, 45));
  expect(master.location).toBe("Room 1");
  expect(master.recurrenceRule.weekdays.sort()).toEqual([2, 5]);
});

test("Deleting an occurrence excludes it from the series and closes the form", async () => {
  let master = await savedWeeklySeries();
  let occurrence = master.instances.get(2);
  let start = occurrence.recurrenceStartTime;
  occurrence.startEditing();
  let onClosed = vi.fn();
  await new EventEditFlow(occurrence, onClosed).deleteIt();
  expect(master.exclusions.contents.map(date => date.getTime())).toContain(start.getTime());
  expect(master.instances.contents.some(instance => instance.startTime.getTime() == start.getTime())).toBe(false);
  expect(onClosed).toHaveBeenCalledOnce();
});

test("Deleting this and the following occurrences ends the series before it", async () => {
  let master = await savedWeeklySeries();
  let occurrence = master.instances.get(3);
  occurrence.startEditing();
  await new EventEditFlow(occurrence, () => {}).deleteRemainder();
  expect(master.recurrenceRule.count).toBe(3);
});

test("Deleting the entire series asks first", async () => {
  let master = await savedWeeklySeries();
  let occurrence = master.instances.get(3);
  occurrence.startEditing();
  let onClosed = vi.fn();
  vi.stubGlobal("confirm", () => false);
  await new EventEditFlow(occurrence, onClosed).deleteAll();
  vi.stubGlobal("confirm", () => true);
  expect(master.calendar.events.contains(master)).toBe(true);
  expect(onClosed).not.toHaveBeenCalled();
  await new EventEditFlow(occurrence, onClosed).deleteAll();
  expect(master.calendar.events.contains(master)).toBe(false);
  expect(onClosed).toHaveBeenCalledOnce();
});

test("Days between dates, also across a change to daylight saving time", () => {
  expect(EventEditFlow.daysBetween(new Date(2026, 2, 28, 23, 0), new Date(2026, 2, 30, 1, 0))).toBe(2);
  expect(EventEditFlow.daysBetween(new Date(2026, 9, 16), new Date(2026, 9, 15))).toBe(-1);
});

test("Removing the recurrence makes the series single again", () => {
  let event = newEvent();
  event.newRecurrenceRule(Frequency.Daily);
  event.startEditing();
  let flow = new EventEditFlow(event, () => {});
  flow.removeRecurrence();
  expect(event.recurrenceRule).toBe(null);
  expect(flow.pattern.end).toBe("none");
});
