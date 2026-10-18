// app first, to resolve the import cycle around Abstract/Account.ts
import { appGlobal } from "../../../../logic/app";
import { JMAPAccount } from "../../../../logic/Mail/JMAP/JMAPAccount";
import { JMAPCalendar } from "../../../../logic/Calendar/JMAP/JMAPCalendar";
import type { TJMAPCalendarEvent } from "../../../../logic/Calendar/JMAP/TJSCalendar";
import { DummyCalendarStorage } from "../../../../logic/Calendar/SQL/DummyCalendarStorage";
import { afterAll, beforeAll, expect, test, vi } from "vitest";

/* A JSCalendar duration in days means calendar days in the event's time zone
 * (draft-ietf-calext-jscalendarbis §1.5.6). In Europe/Berlin, the clocks go back
 * on 2026-10-25, so that day has 25 hours. Floating events use the local time zone. */
beforeAll(() => {
  appGlobal.remoteApp ??= {
    kyCreate: () => { throw new Error("The test should not talk to a real server"); },
  } as any;
  vi.stubEnv("TZ", "Europe/Berlin");
});
afterAll(() => {
  vi.unstubAllEnvs();
});

function serverEvent(duration: string, timeZone: string | undefined = "Europe/Berlin"): TJMAPCalendarEvent {
  return {
    "@type": "Event", id: "eventID", uid: "uid", title: "Conference",
    start: "2026-10-24T10:00:00", duration, ...(timeZone ? { timeZone } : {}),
    calendarIds: { calendarID: true },
  } as any as TJMAPCalendarEvent;
}

function setup(events: TJMAPCalendarEvent[]) {
  let account = new JMAPAccount();
  account.accountID = "jmapAccount";
  let calendar = new JMAPCalendar();
  calendar.initFromMainAccount(account);
  calendar.jmapID = "calendarID";
  calendar.storage = new DummyCalendarStorage();
  calendar.errorCallback = ex => { throw ex; };
  account.makeCombinedCall = async () => ({
    list: { accountId: "jmapAccount", queryState: "s", ids: events.map(event => event.id), position: 0, canCalculateChanges: true },
    events: { accountId: "jmapAccount", state: "s", list: events, notFound: [] },
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

async function listEvent(json: TJMAPCalendarEvent) {
  let { calendar, sent } = setup([json]);
  await (calendar as any).listAllEvents();
  return { event: calendar.events.first, calendar, sent };
}

test("2 days over the night when the clocks go back end at the same time of day", async () => {
  let { event } = await listEvent(serverEvent("P2D"));
  expect(event.startTime.toISOString()).toBe("2026-10-24T08:00:00.000Z");
  expect(event.endTime.toISOString()).toBe("2026-10-26T09:00:00.000Z");
});

test("Days and hours", async () => {
  let { event } = await listEvent(serverEvent("P1DT2H"));
  expect(event.endTime.toISOString()).toBe("2026-10-25T11:00:00.000Z");
});

test("A floating event takes the days in the local time zone", async () => {
  let { event } = await listEvent(serverEvent("P2D", undefined));
  expect(event.startTime.getTime()).toBe(new Date(2026, 9, 24, 10).getTime());
  expect(event.endTime.getTime()).toBe(new Date(2026, 9, 26, 10).getTime());
});

test("An unchanged duration in days is sent back as it is", async () => {
  let { event, sent } = await listEvent(serverEvent("P2D"));
  event.title = "Conference 2026";
  await event.save();
  expect(sent[0].update.eventID.duration ?? "P2D").toBe("P2D");
});

test("An event of exactly 24 hours over the night when the clocks go back is not sent as a day", async () => {
  let { calendar, sent } = setup([]);
  let event = calendar.newEvent();
  event.title = "24 hours";
  event.timezone = "Europe/Berlin";
  event.startTime = new Date("2026-10-24T08:00:00Z");
  event.endTime = new Date("2026-10-25T08:00:00Z");
  calendar.events.add(event);
  await event.save();
  expect(sent[0].create[event.id].duration).toBe("PT24H");
});
