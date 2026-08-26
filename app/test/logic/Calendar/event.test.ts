import { Event } from "../../../logic/Calendar/Event";
import { expect, test } from "vitest";

/** #1405: The event dialog showed the event twice: once from the calendar,
 * and once as proposal, because we didn't check whether it's already there. */
test("The same meeting in another calendar or invitation is the same event", () => {
  let invitation = new Event();
  invitation.calUID = "meeting-1";
  let inCalendar = new Event();
  inCalendar.calUID = "meeting-1";
  let otherMeeting = new Event();
  otherMeeting.calUID = "meeting-2";

  expect(invitation.isSameAs(invitation)).toBe(true);
  expect(invitation.isSameAs(inCalendar)).toBe(true);
  expect(invitation.isSameAs(otherMeeting)).toBe(false);
  expect(invitation.isSameAs(null)).toBe(false);
});

test("New events without calUID are not the same event", () => {
  let event = new Event();
  let otherEvent = new Event();

  expect(event.isSameAs(otherEvent)).toBe(false);
  expect(event.isSameAs(event)).toBe(true);
});
