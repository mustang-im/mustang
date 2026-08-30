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

/** Events on the server, `event0` being the oldest and `event<count - 1>` the latest */
function serverEvents(count: number): TJMAPCalendarEvent[] {
  return Array.from({ length: count }, (_, i) => ({
    id: "event" + i,
    uid: "uid" + i,
    title: "Event " + i,
    description: "Agenda " + i,
    start: new Date(Date.UTC(2026, 0, 1 + i, 10)).toISOString().replace(".000", ""),
    duration: "PT1H",
  }) as any as TJMAPCalendarEvent);
}

/**
 * A JMAP calendar whose server calls are answered from `events`.
 * @param serverMaxLimit The limit that the server enforces, if it caps ours.
 *   RFC 8620 section 5.5 allows this, and then reports the limit that it used.
 */
function setup(events: TJMAPCalendarEvent[], serverMaxLimit?: number) {
  let account = new JMAPAccount();
  account.accountID = "jmapAccount";
  let calendar = new JMAPCalendar();
  calendar.initFromMainAccount(account);
  calendar.jmapID = "calendarID";
  calendar.storage = new DummyCalendarStorage();
  calendar.errorCallback = ex => { throw ex; };

  let requestedLimits: number[] = [];
  account.makeCombinedCall = async (calls: [string, Record<string, any>, string?][]) => {
    let query = calls[0][1];
    requestedLimits.push(query.limit);
    let sorted = query.sort[0].isAscending === false
      ? [...events].reverse()
      : events;
    let served = serverMaxLimit ? Math.min(query.limit, serverMaxLimit) : query.limit;
    let page = sorted.slice(query.position, query.position + served);
    return {
      list: {
        accountId: account.accountID,
        queryState: "queryState",
        ids: page.map(event => event.id),
        position: query.position,
        limit: serverMaxLimit, // undefined when the server used our limit
        canCalculateChanges: true,
      },
      events: {
        accountId: account.accountID,
        state: "eventState",
        list: page,
        notFound: [],
      },
    };
  };
  return { calendar, requestedLimits };
}

test("All events are listed, in as many calls as there are pages", async () => {
  let { calendar, requestedLimits } = setup(serverEvents(500));

  await (calendar as any).listAllEvents();

  expect(calendar.events.length).toBe(500);
  expect(requestedLimits.length).toBe(3); // 200 + 200 + 100, no trailing empty page
});

test("The latest events are listed first", async () => {
  let { calendar } = setup(serverEvents(500));

  await (calendar as any).listAllEvents();

  // The first page must hold the latest events, so that the calendar shows the
  // upcoming meetings even while the rest of the listing is still running.
  expect(calendar.events.first.calUID).toBe("uid499");
  expect(calendar.events.get(199).calUID).toBe("uid300");
  expect(calendar.events.last.calUID).toBe("uid0");
});

test("A server that enforces a smaller limit does not cut the listing short", async () => {
  // #1: We used to treat the short page as "that was the last one" and stop
  // after 50 of 500 events, losing everything at the end of the list.
  let { calendar, requestedLimits } = setup(serverEvents(500), 50);

  await (calendar as any).listAllEvents();

  expect(calendar.events.length).toBe(500);
  expect(calendar.events.last.calUID).toBe("uid0"); // down to the oldest one
  expect(requestedLimits.length).toBe(11); // 10 pages of 50, then a short one
});

test("A calendar that fits in one page needs only one call", async () => {
  let { calendar, requestedLimits } = setup(serverEvents(7));

  await (calendar as any).listAllEvents();

  expect(calendar.events.length).toBe(7);
  expect(requestedLimits.length).toBe(1);
});

test("An event without a description is not dropped", async () => {
  // RFC 8984 section 4.2.2: `description` defaults to "", so servers may leave it
  // out. We used to throw while parsing it, and silently drop the whole event.
  let events = serverEvents(2);
  delete (events[0] as any).description;
  let { calendar } = setup(events);

  await (calendar as any).listAllEvents();

  expect(calendar.events.length).toBe(2);
  expect(calendar.events.find(event => event.calUID == "uid0").descriptionText).toBe("");
});

test("An empty calendar needs only one call", async () => {
  let { calendar, requestedLimits } = setup(serverEvents(0));

  await (calendar as any).listAllEvents();

  expect(calendar.events.length).toBe(0);
  expect(requestedLimits.length).toBe(1);
});
