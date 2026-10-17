// @vitest-environment happy-dom
import { ExchangeWorkHours } from "../../../../logic/Calendar/EWS/ExchangeWorkHours";
import { WorkHours } from "../../../../logic/Calendar/WorkHours";
import { utcOffset } from "../../../../logic/Calendar/ICal/VTimezone";
import { expect, test } from "vitest";

/** As Exchange writes the user configuration `WorkHours` in the calendar folder */
const kPacificXML = `<?xml version="1.0"?>
<Root xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns="WorkingHours.xsd">
  <WorkHoursVersion1>
    <TimeZone>
      <Bias>480</Bias>
      <Standard>
        <Bias>0</Bias>
        <ChangeDate><Time>02:00:00</Time><Date>00/11/01</Date><DayOfWeek>0</DayOfWeek></ChangeDate>
      </Standard>
      <DaylightSavings>
        <Bias>-60</Bias>
        <ChangeDate><Time>02:00:00</Time><Date>00/03/02</Date><DayOfWeek>0</DayOfWeek></ChangeDate>
      </DaylightSavings>
      <Name>Pacific Standard Time</Name>
    </TimeZone>
    <TimeSlot>
      <Start>08:30:00</Start>
      <End>17:00:00</End>
    </TimeSlot>
    <WorkDays>Monday Tuesday Wednesday Thursday Friday</WorkDays>
  </WorkHoursVersion1>
</Root>`;

test("Read the work hours that Exchange stores", () => {
  let exchange = ExchangeWorkHours.fromXML(kPacificXML);
  expect(exchange.timezone).toBe("America/Los_Angeles");
  expect(exchange.workDays).toBe(0b0111110);
  expect(exchange.startMinutes).toBe(8 * 60 + 30);
  expect(exchange.endMinutes).toBe(17 * 60);

  let workHours = exchange.toWorkHours();
  expect(workHours.timezone).toBe("America/Los_Angeles");
  expect(workHours.days.map(day => day.isWorkDay)).toEqual([false, true, true, true, true, true, false]);
  expect(workHours.days[3].startMinutes).toBe(8 * 60 + 30);
  expect(workHours.days[3].endMinutes).toBe(17 * 60);
});

test("Read a time zone without name from its rules", () => {
  let xml = kPacificXML.replace("<Name>Pacific Standard Time</Name>", "");
  let timezone = ExchangeWorkHours.fromXML(xml).timezone;
  for (let month = 0; month < 12; month++) {
    let time = new Date(Date.UTC(2026, month, 15));
    expect(utcOffset(time, timezone)).toBe(utcOffset(time, "America/Los_Angeles"));
  }
});

test("Work days as Exchange names them in groups", () => {
  let xml = kPacificXML.replace("Monday Tuesday Wednesday Thursday Friday", "Weekdays Saturday");
  expect(ExchangeWorkHours.fromXML(xml).workDays).toBe(0b1111110);
  xml = kPacificXML.replace("Monday Tuesday Wednesday Thursday Friday", "None");
  expect(ExchangeWorkHours.fromXML(xml).workDays).toBe(0);
});

test("No work hours in the XML", () => {
  expect(ExchangeWorkHours.fromXML(`<Root xmlns="WorkingHours.xsd"/>`)).toBeNull();
});

test("Different hours per day: Exchange gets the longest day", () => {
  let workHours = new WorkHours();
  workHours.timezone = "Europe/Berlin";
  workHours.days[1].startMinutes = 7 * 60;
  workHours.days[5].endMinutes = 13 * 60;
  workHours.days[3].endMinutes = 18 * 60 + 30;
  workHours.days[4].isWorkDay = false;
  let exchange = ExchangeWorkHours.fromWorkHours(workHours);
  expect(exchange.workDays).toBe(0b0101110);
  expect(exchange.startMinutes).toBe(7 * 60);
  expect(exchange.endMinutes).toBe(18 * 60 + 30);
  expect(exchange.timezone).toBe("Europe/Berlin");

  // When reading it back from the server, we keep our details
  expect(exchange.isSummaryOf(workHours)).toBe(true);
  workHours.days[2].isWorkDay = false;
  expect(exchange.isSummaryOf(workHours)).toBe(false);
});

test("Write the work hours for Exchange, keeping its time zone", () => {
  let exchange = ExchangeWorkHours.fromXML(kPacificXML);
  exchange.startMinutes = 9 * 60;
  exchange.endMinutes = 24 * 60;
  exchange.workDays = 0b1000001;
  let xml = exchange.toXML(kPacificXML);
  let document = new DOMParser().parseFromString(xml, "text/xml");
  expect(document.documentElement.localName).toBe("Root");
  expect(document.documentElement.namespaceURI).toBe("WorkingHours.xsd");
  expect(document.getElementsByTagName("Start")[0].textContent).toBe("09:00:00");
  // .NET `TimeSpan` of 1 day. "24:00:00" would be invalid.
  expect(document.getElementsByTagName("End")[0].textContent).toBe("1.00:00:00");
  expect(document.getElementsByTagName("WorkDays")[0].textContent).toBe("Sunday Saturday");
  expect(document.getElementsByTagName("Name")[0].textContent).toBe("Pacific Standard Time");
  expect(document.getElementsByTagName("Bias")[0].textContent).toBe("480");

  let readBack = ExchangeWorkHours.fromXML(xml);
  expect(readBack).toEqual(exchange);
});

test("Write the work hours for Exchange in a new time zone", () => {
  let workHours = new WorkHours();
  workHours.timezone = "Europe/Berlin";
  let xml = ExchangeWorkHours.fromWorkHours(workHours).toXML(kPacificXML);
  let document = new DOMParser().parseFromString(xml, "text/xml");
  let timezone = document.getElementsByTagName("TimeZone")[0];
  expect(timezone.getElementsByTagName("Name")[0].textContent).toBe("W. Europe Standard Time");
  expect(timezone.getElementsByTagName("Bias")[0].textContent).toBe("-60");
  let standard = timezone.getElementsByTagName("Standard")[0];
  expect(standard.getElementsByTagName("Time")[0].textContent).toBe("03:00:00");
  expect(standard.getElementsByTagName("Date")[0].textContent).toBe("00/10/05");
  expect(standard.getElementsByTagName("DayOfWeek")[0].textContent).toBe("0");
  let daylight = timezone.getElementsByTagName("DaylightSavings")[0];
  expect(daylight.getElementsByTagName("Bias")[0].textContent).toBe("-60");
  expect(daylight.getElementsByTagName("Date")[0].textContent).toBe("00/03/05");
  expect(document.getElementsByTagName("WorkDays")[0].textContent).toBe("Monday Tuesday Wednesday Thursday Friday");

  let readBack = ExchangeWorkHours.fromXML(xml).toWorkHours();
  expect(readBack.equals(workHours)).toBe(true);
});

test("Write a time zone without daylight saving time", () => {
  let workHours = new WorkHours();
  workHours.timezone = "Asia/Tokyo";
  let xml = ExchangeWorkHours.fromWorkHours(workHours).toXML(null);
  let document = new DOMParser().parseFromString(xml, "text/xml");
  expect(document.getElementsByTagName("Bias")[0].textContent).toBe("-540");
  expect(document.getElementsByTagName("Date")[0].textContent).toBe("00/00/00");
  expect(ExchangeWorkHours.fromXML(xml).timezone).toBe("Asia/Tokyo");
});

test("Work hours of another person, from EWS free/busy", () => {
  // After `XML2JSON()`
  let json = {
    TimeZone: {
      Bias: "-60",
      StandardTime: { Bias: "0", Time: "03:00:00", DayOrder: "5", Month: "10", DayOfWeek: "Sunday" },
      DaylightTime: { Bias: "-60", Time: "02:00:00", DayOrder: "5", Month: "3", DayOfWeek: "Sunday" },
    },
    WorkingPeriodArray: {
      WorkingPeriod: [
        { DayOfWeek: "Monday Tuesday Wednesday Thursday", StartTimeInMinutes: "480", EndTimeInMinutes: "1020" },
        { DayOfWeek: "Friday", StartTimeInMinutes: "480", EndTimeInMinutes: "780" },
      ],
    },
  };
  let periods = ExchangeWorkHours.fromEWSAvailability(json);
  let workHours = ExchangeWorkHours.mergeToWorkHours(periods);
  expect(workHours.days.map(day => day.isWorkDay)).toEqual([false, true, true, true, true, true, false]);
  expect(workHours.days[4].endMinutes).toBe(17 * 60);
  expect(workHours.days[5].endMinutes).toBe(13 * 60);
  for (let month = 0; month < 12; month++) {
    let time = new Date(Date.UTC(2026, month, 15));
    expect(utcOffset(time, workHours.timezone)).toBe(utcOffset(time, "Europe/Berlin"));
  }
  expect(ExchangeWorkHours.fromEWSAvailability({})).toBeNull();
});

test("Work hours of another person, from OWA free/busy", () => {
  let json = { WorkHoursStartTimeInMinutes: 960, WorkHoursEndTimeInMinutes: 1500, WorkDays: 62 };
  let workHours = ExchangeWorkHours.fromOWAAvailability(json, "Asia/Tokyo").toWorkHours();
  expect(workHours.timezone).toBe("Asia/Tokyo");
  expect(workHours.days[1].isWorkDay).toBe(true);
  expect(workHours.days[1].startMinutes).toBe(16 * 60);
  // OWA converted the times into our time zone, across midnight
  expect(workHours.days[1].endMinutes).toBe(24 * 60);
  expect(ExchangeWorkHours.fromOWAAvailability(undefined, "UTC")).toBeNull();
});
