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
  expect(master.recurrenceRule.count).toBe(4);
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
