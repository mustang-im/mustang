import '../../../logic/app'; // Import first, to set up the module graph and dodge the Account import cycle
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import type { Event } from '../../../logic/Calendar/Event';
import { Calendar } from '../../../logic/Calendar/Calendar';
import { Participant } from '../../../logic/Calendar/Participant';
import { InvitationResponse } from '../../../logic/Calendar/Invitation/InvitationStatus';
import { OutgoingInvitation } from '../../../logic/Calendar/Invitation/OutgoingInvitation';
import { getICal } from '../../../logic/Calendar/ICal/ICalGenerator';
import { DummyCalendarStorage } from '../../../logic/Calendar/SQL/DummyCalendarStorage';

/* The organizer increases the SEQUENCE of a meeting when a change makes the
 * attendees' copy outdated, e.g. a new time, or a cancellation, RFC 5545 3.8.7.4.
 * Some calendars ignore an update whose SEQUENCE did not increase. */

const k1Hour = 60 * 60 * 1000;
const kStartTime = new Date(Math.ceil((Date.now() + 7 * 24 * k1Hour) / k1Hour) * k1Hour);

function newEvent(): Event {
  let calendar = new Calendar();
  calendar.storage = new DummyCalendarStorage();
  let event = calendar.newEvent();
  event.calUID = "meeting-1234";
  event.title = "Planning";
  event.startTime = new Date(kStartTime);
  event.endTime = new Date(kStartTime.getTime() + k1Hour);
  event.timezone = "Europe/Berlin";
  calendar.events.add(event);
  return event;
}

/** A meeting that our user organizes, and whose invitations went out already */
function sentMeeting(): Event {
  let event = newEvent();
  event.myParticipation = InvitationResponse.Organizer;
  event.participants.add(new Participant("organizer@example.com", "Organizer", InvitationResponse.Organizer));
  event.participants.add(new Participant("attendee@example.com", "Attendee", InvitationResponse.Accept));
  return event;
}

async function edit(event: Event, change: (event: Event) => void) {
  event.startEditing();
  change(event);
  await event.save();
  event.finishEditing();
}

let sentInvitations: number[];
let sentCancellations: number[];

beforeEach(() => {
  sentInvitations = [];
  sentCancellations = [];
  vi.spyOn(OutgoingInvitation.prototype, "sendInvitations").mockImplementation(async function (this: OutgoingInvitation) {
    sentInvitations.push(this.event.sequence);
  });
  vi.spyOn(OutgoingInvitation.prototype, "sendCancellationsTo").mockImplementation(async function (this: OutgoingInvitation) {
    sentCancellations.push(this.event.sequence);
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

test("Each change of a meeting gets a new version", async () => {
  let event = sentMeeting();

  await edit(event, event => {
    event.startTime = new Date(kStartTime.getTime() + 2 * k1Hour);
    event.endTime = new Date(kStartTime.getTime() + 3 * k1Hour);
  });
  expect(event.sequence).toBe(1);
  await edit(event, event => event.location = "Room 2");
  expect(event.sequence).toBe(2);

  expect(sentInvitations).toEqual([1, 2]);
  expect(await getICal(event, "REQUEST")).toMatch(/\r\nSEQUENCE:2\r\n/);
});

test("Inviting one more attendee keeps the version", async () => {
  let event = sentMeeting();

  await edit(event, event => event.participants.add(new Participant("new@example.com", "New", InvitationResponse.NoResponseReceived)));

  expect(event.sequence).toBe(0);
  expect(sentInvitations).toEqual([0]);
});

test("Saving a meeting without changes keeps the version", async () => {
  let event = sentMeeting();

  await edit(event, () => {});

  expect(event.sequence).toBe(0);
});

test("The first invitation of a new meeting has the first version", async () => {
  let event = newEvent();

  await edit(event, event => {
    event.myParticipation = InvitationResponse.Organizer;
    event.participants.add(new Participant("organizer@example.com", "Organizer", InvitationResponse.Organizer));
    event.participants.add(new Participant("attendee@example.com", "Attendee", InvitationResponse.NoResponseReceived));
  });

  expect(event.sequence).toBe(0);
  expect(sentInvitations).toEqual([0]);
});

test("A cancellation gets a new version", async () => {
  let event = sentMeeting();
  event.sequence = 3;

  await event.deleteIt();

  expect(sentCancellations).toEqual([4]);
});

test("Changing my reminder of an incoming meeting keeps the organizer's version", async () => {
  let event = newEvent();
  event.myParticipation = InvitationResponse.Accept;
  event.participants.add(new Participant("organizer@example.com", "Organizer", InvitationResponse.Organizer));
  event.participants.add(new Participant("attendee@example.com", "Attendee", InvitationResponse.Accept));
  event.sequence = 3;

  await edit(event, event => event.alarm = new Date(kStartTime.getTime() - k1Hour));

  expect(event.sequence).toBe(3);
  expect(sentInvitations).toEqual([]);
});
