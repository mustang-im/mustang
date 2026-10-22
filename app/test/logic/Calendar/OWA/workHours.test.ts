// @vitest-environment happy-dom
import { appGlobal } from "../../../../logic/app"; // defeats circular import
import { OWACalendar } from "../../../../logic/Calendar/OWA/OWACalendar";
import { OWAAccount } from "../../../../logic/Mail/OWA/OWAAccount";
import { OWAError } from "../../../../logic/Mail/OWA/OWAError";
import { IANAToWindowsTimezone } from "../../../../logic/Calendar/ICal/WindowsTimezone";
import { myTimezone } from "../../../../logic/util/date";
import { expect, test } from "vitest";

const kWorkHoursXML = `<?xml version="1.0"?>` +
  `<Root xmlns="WorkingHours.xsd"><WorkHoursVersion1><TimeZone><Bias>-60</Bias>` +
  `<Standard><Bias>0</Bias><ChangeDate><Time>03:00:00</Time><Date>00/10/05</Date><DayOfWeek>0</DayOfWeek></ChangeDate></Standard>` +
  `<DaylightSavings><Bias>-60</Bias><ChangeDate><Time>02:00:00</Time><Date>00/03/05</Date><DayOfWeek>0</DayOfWeek></ChangeDate></DaylightSavings>` +
  `<Name>W. Europe Standard Time</Name></TimeZone>` +
  `<TimeSlot><Start>08:00:00</Start><End>16:30:00</End></TimeSlot>` +
  `<WorkDays>Monday Tuesday Wednesday Thursday</WorkDays>` +
  `</WorkHoursVersion1></Root>`;

function base64(text: string): string {
  return Buffer.from(text, "utf-8").toString("base64");
}

function fromBase64(base64: string): string {
  return Buffer.from(base64, "base64").toString("utf-8");
}

/** A fake OWA server, which has `serverXML` as work hours.
 * The responses are what `callOWA()` returns after unwrapping. */
function newTestCalendar(serverXML: string | null) {
  appGlobal.remoteApp ??= { OWA: {} } as any;
  let account = new OWAAccount();
  account.name = "Alice";
  account.username = "alice@example.com";
  let requests: any[] = [];
  let server = { xml: serverXML };
  account.callOWA = async (request: any) => {
    requests.push(JSON.parse(JSON.stringify(request)));
    switch (request.action) {
    case "GetUserConfiguration":
      if (!server.xml) {
        throw new OWAError({ json: { Body: { ResponseMessages: { Items: [{
          ResponseClass: "Error",
          ResponseCode: "ErrorItemNotFound",
          MessageText: "The specified object was not found in the store.",
        }] } } } });
      }
      return {
        ResponseClass: "Success",
        UserConfiguration: {
          UserConfigurationName: { Name: "WorkHours" },
          XmlData: base64(server.xml),
        },
      };
    case "UpdateUserConfiguration":
    case "CreateUserConfiguration":
      server.xml = fromBase64(request.Body.UserConfiguration.XmlData);
      return { ResponseClass: "Success" };
    case "GetUserAvailabilityInternal":
      return {
        Responses: [{
          ResponseMessage: { ResponseClass: "Success" },
          CalendarView: {
            FreeBusyViewType: "FreeBusy",
            Items: [],
            WorkingHours: {
              WorkHoursStartTimeInMinutes: 540,
              WorkHoursEndTimeInMinutes: 1080,
              WorkDays: 0b0011110,
            },
          },
        }],
      };
    }
    throw new Error("Unexpected request " + request.action);
  };
  let calendar = new OWACalendar();
  calendar.initFromMainAccount(account);
  return { account, calendar, requests, server };
}

test("OWA: Read my work hours from Exchange", async () => {
  let { calendar, requests } = newTestCalendar(kWorkHoursXML);

  await calendar.readWorkHoursFromServer();

  expect(calendar.workHours.timezone).toBe("Europe/Berlin");
  expect(calendar.workHours.days.map(day => day.isWorkDay)).toEqual([false, true, true, true, true, false, false]);
  expect(calendar.workHours.days[1].endMinutes).toBe(16 * 60 + 30);
  expect(requests[0].__type).toBe("GetUserConfigurationJsonRequest:#Exchange");
  expect(requests[0].Body.__type).toBe("GetUserConfigurationRequest:#Exchange");
  expect(requests[0].Body.UserConfigurationName).toEqual({
    __type: "UserConfigurationNameType:#Exchange",
    Name: "WorkHours",
    BaseFolderId: {
      __type: "DistinguishedFolderId:#Exchange",
      Id: "calendar",
    },
  });
  expect(requests[0].Body.UserConfigurationProperties).toBe("XmlData");
});

test("OWA: Save my work hours on Exchange", async () => {
  let { calendar, requests, server } = newTestCalendar(kWorkHoursXML);
  await calendar.readWorkHoursFromServer();
  calendar.workHours.days[5].isWorkDay = true;

  await calendar.saveWorkHours();

  let update = requests.at(-1);
  expect(update.__type).toBe("UpdateUserConfigurationJsonRequest:#Exchange");
  expect(update.Body.__type).toBe("UpdateUserConfigurationRequest:#Exchange");
  expect(update.Body.UserConfiguration.__type).toBe("ServiceUserConfiguration:#Exchange");
  expect(update.Body.UserConfiguration.UserConfigurationName.Name).toBe("WorkHours");
  let xml = new DOMParser().parseFromString(server.xml, "text/xml");
  expect(xml.getElementsByTagName("WorkDays")[0].textContent).toBe("Monday Tuesday Wednesday Thursday Friday");
  expect(xml.getElementsByTagName("End")[0].textContent).toBe("16:30:00");
});

test("OWA: Create the work hours on Exchange, if it has none", async () => {
  let { calendar, requests, server } = newTestCalendar(null);
  await calendar.readWorkHoursFromServer();
  expect(calendar.workHours.days[1].startMinutes).toBe(8 * 60); // our default

  await calendar.saveWorkHours();

  expect(requests.at(-1).__type).toBe("CreateUserConfigurationJsonRequest:#Exchange");
  expect(server.xml).toContain("<Start>08:00:00</Start>");
});

test("OWA: Work hours of another person, from free/busy", async () => {
  let { calendar, requests } = newTestCalendar(kWorkHoursXML);
  calendar.username = "bob@example.com";
  expect(calendar.isOtherPersonsCalendar).toBe(true);

  await calendar.readWorkHoursFromServer();

  let request = requests[0].request;
  expect(request.Body.MailboxDataArray[0].Email.Address).toBe("bob@example.com");
  // OWA converts the work hours into this time zone
  expect(request.Header.TimeZoneContext.TimeZoneDefinition.Id).toBe(IANAToWindowsTimezone[myTimezone()] ?? "UTC");
  expect(calendar.workHours.days.map(day => day.isWorkDay)).toEqual([false, true, true, true, true, false, false]);
  expect(calendar.workHours.days[1].startMinutes).toBe(9 * 60);
  expect(calendar.workHours.days[1].endMinutes).toBe(18 * 60);
});
