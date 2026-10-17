// @vitest-environment happy-dom
import { appGlobal } from "../../../../logic/app.ts"; // defeats circular import
import { EWSAccount } from "../../../../logic/Mail/EWS/EWSAccount";
import { EWSCalendar } from "../../../../logic/Calendar/EWS/EWSCalendar";
import { AuthMethod } from "../../../../logic/Abstract/Account";
import { utcOffset } from "../../../../logic/Calendar/ICal/VTimezone";
import { expect, test } from "vitest";

const kWorkHoursXML = `<?xml version="1.0"?>` +
  `<Root xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns="WorkingHours.xsd">` +
  `<WorkHoursVersion1><TimeZone><Bias>480</Bias>` +
  `<Standard><Bias>0</Bias><ChangeDate><Time>02:00:00</Time><Date>00/11/01</Date><DayOfWeek>0</DayOfWeek></ChangeDate></Standard>` +
  `<DaylightSavings><Bias>-60</Bias><ChangeDate><Time>02:00:00</Time><Date>00/03/02</Date><DayOfWeek>0</DayOfWeek></ChangeDate></DaylightSavings>` +
  `<Name>Pacific Standard Time</Name></TimeZone>` +
  `<TimeSlot><Start>09:00:00</Start><End>18:00:00</End></TimeSlot>` +
  `<WorkDays>Monday Tuesday Wednesday Thursday Friday</WorkDays>` +
  `</WorkHoursVersion1></Root>`;

function base64(text: string): string {
  return Buffer.from(text, "utf-8").toString("base64");
}

function fromBase64(base64: string): string {
  return Buffer.from(base64, "base64").toString("utf-8");
}

/** Exchange prefixes the elements with `m:` and `t:`, but happy-dom's
 * `querySelector()` does not find prefixed elements, unlike Chromium,
 * so these responses use default namespaces. */
function soap(body: string): string {
  return `<?xml version="1.0" encoding="utf-8"?>
    <Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/"><Body>${body}</Body></Envelope>`;
}

function getUserConfigurationResponse(xml: string | null): string {
  if (!xml) {
    return soap(`<GetUserConfigurationResponse xmlns="http://schemas.microsoft.com/exchange/services/2006/messages">
      <ResponseMessages>
        <GetUserConfigurationResponseMessage ResponseClass="Error">
          <MessageText>The specified object was not found in the store.</MessageText>
          <ResponseCode>ErrorItemNotFound</ResponseCode>
        </GetUserConfigurationResponseMessage>
      </ResponseMessages>
    </GetUserConfigurationResponse>`);
  }
  return soap(`<GetUserConfigurationResponse xmlns="http://schemas.microsoft.com/exchange/services/2006/messages">
    <ResponseMessages>
      <GetUserConfigurationResponseMessage ResponseClass="Success">
        <ResponseCode>NoError</ResponseCode>
        <UserConfiguration>
          <UserConfigurationName Name="WorkHours" xmlns="http://schemas.microsoft.com/exchange/services/2006/types">
            <FolderId Id="calendar-folder-id" ChangeKey="AQAAAA=="/>
          </UserConfigurationName>
          <XmlData xmlns="http://schemas.microsoft.com/exchange/services/2006/types">${base64(xml)}</XmlData>
        </UserConfiguration>
      </GetUserConfigurationResponseMessage>
    </ResponseMessages>
  </GetUserConfigurationResponse>`);
}

function saveUserConfigurationResponse(action: string): string {
  return soap(`<${action}Response xmlns="http://schemas.microsoft.com/exchange/services/2006/messages">
    <ResponseMessages>
      <${action}ResponseMessage ResponseClass="Success">
        <ResponseCode>NoError</ResponseCode>
      </${action}ResponseMessage>
    </ResponseMessages>
  </${action}Response>`);
}

const kAvailabilityResponse = soap(`<GetUserAvailabilityResponse xmlns="http://schemas.microsoft.com/exchange/services/2006/messages">
  <FreeBusyResponseArray>
    <FreeBusyResponse>
      <ResponseMessage ResponseClass="Success">
        <ResponseCode>NoError</ResponseCode>
      </ResponseMessage>
      <FreeBusyView>
        <FreeBusyViewType xmlns="http://schemas.microsoft.com/exchange/services/2006/types">FreeBusy</FreeBusyViewType>
        <WorkingHours xmlns="http://schemas.microsoft.com/exchange/services/2006/types">
          <TimeZone>
            <Bias>-60</Bias>
            <StandardTime><Bias>0</Bias><Time>03:00:00</Time><DayOrder>5</DayOrder><Month>10</Month><DayOfWeek>Sunday</DayOfWeek></StandardTime>
            <DaylightTime><Bias>-60</Bias><Time>02:00:00</Time><DayOrder>5</DayOrder><Month>3</Month><DayOfWeek>Sunday</DayOfWeek></DaylightTime>
          </TimeZone>
          <WorkingPeriodArray>
            <WorkingPeriod>
              <DayOfWeek>Monday Tuesday Wednesday Thursday</DayOfWeek>
              <StartTimeInMinutes>420</StartTimeInMinutes>
              <EndTimeInMinutes>960</EndTimeInMinutes>
            </WorkingPeriod>
          </WorkingPeriodArray>
        </WorkingHours>
      </FreeBusyView>
    </FreeBusyResponse>
  </FreeBusyResponseArray>
</GetUserAvailabilityResponse>`);

const kNoAvailabilityResponse = soap(`<GetUserAvailabilityResponse xmlns="http://schemas.microsoft.com/exchange/services/2006/messages">
  <FreeBusyResponseArray>
    <FreeBusyResponse>
      <ResponseMessage ResponseClass="Error">
        <MessageText>Microsoft.Exchange.InfoWorker.Common.Availability.NoFreeBusyAccessException</MessageText>
        <ResponseCode>ErrorNoFreeBusyAccess</ResponseCode>
      </ResponseMessage>
    </FreeBusyResponse>
  </FreeBusyResponseArray>
</GetUserAvailabilityResponse>`);

/** A fake Exchange server, which has `serverXML` as work hours */
function newTestCalendar(serverXML: string | null, availabilityResponse = kAvailabilityResponse) {
  let account = new EWSAccount();
  account.name = "Alice";
  account.username = "alice@example.com";
  account.emailAddress = account.username;
  account.url = "https://exchange.example.com/EWS/Exchange.asmx";
  account.authMethod = AuthMethod.Unknown; // no credentials needed
  let calendar = new EWSCalendar();
  calendar.initFromMainAccount(account);
  let requests: Document[] = [];
  let server = { xml: serverXML };
  globalThis.fetch = (async (_url: string, options: any) => {
    let request = new DOMParser().parseFromString(options.body, "text/xml");
    requests.push(request);
    let responseText: string;
    if (request.getElementsByTagName("m:GetUserConfiguration").length) {
      responseText = getUserConfigurationResponse(server.xml);
    } else if (request.getElementsByTagName("m:GetUserAvailabilityRequest").length) {
      responseText = availabilityResponse;
    } else {
      let action = request.getElementsByTagName("m:UpdateUserConfiguration").length
        ? "UpdateUserConfiguration"
        : "CreateUserConfiguration";
      server.xml = fromBase64(request.getElementsByTagName("t:XmlData")[0].textContent);
      responseText = saveUserConfigurationResponse(action);
    }
    return { status: 200, text: async () => responseText };
  }) as any;
  return { account, calendar, requests, server };
}

test("EWS: Read my work hours from Exchange", async () => {
  let { calendar, requests } = newTestCalendar(kWorkHoursXML);
  expect(calendar.isOtherPersonsCalendar).toBe(false);
  expect(calendar.canSaveWorkHoursOnServer).toBe(true);
  expect(calendar.canSaveWorkHoursPerDayOnServer).toBe(false);

  await calendar.readWorkHoursFromServer();

  expect(calendar.workHours.timezone).toBe("America/Los_Angeles");
  expect(calendar.workHours.days.map(day => day.isWorkDay)).toEqual([false, true, true, true, true, true, false]);
  expect(calendar.workHours.days[2].startMinutes).toBe(9 * 60);
  expect(calendar.workHours.days[2].endMinutes).toBe(18 * 60);
  let name = requests[0].getElementsByTagName("m:UserConfigurationName")[0];
  expect(name.getAttribute("Name")).toBe("WorkHours");
  expect(name.getElementsByTagName("t:DistinguishedFolderId")[0].getAttribute("Id")).toBe("calendar");
});

test("EWS: Keep my work hours per day, which Exchange has only as summary", async () => {
  let { calendar } = newTestCalendar(kWorkHoursXML);
  await calendar.readWorkHoursFromServer();
  calendar.workHours.days[5].endMinutes = 13 * 60; // Friday

  await calendar.readWorkHoursFromServer();

  expect(calendar.workHours.days[5].endMinutes).toBe(13 * 60);
});

test("EWS: Save my work hours on Exchange", async () => {
  let { calendar, requests, server } = newTestCalendar(kWorkHoursXML);
  await calendar.readWorkHoursFromServer();
  calendar.workHours.days[1].startMinutes = 7 * 60;
  calendar.workHours.days[6].isWorkDay = true;
  requests.length = 0;

  await calendar.saveWorkHours();

  expect(requests.length).toBe(2);
  let update = requests[1].getElementsByTagName("m:UpdateUserConfiguration")[0];
  expect(update).toBeDefined();
  let name = update.getElementsByTagName("t:UserConfigurationName")[0];
  expect(name.getAttribute("Name")).toBe("WorkHours");
  expect(name.getElementsByTagName("t:DistinguishedFolderId")[0].getAttribute("Id")).toBe("calendar");
  let xml = new DOMParser().parseFromString(server.xml, "text/xml");
  expect(xml.getElementsByTagName("Start")[0].textContent).toBe("07:00:00");
  expect(xml.getElementsByTagName("End")[0].textContent).toBe("18:00:00");
  expect(xml.getElementsByTagName("WorkDays")[0].textContent).toBe("Monday Tuesday Wednesday Thursday Friday Saturday");
  expect(xml.getElementsByTagName("Name")[0].textContent).toBe("Pacific Standard Time");
});

test("EWS: Create the work hours on Exchange, if it has none", async () => {
  let { calendar, requests, server } = newTestCalendar(null);
  await calendar.readWorkHoursFromServer();
  calendar.workHours.timezone = "Europe/Berlin";

  await calendar.saveWorkHours();

  expect(requests.at(-1).getElementsByTagName("m:CreateUserConfiguration").length).toBe(1);
  let xml = new DOMParser().parseFromString(server.xml, "text/xml");
  expect(xml.getElementsByTagName("Name")[0].textContent).toBe("W. Europe Standard Time");
  expect(xml.getElementsByTagName("Start")[0].textContent).toBe("08:00:00");
});

test("EWS: Work hours of another person, from free/busy", async () => {
  let { calendar, requests } = newTestCalendar(kWorkHoursXML);
  calendar.username = "bob@example.com";
  expect(calendar.isOtherPersonsCalendar).toBe(true);
  expect(calendar.canSaveWorkHoursOnServer).toBe(false);

  await calendar.readWorkHoursFromServer();

  expect(requests.length).toBe(1);
  let mailbox = requests[0].getElementsByTagName("t:MailboxData")[0];
  expect(mailbox.getElementsByTagName("t:Address")[0].textContent).toBe("bob@example.com");
  expect(calendar.workHours.days.map(day => day.isWorkDay)).toEqual([false, true, true, true, true, false, false]);
  expect(calendar.workHours.days[1].startMinutes).toBe(7 * 60);
  expect(calendar.workHours.days[1].endMinutes).toBe(16 * 60);
  let summer = new Date("2026-07-01T12:00:00Z");
  expect(utcOffset(summer, calendar.workHours.timezone)).toBe(120);
});

test("EWS: No work hours, if another person doesn't share free/busy", async () => {
  let { calendar } = newTestCalendar(kWorkHoursXML, kNoAvailabilityResponse);
  calendar.username = "bob@example.com";

  await calendar.readWorkHoursFromServer();

  expect(calendar.workHours).toBeNull();
});
