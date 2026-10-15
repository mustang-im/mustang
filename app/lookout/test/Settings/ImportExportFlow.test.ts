// @vitest-environment happy-dom
import { ImportExportFlow } from "../../Settings/ImportExport/ImportExportFlow";
import { Calendar } from "../../../logic/Calendar/Calendar";
import { Addressbook } from "../../../logic/Contacts/Addressbook";
import { expect, test } from "vitest";

test("Export goes from the action to the file type to the folder", () => {
  let flow = new ImportExportFlow();
  expect(flow.step).toBe("action");
  expect(flow.isFirstStep).toBe(true);
  flow.next();
  expect(flow.step).toBe("file-type");
  flow.fileType = "vcard";
  flow.next();
  expect(flow.step).toBe("folder");
  expect(flow.isLastStep).toBe(true);
  expect(flow.worksOnCalendars).toBe(false);
  expect(flow.canGoNext).toBe(false);
  flow.folder = new Addressbook();
  expect(flow.canGoNext).toBe(true);
});

test("Import needs a file before it can go on", () => {
  let flow = new ImportExportFlow();
  flow.action = "import-ical";
  flow.next();
  expect(flow.step).toBe("file");
  expect(flow.canGoNext).toBe(false);
  flow.file = new File(["BEGIN:VCALENDAR"], "events.ics");
  expect(flow.canGoNext).toBe(true);
  flow.next();
  expect(flow.step).toBe("folder");
  expect(flow.worksOnCalendars).toBe(true);
  flow.back();
  expect(flow.step).toBe("file");
});

test("A preselected calendar is kept for calendar actions and dropped for contacts", () => {
  let calendar = new Calendar();
  let flow = new ImportExportFlow(calendar);
  expect(flow.fileType).toBe("ical");
  flow.action = "import-vcard";
  flow.next();
  flow.file = new File(["BEGIN:VCARD"], "people.vcf");
  flow.next();
  expect(flow.folder).toBe(null);

  let exportFlow = new ImportExportFlow(calendar);
  exportFlow.next();
  exportFlow.next();
  expect(exportFlow.folder).toBe(calendar);
  expect(exportFlow.canGoNext).toBe(true);
});
