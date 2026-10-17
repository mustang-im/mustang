// app first, to resolve the import cycle around Abstract/Account.ts
import "../../../logic/app";
import { Event, RecurrenceCase } from "../../../logic/Calendar/Event";
import { Participant } from "../../../logic/Calendar/Participant";
import { InvitationResponse } from "../../../logic/Calendar/Invitation/InvitationStatus";
import { EventLook } from "../../Calendar/Event/EventLook";
import { expect, test } from "vitest";

function newEvent(start = new Date(2026, 9, 15, 9), end = new Date(2026, 9, 15, 10)): Event {
  let event = new Event();
  event.title = "Design review";
  event.startTime = start;
  event.endTime = end;
  return event;
}

function invitation(response: InvitationResponse): Event {
  let event = newEvent();
  event.participants.add(new Participant("wanda@example.com", "Wanda Howard", InvitationResponse.Organizer));
  event.participants.add(new Participant("me@example.com", "Me", response));
  event.myParticipation = response;
  return event;
}

test("Own appointments and meetings are shown as busy", () => {
  expect(new EventLook(newEvent()).status).toBe("busy");
  let meeting = newEvent();
  meeting.myParticipation = InvitationResponse.Organizer;
  expect(new EventLook(meeting).status).toBe("busy");
  expect(new EventLook(invitation(InvitationResponse.Accept)).status).toBe("busy");
});

test("Invitation states", () => {
  expect(new EventLook(invitation(InvitationResponse.Tentative)).status).toBe("tentative");
  expect(new EventLook(invitation(InvitationResponse.NoResponseReceived)).status).toBe("unanswered");
  expect(new EventLook(invitation(InvitationResponse.Decline)).status).toBe("declined");
  let cancelled = invitation(InvitationResponse.Accept);
  cancelled.isCancelled = true;
  expect(new EventLook(cancelled).status).toBe("cancelled");
});

test("Declined and cancelled events get a prefix, the event title stays unchanged", () => {
  let declined = invitation(InvitationResponse.Decline);
  expect(new EventLook(declined).title).toBe("Declined: Design review");
  let cancelled = invitation(InvitationResponse.Accept);
  cancelled.isCancelled = true;
  expect(new EventLook(cancelled).title).toBe("Canceled: Design review");
  expect(cancelled.title).toBe("Design review");
  expect(new EventLook(newEvent()).title).toBe("Design review");
});

test("Event color comes before the calendar color", () => {
  let event = newEvent();
  expect(new EventLook(event).color).toBe(null);
  event.calendar = { color: "#123456" } as any;
  expect(new EventLook(event).color).toBe("#123456");
  event.color = "#ABCDEF";
  expect(new EventLook(event).color).toBe("#ABCDEF");
  event.color = null;
  // The views pass the calendar they observe, so that its color changes reach them
  let observed = { color: "#654321" } as any;
  expect(new EventLook(event, observed).calendar).toBe(observed);
  expect(new EventLook(event, observed).color).toBe("#654321");
});

test("Past events", () => {
  let look = new EventLook(newEvent());
  expect(look.isPast(new Date(2026, 9, 15, 9, 30))).toBe(false);
  expect(look.isPast(new Date(2026, 9, 15, 10))).toBe(true);
  expect(look.isPast(new Date(2026, 9, 14))).toBe(false);
});

test("All-day events and events of 24 hours or more go to the all-day area", () => {
  let allDay = newEvent(new Date(2026, 9, 15), new Date(2026, 9, 16));
  allDay.allDay = true;
  expect(new EventLook(allDay).isInAllDayArea).toBe(true);
  expect(new EventLook(newEvent(new Date(2026, 9, 15, 14), new Date(2026, 9, 16, 14))).isInAllDayArea).toBe(true);
  expect(new EventLook(newEvent(new Date(2026, 9, 15, 22), new Date(2026, 9, 16, 2))).isInAllDayArea).toBe(false);
  expect(new EventLook(newEvent()).isInAllDayArea).toBe(false);
});

test("Recurrence icons", () => {
  let event = newEvent();
  expect(new EventLook(event).isRecurring).toBe(false);
  event.recurrenceCase = RecurrenceCase.Instance;
  expect(new EventLook(event).isRecurring).toBe(true);
  event.recurrenceCase = RecurrenceCase.Exception;
  expect(new EventLook(event).isRecurring).toBe(false);
  expect(new EventLook(event).isException).toBe(true);
});

test("Join is offered from 15 minutes before the start until the end", () => {
  let event = newEvent();
  event.isOnline = true;
  event.onlineMeetingURL = "https://meet.example.com/x";
  let look = new EventLook(event);
  expect(look.canJoin(new Date(2026, 9, 15, 8, 40))).toBe(false);
  expect(look.canJoin(new Date(2026, 9, 15, 8, 45))).toBe(true);
  expect(look.canJoin(new Date(2026, 9, 15, 9, 59))).toBe(true);
  expect(look.canJoin(new Date(2026, 9, 15, 10))).toBe(false);
  event.onlineMeetingURL = "";
  expect(new EventLook(event).canJoin(new Date(2026, 9, 15, 9))).toBe(false);
});

test("Organizer only for incoming meetings", () => {
  expect(new EventLook(invitation(InvitationResponse.Accept)).organizerName).toBe("Wanda Howard");
  expect(new EventLook(newEvent()).organizerName).toBe(null);
});

test("Time text and tooltip", () => {
  let event = invitation(InvitationResponse.Accept);
  event.location = "Room 1";
  let look = new EventLook(event);
  expect(look.timeText("en-US")).toMatch(/^9:00\s–\s10:00\sAM$/);
  expect(look.tooltip("en-US").split("\n").slice(1)).toEqual(["Design review", "Room 1", "Wanda Howard"]);
  let allDay = newEvent(new Date(2026, 9, 15), new Date(2026, 9, 16));
  allDay.allDay = true;
  expect(new EventLook(allDay).timeText("en-US")).toBe("All day");
  let twoDays = newEvent(new Date(2026, 9, 15), new Date(2026, 9, 17));
  twoDays.allDay = true;
  expect(new EventLook(twoDays).timeText("en-US")).toMatch(/^Thu, Oct 15\s–\sFri, Oct 16$/);
});
