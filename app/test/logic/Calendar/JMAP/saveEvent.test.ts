// app first, to resolve the import cycle around Abstract/Account.ts
import { appGlobal } from "../../../../logic/app";
import { JMAPAccount } from "../../../../logic/Mail/JMAP/JMAPAccount";
import { JMAPCalendar } from "../../../../logic/Calendar/JMAP/JMAPCalendar";
import type { TJMAPCalendarEvent } from "../../../../logic/Calendar/JMAP/TJSCalendar";
import { DummyCalendarStorage } from "../../../../logic/Calendar/SQL/DummyCalendarStorage";
import { beforeAll, expect, test } from "vitest";

beforeAll(() => {
  appGlobal.remoteApp ??= {
    kyCreate: () => { throw new Error("The test should not talk to a real server"); },
  } as any;
});

/** A weekly series, as the server returns it */
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
