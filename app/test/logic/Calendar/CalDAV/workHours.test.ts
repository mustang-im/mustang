import { CalDAVCalendar } from "../../../../logic/Calendar/CalDAV/CalDAVCalendar";
import { CalDAVAvailability } from "../../../../logic/Calendar/CalDAV/CalDAVAvailability";
import { WorkHours } from "../../../../logic/Calendar/WorkHours";
import { AuthMethod } from "../../../../logic/Abstract/Account";
import { expect, test } from "vitest";

/** Similar to what the Nextcloud calendar app saves as "Working hours",
 * here with a lunch break and a short Friday */
const kAvailability = [
  "BEGIN:VCALENDAR",
  "PRODID:Nextcloud DAV app",
  "BEGIN:VTIMEZONE",
  "TZID:Europe/Berlin",
  "BEGIN:STANDARD",
  "DTSTART:19701025T030000",
  "TZOFFSETFROM:+0200",
  "TZOFFSETTO:+0100",
  "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU",
  "END:STANDARD",
  "END:VTIMEZONE",
  "BEGIN:VAVAILABILITY",
  "BEGIN:AVAILABLE",
  "DTSTART;TZID=Europe/Berlin:20160101T090000",
  "DTEND;TZID=Europe/Berlin:20160101T120000",
  "UID:a1",
  "RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH",
  "END:AVAILABLE",
  "BEGIN:AVAILABLE",
  "DTSTART;TZID=Europe/Berlin:20160101T130000",
  "DTEND;TZID=Europe/Berlin:20160101T170000",
  "UID:a2",
  "RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH",
  "END:AVAILABLE",
  "BEGIN:AVAILABLE",
  "DTSTART;TZID=Europe/Berlin:20160101T080000",
  "DURATION:PT5H",
  "UID:a3",
  "RRULE:FREQ=WEEKLY;BYDAY=FR",
  "END:AVAILABLE",
  "END:VAVAILABILITY",
  "END:VCALENDAR",
  ""].join("\r\n");

test("CalDAV: Read work hours from VAVAILABILITY", () => {
  let availability = CalDAVAvailability.fromICal(kAvailability);
  expect(availability.timezone).toBe("Europe/Berlin");
  expect(availability.periods[1]).toEqual([
    { startMinutes: 9 * 60, endMinutes: 12 * 60 },
    { startMinutes: 13 * 60, endMinutes: 17 * 60 },
  ]);
  expect(availability.periods[5]).toEqual([{ startMinutes: 8 * 60, endMinutes: 13 * 60 }]);
  expect(availability.periods[0]).toEqual([]);

  let workHours = availability.toWorkHours();
  expect(workHours.timezone).toBe("Europe/Berlin");
  expect(workHours.days.map(day => day.isWorkDay)).toEqual([false, true, true, true, true, true, false]);
  expect(workHours.days[1].startMinutes).toBe(9 * 60);
  expect(workHours.days[1].endMinutes).toBe(17 * 60);
  expect(workHours.days[5].endMinutes).toBe(13 * 60);
});

test("CalDAV: Keep the lunch break of the days that the user didn't change", () => {
  let previous = CalDAVAvailability.fromICal(kAvailability);
  let workHours = previous.toWorkHours();
  workHours.days[2].endMinutes = 18 * 60; // Tuesday
  workHours.days[6].isWorkDay = true; // Saturday

  let availability = CalDAVAvailability.fromWorkHours(workHours, previous);

  expect(availability.periods[1].length).toBe(2);
  expect(availability.periods[2]).toEqual([{ startMinutes: 9 * 60, endMinutes: 18 * 60 }]);
  expect(availability.periods[6]).toEqual([{ startMinutes: 8 * 60, endMinutes: 17 * 60 }]);
});

test("CalDAV: Write work hours as VAVAILABILITY and read them back", () => {
  let workHours = new WorkHours();
  workHours.timezone = "America/Chicago";
  workHours.days[5].endMinutes = 12 * 60;
  workHours.days[3].endMinutes = 24 * 60;

  let ical = CalDAVAvailability.fromWorkHours(workHours, null).toICal();

  expect(ical).toContain("BEGIN:VTIMEZONE\r\nTZID:America/Chicago\r\n");
  expect(ical).toContain("RRULE:FREQ=WEEKLY;BYDAY=MO,TU,TH\r\n");
  expect(ical).toContain("DTSTART;TZID=America/Chicago:20240108T080000\r\n");
  expect(ical).toMatch(/BEGIN:VAVAILABILITY\r\nUID:.+\r\nDTSTAMP:\d{8}T\d{6}Z\r\n/);
  let readBack = CalDAVAvailability.fromICal(ical).toWorkHours();
  expect(readBack.equals(workHours)).toBe(true);
});

test("CalDAV: Work hours in UTC", () => {
  let workHours = new WorkHours();
  workHours.timezone = "UTC";
  let ical = CalDAVAvailability.fromWorkHours(workHours, null).toICal();
  expect(ical).not.toContain("VTIMEZONE");
  expect(ical).toContain("DTSTART:20240108T080000Z\r\n");
  expect(CalDAVAvailability.fromICal(ical).toWorkHours().equals(workHours)).toBe(true);
});

const kCalendarURL = "https://dav.example.com/calendars/alice/work/";

/** A fake CalDAV server, which has `serverICal` in the scheduling inbox */
function newTestCalendar(serverICal: string | null, owner = "/principals/alice/") {
  let calendar = new CalDAVCalendar();
  calendar.calendarURL = kCalendarURL;
  calendar.authMethod = AuthMethod.Password;
  calendar.password = "test";
  let server = { ical: serverICal, proppatchStatus: 207, requests: [] as any[] };
  // `login()` returns early when we already have a client
  calendar.client = {
    propfind: async (params: any) => {
      server.requests.push({ method: "PROPFIND", ...params });
      if (params.url == kCalendarURL) {
        return [{ ok: true, props: { currentUserPrincipal: { href: "/principals/alice/" }, owner: { href: owner } } }];
      }
      if (params.url == "https://dav.example.com/principals/alice/") {
        return [{ ok: true, props: { scheduleInboxURL: { href: "/calendars/alice/inbox/" } } }];
      }
      expect(params.url).toBe("https://dav.example.com/calendars/alice/inbox/");
      return [{ ok: true, props: server.ical ? { calendarAvailability: server.ical } : {} }];
    },
    davRequest: async (params: any) => {
      server.requests.push(params);
      if (server.proppatchStatus != 207) {
        return [{ ok: false, status: server.proppatchStatus }];
      }
      server.ical = params.init.body.propertyupdate.set.prop["c:calendar-availability"]._cdata;
      return [{ ok: true, status: 207, props: { calendarAvailability: {} } }];
    },
  } as any;
  return { calendar, server };
}

test("CalDAV: Read my work hours from the scheduling inbox", async () => {
  let { calendar } = newTestCalendar(kAvailability);

  await calendar.readWorkHoursFromServer();

  expect(calendar.canSaveWorkHoursOnServer).toBe(true);
  expect(calendar.canSaveWorkHoursPerDayOnServer).toBe(true);
  expect(calendar.isOtherPersonsCalendar).toBe(false);
  expect(calendar.workHours.timezone).toBe("Europe/Berlin");
  expect(calendar.workHours.days[5].endMinutes).toBe(13 * 60);
});

test("CalDAV: Save my work hours in the scheduling inbox", async () => {
  let { calendar, server } = newTestCalendar(kAvailability);
  await calendar.readWorkHoursFromServer();
  calendar.workHours.days[4].isWorkDay = false; // Thursday

  await calendar.saveWorkHours();

  let proppatch = server.requests.at(-1);
  expect(proppatch.url).toBe("https://dav.example.com/calendars/alice/inbox/");
  expect(proppatch.init.method).toBe("PROPPATCH");
  expect(proppatch.init.body.propertyupdate._attributes["xmlns:c"]).toBe("urn:ietf:params:xml:ns:caldav");
  let saved = CalDAVAvailability.fromICal(server.ical);
  expect(saved.periods[4]).toEqual([]);
  expect(saved.periods[1].length).toBe(2); // lunch break kept
});

test("CalDAV: The server doesn't store the work hours", async () => {
  let { calendar, server } = newTestCalendar(null);
  await calendar.readWorkHoursFromServer();
  expect(calendar.workHours.equals(new WorkHours())).toBe(true);
  server.proppatchStatus = 403;
  calendar.workHours.days[1].startMinutes = 7 * 60;

  await calendar.saveWorkHours();

  expect(calendar.canSaveWorkHoursOnServer).toBe(false);
  expect(calendar.workHours.days[1].startMinutes).toBe(7 * 60);
});

test("CalDAV: No work hours for the calendar of another person", async () => {
  let { calendar } = newTestCalendar(kAvailability, "/principals/bob/");

  await calendar.readWorkHoursFromServer();

  expect(calendar.isOtherPersonsCalendar).toBe(true);
  expect(calendar.canSaveWorkHoursOnServer).toBe(false);
  expect(calendar.workHours).toBeNull();
});

test("CalDAV: Save work hours before the first sync", async () => {
  let { calendar, server } = newTestCalendar(null);
  calendar.workHours.days[0].isWorkDay = true;

  await calendar.saveWorkHours();

  expect(CalDAVAvailability.fromICal(server.ical).periods[0]).toEqual([{ startMinutes: 8 * 60, endMinutes: 17 * 60 }]);
});
