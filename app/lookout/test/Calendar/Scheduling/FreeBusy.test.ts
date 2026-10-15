// @vitest-environment happy-dom
import "../../../../logic/app"; // first, to resolve the import cycle around Abstract/Account.ts
import { Calendar } from "../../../../logic/Calendar/Calendar";
import { Participant } from "../../../../logic/Calendar/Participant";
import { InvitationResponse } from "../../../../logic/Calendar/Invitation/InvitationStatus";
import { FreeBusy } from "../../../Calendar/Scheduling/FreeBusy";
import { expect, test } from "vitest";

function at(hours: number, minutes = 0): Date {
  return new Date(2026, 9, 15, hours, minutes);
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
        { from: at(9), to: at(10), free: false },
        { from: at(10), to: at(12), free: true },
      ] },
      { participant: participants[1], availability: [
        { from: at(9, 30), to: at(11), free: false },
        { from: at(14), to: at(15), free: false },
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
});

test("Results are matched by email address, if the server returns other objects", () => {
  let bertCopy = new Participant("bert@example.com", "Bert B.", InvitationResponse.Unknown);
  let freeBusy = FreeBusy.fromAvailability([bert], [
    { participant: bertCopy, availability: [{ from: at(8), to: at(9), free: false }] },
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
