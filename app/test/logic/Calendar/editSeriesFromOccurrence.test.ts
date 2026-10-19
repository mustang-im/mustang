import '../../../logic/app'; // Import first, to set up the module graph and dodge the Account import cycle
import { afterAll, afterEach, beforeAll, expect, test, vi } from 'vitest';
import { Event, RecurrenceCase } from '../../../logic/Calendar/Event';
import { Calendar } from '../../../logic/Calendar/Calendar';
import { Participant } from '../../../logic/Calendar/Participant';
import { InvitationResponse } from '../../../logic/Calendar/Invitation/InvitationStatus';
import { OutgoingInvitation } from '../../../logic/Calendar/Invitation/OutgoingInvitation';
import { DummyCalendarStorage } from '../../../logic/Calendar/SQL/DummyCalendarStorage';
import { Frequency, Weekday } from '../../../logic/Calendar/RecurrenceRule';
import { getICal } from '../../../logic/Calendar/ICal/ICalGenerator';
import { k1HourMS, k1MinuteMS } from '../../../logic/util/date';

/* The user opens one occurrence of a series, changes it, and saves it for the entire series.
 * The series used to restart at the edited occurrence, which dropped the earlier occurrences.
 * Now, the series keeps its start, and all occurrences move by as much as the edited one.
 *
 * The clocks go forward on 28 March 2027 in Europe/Berlin.
 * The dates are created within the tests, after the time zone has been set. */

beforeAll(() => {
  vi.stubEnv("TZ", "Europe/Berlin");
});
afterAll(() => {
  vi.unstubAllEnvs();
});
afterEach(() => {
  vi.restoreAllMocks();
});

/** Every Monday from 9:00 to 10:00, from Monday 4 January 2027 */
function weeklySeries(weekdays = [Weekday.Monday]): Event {
  let calendar = new Calendar();
  calendar.storage = new DummyCalendarStorage();
  let master = calendar.newEvent();
  master.title = "Weekly";
  master.startTime = new Date(2027, 0, 4, 9, 0);
  master.endTime = new Date(2027, 0, 4, 10, 0);
  master.timezone = "Europe/Berlin";
  master.newRecurrenceRule(Frequency.Weekly, 1, 0, weekdays);
  return master;
}

/** What the event dialog does when it opens an occurrence */
function openOccurrence(master: Event, index: number): Event {
  let occurrence = master.getOccurrenceByDate(master.recurrenceRule.getOccurrenceByIndex(index));
  occurrence.startEditing();
  master.startEditing();
  master.moveSeriesWithOccurrence(occurrence);
  return occurrence;
}

/** What the event dialog does when the user changes the start time of the occurrence */
function changeStartTime(occurrence: Event, startTime: Date) {
  let duration = occurrence.duration;
  occurrence.startTime = startTime;
  occurrence.duration = duration;
  occurrence.parentEvent.moveSeriesWithOccurrence(occurrence);
}

/** What "Change entire series" does */
async function saveForSeries(occurrence: Event): Promise<Event> {
  let master = occurrence.parentEvent;
  master.startEditing();
  master.copyEditableFieldsFromOccurrence(occurrence);
  await master.save();
  master.finishEditing();
  return master;
}

function occurrenceTime(master: Event, index: number): number | undefined {
  return master.recurrenceRule.getOccurrenceByIndex(index)?.getTime();
}

function addException(master: Event, index: number): Event {
  let exception = master.calendar.newEvent(master);
  exception.recurrenceCase = RecurrenceCase.Exception;
  exception.recurrenceStartTime = master.recurrenceRule.getOccurrenceByIndex(index);
  exception.startTime = new Date(exception.recurrenceStartTime.getTime() + k1HourMS);
  exception.endTime = new Date(exception.startTime.getTime() + k1HourMS);
  master.exceptions.add(exception);
  return exception;
}

test("Moving an occurrence by an hour moves the entire series, and keeps the earlier occurrences", async () => {
  let master = weeklySeries();
  let occurrence = openOccurrence(master, 5);
  changeStartTime(occurrence, new Date(2027, 1, 8, 10, 0));
  await saveForSeries(occurrence);

  expect(master.startTime.getTime()).toBe(new Date(2027, 0, 4, 10, 0).getTime());
  expect(master.endTime.getTime()).toBe(new Date(2027, 0, 4, 11, 0).getTime());
  expect(occurrenceTime(master, 0)).toBe(new Date(2027, 0, 4, 10, 0).getTime());
  expect(occurrenceTime(master, 5)).toBe(new Date(2027, 1, 8, 10, 0).getTime());
  expect(master.instances.first.startTime.getTime()).toBe(new Date(2027, 0, 4, 10, 0).getTime());
  expect(master.instances.first.endTime.getTime()).toBe(new Date(2027, 0, 4, 11, 0).getTime());
});

test("Moving an occurrence to another day moves all occurrences to that weekday", async () => {
  let master = weeklySeries();
  let occurrence = openOccurrence(master, 3);
  changeStartTime(occurrence, new Date(2027, 0, 26, 9, 0));
  await saveForSeries(occurrence);

  expect(master.startTime.getTime()).toBe(new Date(2027, 0, 5, 9, 0).getTime());
  expect(master.recurrenceRule.weekdays).toEqual([Weekday.Tuesday]);
  expect(occurrenceTime(master, 0)).toBe(new Date(2027, 0, 5, 9, 0).getTime());
  expect(occurrenceTime(master, 3)).toBe(new Date(2027, 0, 26, 9, 0).getTime());
});

test("Moving an occurrence of a series on several weekdays moves all its weekdays", async () => {
  let master = weeklySeries([Weekday.Monday, Weekday.Wednesday]);
  let occurrence = openOccurrence(master, 1);
  expect(occurrence.startTime.getTime()).toBe(new Date(2027, 0, 6, 9, 0).getTime());
  changeStartTime(occurrence, new Date(2027, 0, 7, 9, 0));
  await saveForSeries(occurrence);

  expect(master.startTime.getTime()).toBe(new Date(2027, 0, 5, 9, 0).getTime());
  expect([...master.recurrenceRule.weekdays].sort()).toEqual([Weekday.Tuesday, Weekday.Thursday]);
  expect(occurrenceTime(master, 1)).toBe(new Date(2027, 0, 7, 9, 0).getTime());
  expect(occurrenceTime(master, 2)).toBe(new Date(2027, 0, 12, 9, 0).getTime());
});

test("Moving an occurrence of a monthly series moves the day of the month", async () => {
  let master = weeklySeries();
  master.startTime = new Date(2027, 0, 5, 9, 0);
  master.endTime = new Date(2027, 0, 5, 10, 0);
  master.newRecurrenceRule(Frequency.Monthly);
  let occurrence = openOccurrence(master, 2);
  changeStartTime(occurrence, new Date(2027, 2, 7, 9, 0));
  await saveForSeries(occurrence);

  expect(master.startTime.getTime()).toBe(new Date(2027, 0, 7, 9, 0).getTime());
  expect(occurrenceTime(master, 1)).toBe(new Date(2027, 1, 7, 9, 0).getTime());
  expect(occurrenceTime(master, 2)).toBe(new Date(2027, 2, 7, 9, 0).getTime());
});

test("Opening an occurrence doesn't change the series", () => {
  let master = weeklySeries();
  openOccurrence(master, 5);
  expect(master.startTime.getTime()).toBe(new Date(2027, 0, 4, 9, 0).getTime());
  expect(master.hasChanged()).toBe(false);
});

test("Changing the time several times and back leaves the series unchanged", () => {
  let master = weeklySeries([Weekday.Monday, Weekday.Wednesday]);
  let occurrence = openOccurrence(master, 4);
  changeStartTime(occurrence, new Date(2027, 0, 18, 10, 0));
  changeStartTime(occurrence, new Date(2027, 0, 19, 11, 0));
  expect(master.startTime.getTime()).toBe(new Date(2027, 0, 5, 11, 0).getTime());
  expect([...master.recurrenceRule.weekdays].sort()).toEqual([Weekday.Tuesday, Weekday.Thursday]);

  changeStartTime(occurrence, new Date(2027, 0, 18, 9, 0));
  expect(master.startTime.getTime()).toBe(new Date(2027, 0, 4, 9, 0).getTime());
  expect(master.hasChanged()).toBe(false);
});

test("Changing the duration of an occurrence changes it for the entire series", async () => {
  let master = weeklySeries();
  let occurrence = openOccurrence(master, 5);
  occurrence.durationMinutes = 30;
  master.moveSeriesWithOccurrence(occurrence);
  await saveForSeries(occurrence);

  expect(master.startTime.getTime()).toBe(new Date(2027, 0, 4, 9, 0).getTime());
  expect(master.durationMinutes).toBe(30);
  expect(master.instances.first.endTime.getTime()).toBe(new Date(2027, 0, 4, 9, 30).getTime());
});

test("Changing only the title keeps the times, the exceptions and the exclusions", async () => {
  let master = weeklySeries();
  let exception = addException(master, 2);
  let exclusion = master.recurrenceRule.getOccurrenceByIndex(4);
  master.exclusions.add(exclusion);
  let rule = master.recurrenceRule;
  let occurrence = openOccurrence(master, 5);
  occurrence.title = "Renamed";
  await saveForSeries(occurrence);

  expect(master.title).toBe("Renamed");
  expect(master.startTime.getTime()).toBe(new Date(2027, 0, 4, 9, 0).getTime());
  expect(master.recurrenceRule.matches(rule)).toBe(true);
  expect(master.exceptions.contents).toEqual([exception]);
  expect(master.exclusions.contents).toEqual([exclusion]);
});

test("Moving the occurrences removes the exceptions, as the dialog warns", async () => {
  let master = weeklySeries();
  addException(master, 2);
  let occurrence = openOccurrence(master, 5);
  changeStartTime(occurrence, new Date(2027, 1, 8, 10, 0));
  await saveForSeries(occurrence);

  expect(master.exceptions.isEmpty).toBe(true);
});

test("Moving an occurrence after the clocks went forward keeps the time of day before", async () => {
  let master = weeklySeries();
  let occurrence = openOccurrence(master, 13);
  expect(occurrence.startTime.getTime()).toBe(new Date(2027, 3, 5, 9, 0).getTime());
  changeStartTime(occurrence, new Date(2027, 3, 5, 10, 0));
  await saveForSeries(occurrence);

  expect(master.startTime.getTime()).toBe(new Date(2027, 0, 4, 10, 0).getTime());
  expect(occurrenceTime(master, 13)).toBe(new Date(2027, 3, 5, 10, 0).getTime());
});

test("Moving an occurrence by a week across the clock change keeps the time of day", async () => {
  let master = weeklySeries();
  let occurrence = openOccurrence(master, 11);
  expect(occurrence.startTime.getTime()).toBe(new Date(2027, 2, 22, 9, 0).getTime());
  changeStartTime(occurrence, new Date(2027, 2, 29, 9, 0));
  await saveForSeries(occurrence);

  expect(master.startTime.getTime()).toBe(new Date(2027, 0, 11, 9, 0).getTime());
  expect(occurrenceTime(master, 11)).toBe(new Date(2027, 2, 29, 9, 0).getTime());
});

test("Moving the start of the series across the clock change keeps the time of day and the last occurrence", async () => {
  let master = weeklySeries();
  master.startTime = new Date(2027, 2, 25, 9, 0);
  master.endTime = new Date(2027, 2, 25, 10, 0);
  master.newRecurrenceRule(Frequency.Weekly, 1, 0, [Weekday.Thursday]);
  await master.setRecurrenceEndTime(new Date(2027, 4, 6, 9, 0));
  expect(master.instances.length).toBe(7);
  let occurrence = openOccurrence(master, 2);
  changeStartTime(occurrence, new Date(2027, 3, 12, 9, 0));
  await saveForSeries(occurrence);

  expect(master.startTime.getTime()).toBe(new Date(2027, 2, 29, 9, 0).getTime());
  expect(master.recurrenceRule.weekdays).toEqual([Weekday.Monday]);
  expect(master.instances.length).toBe(7);
  expect(master.instances.get(6).startTime.getTime()).toBe(new Date(2027, 4, 10, 9, 0).getTime());
});

test("A series in another time zone keeps its time of day there", async () => {
  const kTimezone = "Australia/Sydney";
  let local = (time: Date) => time.toLocaleString("lt", { timeZone: kTimezone });
  let master = weeklySeries();
  master.timezone = kTimezone;
  master.startTime = new Date(Date.UTC(2027, 0, 3, 22, 0));
  master.endTime = new Date(Date.UTC(2027, 0, 3, 23, 0));
  master.newRecurrenceRule(Frequency.Weekly, 1, 0, [Weekday.Monday]);
  expect(local(master.startTime)).toBe("2027-01-04 09:00:00");
  let occurrence = openOccurrence(master, 26);
  expect(local(occurrence.startTime)).toBe("2027-07-05 09:00:00");
  changeStartTime(occurrence, new Date(occurrence.startTime.getTime() + k1HourMS));
  await saveForSeries(occurrence);

  expect(local(master.startTime)).toBe("2027-01-04 10:00:00");
  expect(local(new Date(occurrenceTime(master, 26)))).toBe("2027-07-05 10:00:00");
});

test("Moving an occurrence of an all-day series moves all days", async () => {
  let master = weeklySeries();
  master.allDay = true;
  master.startTime = new Date(2027, 0, 4);
  master.endTime = new Date(2027, 0, 5);
  master.newRecurrenceRule(Frequency.Weekly, 1, 0, [Weekday.Monday]);
  let occurrence = openOccurrence(master, 13);
  expect(occurrence.startTime.getTime()).toBe(new Date(2027, 3, 5).getTime());
  changeStartTime(occurrence, new Date(2027, 3, 6));
  await saveForSeries(occurrence);

  expect(master.allDay).toBe(true);
  expect(master.startTime.getTime()).toBe(new Date(2027, 0, 5).getTime());
  expect(master.endTime.getTime()).toBe(new Date(2027, 0, 6).getTime());
  expect(master.recurrenceRule.weekdays).toEqual([Weekday.Tuesday]);
  expect(occurrenceTime(master, 13)).toBe(new Date(2027, 3, 6).getTime());
});

test("Making an occurrence all-day makes the entire series all-day, one day long", async () => {
  let master = weeklySeries();
  let occurrence = openOccurrence(master, 5);
  // What the time box does when the user turns on "All day"
  occurrence.allDay = true;
  occurrence.timezone = null;
  occurrence.startTime = new Date(2027, 1, 8);
  occurrence.endTime = new Date(2027, 1, 9);
  master.moveSeriesWithOccurrence(occurrence);
  await saveForSeries(occurrence);

  expect(master.allDay).toBe(true);
  expect(master.startTime.getTime()).toBe(new Date(2027, 0, 4).getTime());
  // The series kept its old end time, 10:00 on the first day
  expect(master.endTime.getTime()).toBe(new Date(2027, 0, 5).getTime());
  expect(occurrenceTime(master, 5)).toBe(new Date(2027, 1, 8).getTime());
  expect(master.instances.get(5).endTime.getTime()).toBe(new Date(2027, 1, 9).getTime());
});

/** A series without time zone, e.g. from a server that sent floating times */
function weeklySeriesWithoutTimezone(): Event {
  let master = weeklySeries();
  master.timezone = null;
  master.newRecurrenceRule(Frequency.Weekly, 1, 0, [Weekday.Monday]);
  expect(master.recurrenceRule.timezone).toBeUndefined();
  return master;
}

test("Opening an occurrence of a series without time zone doesn't change the series", () => {
  let master = weeklySeriesWithoutTimezone();
  openOccurrence(master, 5);
  expect(master.hasChanged()).toBe(false);
});

test("Changing only the title of a series without time zone keeps the exceptions", async () => {
  let master = weeklySeriesWithoutTimezone();
  let exception = addException(master, 2);
  let occurrence = openOccurrence(master, 5);
  occurrence.title = "Renamed";
  // The dialog asks whether to remove the exceptions when this is false
  expect(master.unedited.recurrenceRule.timesMatch(master.recurrenceRule)).toBe(true);
  await saveForSeries(occurrence);

  expect(master.title).toBe("Renamed");
  expect(master.startTime.getTime()).toBe(new Date(2027, 0, 4, 9, 0).getTime());
  expect(master.exceptions.contents).toEqual([exception]);
});

test("A series that ends after a number of times keeps the same occurrences", async () => {
  let master = weeklySeries();
  await master.setRecurrenceCount(10);
  let occurrence = openOccurrence(master, 5);
  changeStartTime(occurrence, new Date(2027, 1, 8, 10, 0));
  await saveForSeries(occurrence);

  expect(master.recurrenceRule.count).toBe(10);
  expect(master.instances.length).toBe(10);
  expect(master.instances.first.startTime.getTime()).toBe(new Date(2027, 0, 4, 10, 0).getTime());
  expect(master.instances.get(9).startTime.getTime()).toBe(new Date(2027, 2, 8, 10, 0).getTime());
});

test("A series that ends at its last occurrence keeps it when the occurrences move later", async () => {
  let master = weeklySeries();
  await master.setRecurrenceEndTime(new Date(2027, 2, 8, 9, 0));
  expect(master.instances.length).toBe(10);
  let occurrence = openOccurrence(master, 5);
  changeStartTime(occurrence, new Date(2027, 1, 9, 10, 0));
  await saveForSeries(occurrence);

  expect(master.instances.length).toBe(10);
  expect(master.instances.first.startTime.getTime()).toBe(new Date(2027, 0, 5, 10, 0).getTime());
  expect(master.instances.get(9).startTime.getTime()).toBe(new Date(2027, 2, 9, 10, 0).getTime());
  expect(master.recurrenceRule.seriesEndTime.getTime()).toBe(new Date(2027, 2, 9, 10, 0).getTime());
});

test("The reminder of the series keeps its time before the start", async () => {
  let master = weeklySeries();
  master.alarm = new Date(master.startTime.getTime() - 15 * k1MinuteMS);
  master.newRecurrenceRule(Frequency.Weekly, 1, 0, [Weekday.Monday]);
  let occurrence = openOccurrence(master, 5);
  changeStartTime(occurrence, new Date(2027, 1, 8, 10, 0));
  // The reminder box keeps the time before the start
  occurrence.alarm = new Date(occurrence.startTime.getTime() - 15 * k1MinuteMS);
  await saveForSeries(occurrence);

  expect(master.alarm.getTime()).toBe(new Date(2027, 0, 4, 9, 45).getTime());
});

test("Attendees get the series with its first occurrence", async () => {
  let master = weeklySeries();
  master.calUID = "weekly-meeting";
  master.myParticipation = InvitationResponse.Organizer;
  master.participants.add(new Participant("organizer@example.com", "Organizer", InvitationResponse.Organizer));
  master.participants.add(new Participant("attendee@example.com", "Attendee", InvitationResponse.Accept));
  master.generateRecurringInstances();
  let sendInvitations = vi.spyOn(OutgoingInvitation.prototype, "sendInvitations").mockResolvedValue();
  let occurrence = openOccurrence(master, 5);
  changeStartTime(occurrence, new Date(2027, 1, 8, 10, 0));
  await saveForSeries(occurrence);

  expect(sendInvitations).toHaveBeenCalledTimes(1);
  expect((sendInvitations.mock.contexts[0] as OutgoingInvitation).event).toBe(master);
  let ical = await getICal(master, "REQUEST");
  expect(ical).toContain("TZID=Europe/Berlin:20270104T100000");
  expect(ical).toContain("RRULE:FREQ=WEEKLY;BYDAY=MO");
});
