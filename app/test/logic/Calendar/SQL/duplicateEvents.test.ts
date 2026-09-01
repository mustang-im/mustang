// app first, to resolve the import cycle around Abstract/Account.ts
import { appGlobal } from "../../../../logic/app";
import { Calendar } from "../../../../logic/Calendar/Calendar";
import type { Event } from "../../../../logic/Calendar/Event";
import { SQLCalendar } from "../../../../logic/Calendar/SQL/SQLCalendar";
import { SQLCalendarStorage } from "../../../../logic/Calendar/SQL/SQLCalendarStorage";
import { InProcessSQLiteDatabase } from "../../util/inProcessSQLite";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { beforeAll, expect, test } from "vitest";

let calendar: Calendar;

beforeAll(async () => {
  let tempDir = mkdtempSync(path.join(tmpdir(), "calendar-duplicates-test-"));
  appGlobal.remoteApp = {
    getSQLiteDatabase: (filename: string) =>
      new InProcessSQLiteDatabase(path.join(tempDir, filename)),
  } as any;

  calendar = new Calendar();
  calendar.name = "Test";
  calendar.storage = new SQLCalendarStorage();
  await SQLCalendar.save(calendar);
  appGlobal.calendars.add(calendar);
});

function newTestEvent(title: string, pID: string | null): Event {
  let event = calendar.newEvent();
  event.title = title;
  event.pID = pID;
  event.startTime = new Date("2026-07-14T10:00:00Z");
  event.endTime = new Date("2026-07-14T11:00:00Z");
  return event;
}

test("The same server ID cannot be saved twice in the same calendar", async () => {
  await newTestEvent("Planning", "item-1").saveLocally();

  await expect(newTestEvent("Planning", "item-1").saveLocally()).rejects.toThrow();
});

test("Events that exist only locally have no server ID and may repeat", async () => {
  await newTestEvent("Lunch", null).saveLocally();
  await newTestEvent("Lunch", null).saveLocally();
});
