// @vitest-environment happy-dom
import "../../../logic/app"; // first, to resolve the import cycle around Abstract/Account.ts
import { Calendar } from "../../../logic/Calendar/Calendar";
import { Participant } from "../../../logic/Calendar/Participant";
import { InvitationResponse } from "../../../logic/Calendar/Invitation/InvitationStatus";
import { FreeBusy, SlotAvailability } from "../../../logic/Calendar/FreeBusy";
import { FreeBusyEvent, FreeBusyStatus } from "../../../logic/Calendar/FreeBusyEvent";
import { expect, test } from "vitest";

function at(hours: number, minutes = 0): Date {
  return new Date(2026, 9, 15, hours, minutes);
}

function appointment(from: Date, to: Date, status = FreeBusyStatus.Busy, title?: string, location?: string): FreeBusyEvent {
  let event = new FreeBusyEvent(from, to, status);
  event.title = title;
  event.location = location;
  return event;
}

const anna = new Participant("anna@example.com", "Anna", InvitationResponse.Organizer);
const bert = new Participant("bert@example.com", "Bert", InvitationResponse.NoResponseReceived);
const carla = new Participant("carla@example.com", "Carla", InvitationResponse.Accept);

class FreeBusyCalendar extends Calendar {
  requested: { participants: Participant[], from: Date, to: Date };
  async arePersonsFree(participants: Participant[], from: Date, to: Date) {
    this.requested = { participants, from, to };
    return [
      { participant: participants[0], availability: [
        appointment(at(9), at(10)),
        appointment(at(10), at(12), FreeBusyStatus.Free),
      ] },
      { participant: participants[1], availability: [
        appointment(at(9, 30), at(11)),
        appointment(at(14), at(15)),
      ] },
      { participant: participants[2], availability: undefined },
    ];
  }
}

test("Loads the availability with the logic call", async () => {
  let calendar = new FreeBusyCalendar();
  let freeBusy = await FreeBusy.load(calendar, [anna, bert, carla], at(0), at(24));
  expect(calendar.requested.participants).toEqual([anna, bert, carla]);
  expect(calendar.requested.from).toEqual(at(0));
  expect(freeBusy.hasInformation).toBe(true);
  expect(freeBusy.rowFor(anna).busy).toEqual([{ from: at(9), to: at(10) }]);
  expect(freeBusy.rowFor(carla).busy).toBe(null);
});

test("All attendees: union of the busy times", async () => {
  let freeBusy = await FreeBusy.load(new FreeBusyCalendar(), [anna, bert, carla], at(0), at(24));
  expect(freeBusy.allAttendeesBusy).toEqual([
    { from: at(9), to: at(11) },
    { from: at(14), to: at(15) },
  ]);
});

test("Status of each attendee at the meeting time", async () => {
  let freeBusy = await FreeBusy.load(new FreeBusyCalendar(), [anna, bert, carla], at(0), at(24));
  expect(freeBusy.status(anna, at(10), at(11))).toBe("free");
  expect(freeBusy.status(anna, at(9, 30), at(10, 30))).toBe("busy");
  expect(freeBusy.status(bert, at(10), at(11))).toBe("busy");
  expect(freeBusy.status(bert, at(11), at(14))).toBe("free");
  expect(freeBusy.status(carla, at(10), at(11))).toBe("unknown");
});

test("Calendars without free/busy support give no information", async () => {
  let calendar = new Calendar();
  let freeBusy = await FreeBusy.load(calendar, [anna, bert], at(0), at(24));
  expect(freeBusy.hasInformation).toBe(false);
  expect(freeBusy.rows.map(row => row.busy)).toEqual([null, null]);
  expect(freeBusy.status(anna, at(10), at(11))).toBe("unknown");
  expect(freeBusy.isSupported).toBe(false);
});

test("Whether the calendar provides free/busy at all, asked once per calendar", async () => {
  expect(await FreeBusy.isSupported(new Calendar(), [anna])).toBe(false);
  let calendar = new FreeBusyCalendar();
  expect(await FreeBusy.isSupported(calendar, [anna, bert, carla])).toBe(true);
  calendar.requested = null;
  expect(await FreeBusy.isSupported(calendar, [anna, bert, carla])).toBe(true);
  expect(calendar.requested).toBe(null);
});

test("Results are matched by email address, if the server returns other objects", () => {
  let bertCopy = new Participant("bert@example.com", "Bert B.", InvitationResponse.Unknown);
  let freeBusy = FreeBusy.fromAvailability([bert], [
    { participant: bertCopy, availability: [appointment(at(8), at(9))] },
  ]);
  expect(freeBusy.rowFor(bert).busy).toEqual([{ from: at(8), to: at(9) }]);
});

test("Merge overlapping and touching intervals", () => {
  expect(FreeBusy.merge([
    { from: at(13), to: at(14) },
    { from: at(9), to: at(10) },
    { from: at(10), to: at(11) },
    { from: at(10, 30), to: at(10, 45) },
    { from: at(12), to: at(12) },
  ])).toEqual([
    { from: at(9), to: at(11) },
    { from: at(13), to: at(14) },
  ]);
});

test("Keeps each appointment with its status and details, for display", () => {
  let freeBusy = FreeBusy.fromAvailability([anna], [
    { participant: anna, availability: [
      appointment(at(11), at(12), FreeBusyStatus.Tentative, "Lunch", "Canteen"),
      appointment(at(9), at(10)),
      appointment(at(9, 30), at(10, 30), FreeBusyStatus.OutOfOffice),
      appointment(at(13), at(14), FreeBusyStatus.Free),
    ] },
  ]);
  let row = freeBusy.rowFor(anna);
  expect(row.appointments.map(appointment => [appointment.startTime, appointment.status, appointment.title, appointment.location])).toEqual([
    [at(9), FreeBusyStatus.Busy, undefined, undefined],
    [at(9, 30), FreeBusyStatus.OutOfOffice, undefined, undefined],
    [at(11), FreeBusyStatus.Tentative, "Lunch", "Canteen"],
  ]);
  expect(row.busy).toEqual([
    { from: at(9), to: at(10, 30) },
    { from: at(11), to: at(12) },
  ]);
});

function slotAt(slots: ReturnType<FreeBusy["slots"]>, hours: number) {
  return slots.find(slot => slot.start.getTime() == at(hours).getTime());
}

test("Time slots: Free when everybody whose availability we know is free, busy when many are busy", async () => {
  let freeBusy = await FreeBusy.load(new FreeBusyCalendar(), [anna, bert, carla], at(0), at(24));
  let slots = freeBusy.slots([at(0)], 8, 16, 60);
  expect(slots.contents.map(slot => slot.start)).toEqual([8, 9, 10, 11, 12, 13, 14, 15].map(hours => at(hours)));
  expect(slots.contents.every(slot => slot.end.getTime() - slot.start.getTime() == 60 * 60 * 1000)).toBe(true);

  let nine = slotAt(slots, 9);
  expect(nine.busy.contents).toEqual([anna, bert]);
  expect(nine.unknown.contents).toEqual([carla]);
  expect(nine.availability).toBe(SlotAvailability.Busy);

  let noon = slotAt(slots, 12);
  expect(noon.free.contents).toEqual([anna, bert]);
  expect(noon.unknown.contents).toEqual([carla]);
  expect(noon.availability).toBe(SlotAvailability.Free);

  let two = slotAt(slots, 14);
  expect(two.busy.contents).toEqual([bert]);
  expect(two.free.contents).toEqual([anna]);
  expect(two.availability).toBe(SlotAvailability.Busy);

  let dora = new Participant("dora@example.com", "Dora", InvitationResponse.Accept);
  let withDora = FreeBusy.fromAvailability([anna, bert, dora], [
    { participant: anna, availability: [] },
    { participant: bert, availability: [appointment(at(14), at(15))] },
    { participant: dora, availability: [] },
  ]);
  expect(slotAt(withDora.slots([at(0)], 8, 16, 60), 14).availability).toBe(SlotAvailability.Partly);
});

test("Time slots: Each of the days, and none when nobody's availability is known", async () => {
  let freeBusy = await FreeBusy.load(new FreeBusyCalendar(), [anna, bert], at(0), at(24));
  let nextDay = new Date(2026, 9, 16);
  let slots = freeBusy.slots([at(0), nextDay], 8, 18, 30);
  expect(slots.length).toBe(2 * 20);
  expect(slots.last.end).toEqual(new Date(2026, 9, 16, 18));

  let unknown = await FreeBusy.load(new Calendar(), [anna, bert], at(0), at(24));
  expect(unknown.slots([at(0)], 8, 18, 60).isEmpty).toBe(true);
});
