import '../../../logic/app'; // Import first, to set up the module graph and dodge the Account import cycle
import { expect, test } from 'vitest';
import { Event } from '../../../logic/Calendar/Event';
import { Frequency, RecurrenceRule } from '../../../logic/Calendar/RecurrenceRule';

function dailyMaster(): Event {
  let master = new Event();
  master.startTime = new Date(2020, 0, 1, 9, 0);
  master.endTime = new Date(2020, 0, 1, 10, 0);
  master.recurrenceRule = new RecurrenceRule({
    masterDuration: 36e5,
    seriesStartTime: master.startTime,
    frequency: Frequency.Daily,
  });
  return master;
}

// #1186: Exchange (and other servers) can report a deleted occurrence whose
// date doesn't line up with our computed recurrence. This used to throw an
// assertion during sync ("occurrence date not in recurrence") and drop the
// whole recurring event.
test("Deleted occurrence not in the recurrence is ignored, not fatal - #1186", () => {
  let master = dailyMaster();
  // Occurrences are at 09:00; 09:30 matches none of them.
  let bogus = new Date(2020, 0, 5, 9, 30);
  expect(master.recurrenceRule.getIndexOfOccurrence(bogus)).toBe(-1);
  expect(() => (master as any).makeExclusionLocally(bogus)).not.toThrow();
  // Nothing to exclude, so no phantom exclusion is recorded (a -1 index
  // wouldn't survive the round-trip through the database anyway).
  expect(master.exclusions.length).toBe(0);
});

test("Genuine occurrence dates are still recognised for exclusion - #1186", () => {
  let master = dailyMaster();
  let valid = new Date(2020, 0, 5, 9, 0);
  // The guard must not swallow real deletions: this date is a real occurrence.
  expect(master.recurrenceRule.getIndexOfOccurrence(valid)).not.toBe(-1);
});

/** #1405: The event dialog showed the event twice: once from the calendar,
 * and once as proposal, because we didn't check whether it's already there. */
test("The same meeting in another calendar or invitation is the same event", () => {
  let invitation = new Event();
  invitation.calUID = "meeting-1";
  let inCalendar = new Event();
  inCalendar.calUID = "meeting-1";
  let otherMeeting = new Event();
  otherMeeting.calUID = "meeting-2";

  expect(invitation.isSameUID(invitation)).toBe(true);
  expect(invitation.isSameUID(inCalendar)).toBe(true);
  expect(invitation.isSameUID(otherMeeting)).toBe(false);
  expect(invitation.isSameUID(null)).toBe(false);
});

test("New events without calUID are not the same event", () => {
  let event = new Event();
  let otherEvent = new Event();

  expect(event.isSameUID(otherEvent)).toBe(false);
  expect(event.isSameUID(event)).toBe(true);
});
