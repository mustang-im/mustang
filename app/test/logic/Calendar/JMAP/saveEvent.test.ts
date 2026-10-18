// app first, to resolve the import cycle around Abstract/Account.ts
import { appGlobal } from "../../../../logic/app";
import { JMAPAccount } from "../../../../logic/Mail/JMAP/JMAPAccount";
import { JMAPCalendar } from "../../../../logic/Calendar/JMAP/JMAPCalendar";
import type { TJMAPCalendarEvent } from "../../../../logic/Calendar/JMAP/TJSCalendar";
import { DummyCalendarStorage } from "../../../../logic/Calendar/SQL/DummyCalendarStorage";
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";

beforeAll(() => {
  appGlobal.remoteApp ??= {
    kyCreate: () => { throw new Error("The test should not talk to a real server"); },
  } as any;
});

/** A weekly series with a reminder 10 minutes before the start, as the server returns it */
function serverEvent(): TJMAPCalendarEvent {
  return {
    "@type": "Event",
    id: "eventID",
    uid: "server-uid",
    title: "Weekly",
    description: "Agenda",
    descriptionContentType: "text/plain",
    start: "2026-01-05T10:00:00",
    timeZone: "Europe/Berlin",
    duration: "PT1H",
    showWithoutTime: false,
    calendarIds: { calendarID: true },
    recurrenceRule: { "@type": "RecurrenceRule", frequency: "weekly", interval: 1 },
    alerts: {
      "1": { "@type": "Alert", action: "display", trigger: { "@type": "OffsetTrigger", offset: "-PT10M" } },
    },
  } as any as TJMAPCalendarEvent;
}

/** A JMAP calendar that serves `events` and records what we send back */
function setup(events: TJMAPCalendarEvent[]) {
  let account = new JMAPAccount();
  account.accountID = "jmapAccount";
  let calendar = new JMAPCalendar();
  calendar.initFromMainAccount(account);
  calendar.jmapID = "calendarID";
  calendar.storage = new DummyCalendarStorage();
  calendar.errorCallback = ex => { throw ex; };

  account.makeCombinedCall = async () => ({
    list: { accountId: account.accountID, queryState: "queryState", ids: events.map(event => event.id), position: 0, canCalculateChanges: true },
    events: { accountId: account.accountID, state: "eventState", list: events, notFound: [] },
  });
  let sent: Record<string, any>[] = [];
  account.makeSingleCall = async (method: string, args: Record<string, any>) => {
    sent.push(args);
    return args.create
      ? { created: { [Object.keys(args.create)[0]]: { id: "newEventID" } } }
      : { updated: { [Object.keys(args.update)[0]]: null } };
  };
  return { calendar, sent };
}

async function listEvents(events: TJMAPCalendarEvent[]) {
  let { calendar, sent } = setup(events);
  await (calendar as any).listAllEvents();
  return { event: calendar.events.first, calendar, sent };
}

test("An update does not send the UID", async () => {
  // The UID is immutable, and Stalwart drops the UID of the stored event when we
  // send `null`. It then refuses every later change to that event.
  let { event, sent } = await listEvents([serverEvent()]);

  event.title = "Weekly meeting";
  await event.save();

  expect(sent.length).toBe(1);
  expect(sent[0].update.eventID).not.toHaveProperty("uid");
});

test("A new event sends its UID", async () => {
  let { calendar, sent } = setup([]);
  let event = calendar.newEvent();
  event.title = "New event";
  event.startTime = new Date(2026, 0, 5, 10);
  event.endTime = new Date(2026, 0, 5, 11);
  calendar.events.add(event);

  await event.save();

  expect(event.calUID).toBeTruthy();
  expect(sent[0].create[event.id].uid).toBe(event.calUID);
});

test("The reminder is read from the server", async () => {
  let { event } = await listEvents([serverEvent()]);

  expect(event.startTime.getTime() - event.alarm.getTime()).toBe(10 * 60 * 1000);
});

test("An event without an alert has no reminder", async () => {
  let json = serverEvent();
  delete json.alerts;
  let { event } = await listEvents([json]);

  expect(event.alarm).toBe(null);
});

test("An absolute alert time is read as the reminder", async () => {
  let json = serverEvent();
  json.alerts = {
    "1": { "@type": "Alert", action: "display", trigger: { "@type": "AbsoluteTrigger", when: "2026-01-05T08:00:00Z" } },
  };
  let { event } = await listEvents([json]);

  expect(event.alarm.toISOString()).toBe("2026-01-05T08:00:00.000Z");
});

test("An alert whose trigger has no @type is an offset from the start", async () => {
  // draft-ietf-calext-jscalendarbis 3.5.1: "trigger: OffsetTrigger|AbsoluteTrigger|UnknownTrigger (mandatory; defaultType: OffsetTrigger)"
  let json = serverEvent();
  json.alerts = { "1": { trigger: { offset: "-PT20M" } } } as any;
  let { event } = await listEvents([json]);

  expect(event.startTime.getTime() - event.alarm.getTime()).toBe(20 * 60 * 1000);
});

test("An alert relative to the end is read as the reminder", async () => {
  let json = serverEvent();
  json.alerts = {
    "1": { "@type": "Alert", action: "display", trigger: { "@type": "OffsetTrigger", offset: "PT5M", relativeTo: "end" } },
  };
  let { event } = await listEvents([json]);

  expect(event.alarm.getTime() - event.endTime.getTime()).toBe(5 * 60 * 1000);
});

test("A changed reminder is sent to the server", async () => {
  let { event, sent } = await listEvents([serverEvent()]);

  event.alarm = new Date(event.startTime.getTime() - 15 * 60 * 1000);
  await event.save();

  expect(Object.values(sent[0].update.eventID.alerts)[0]).toMatchObject({
    "@type": "Alert",
    trigger: { "@type": "OffsetTrigger", offset: "-PT15M" },
  });
  // Otherwise the server ignores our alert and uses the calendar default
  expect(sent[0].update.eventID.useDefaultAlerts).toBe(false);
});

test("An unchanged alert is left alone", async () => {
  // Our offset trigger fires before every occurrence, but the absolute trigger
  // that it would replace fires only once
  let json = serverEvent();
  json.alerts = {
    "1": { "@type": "Alert", action: "display", trigger: { "@type": "AbsoluteTrigger", when: "2026-01-05T08:00:00Z" } },
  };
  let { event, sent } = await listEvents([json]);

  event.title = "Weekly meeting";
  await event.save();

  expect(Object.values(sent[0].update.eventID.alerts)[0]).toMatchObject({
    trigger: { "@type": "AbsoluteTrigger", when: "2026-01-05T08:00:00Z" },
  });
  expect(sent[0].update.eventID).not.toHaveProperty("useDefaultAlerts");
});

test("A changed reminder replaces an absolute alert", async () => {
  let json = serverEvent();
  json.alerts = {
    "1": { "@type": "Alert", action: "display", trigger: { "@type": "AbsoluteTrigger", when: "2026-01-05T08:00:00Z" } },
  };
  let { event, sent } = await listEvents([json]);

  event.alarm = new Date(event.startTime.getTime() - 15 * 60 * 1000);
  await event.save();

  expect(Object.values(sent[0].update.eventID.alerts)[0]).toMatchObject({
    trigger: { "@type": "OffsetTrigger", offset: "-PT15M" },
  });
});

test("A removed reminder is sent to the server", async () => {
  let { event, sent } = await listEvents([serverEvent()]);

  event.alarm = null;
  await event.save();

  expect(sent[0].update.eventID.alerts).toEqual({});
});

/* JSCalendar gives the end of an event as duration, and an all-day event
 * lasts "P1D". On the days when the clocks change, a day has 23 or 25 hours.
 * The dates are created within the tests, after the time zone has been set. */
describe("All-day events on the days when the clocks change", () => {
  beforeAll(() => {
    vi.stubEnv("TZ", "Europe/Berlin");
  });
  afterAll(() => {
    vi.unstubAllEnvs();
  });

  function allDayServerEvent(start: string): TJMAPCalendarEvent {
    let json = serverEvent();
    json.start = start;
    json.duration = "P1D";
    json.showWithoutTime = true;
    delete json.recurrenceRule;
    delete json.alerts;
    return json;
  }

  test("An all-day event on the day the clocks go back ends at midnight", async () => {
    let { event } = await listEvents([allDayServerEvent("2026-10-25T00:00:00")]);

    expect(event.startTime.getTime()).toBe(new Date(2026, 9, 25).getTime());
    expect(event.endTime.getTime()).toBe(new Date(2026, 9, 26).getTime());
    expect(event.durationDays).toBe(1);
  });

  test("An all-day event on the day the clocks go forward ends at midnight", async () => {
    let { event } = await listEvents([allDayServerEvent("2026-03-29T00:00:00")]);

    expect(event.startTime.getTime()).toBe(new Date(2026, 2, 29).getTime());
    expect(event.endTime.getTime()).toBe(new Date(2026, 2, 30).getTime());
    expect(event.durationDays).toBe(1);
  });

  test("An all-day event on the day the clocks go forward is sent back as 1 day", async () => {
    let { event, sent } = await listEvents([allDayServerEvent("2026-03-29T00:00:00")]);

    event.title = "Changed";
    await event.save();

    expect(sent[0].update.eventID.duration).toBe("P1D");
  });

  test("A new all-day event on the day the clocks go back is sent as 1 day", async () => {
    let { calendar, sent } = setup([]);
    let event = calendar.newEvent();
    event.title = "New all-day event";
    event.allDay = true;
    event.startTime = new Date(2026, 9, 25);
    event.endTime = new Date(2026, 9, 26);
    calendar.events.add(event);

    await event.save();

    expect(sent[0].create[event.id].start).toBe("2026-10-25T00:00:00");
    expect(sent[0].create[event.id].duration).toBe("P1D");
  });
});
