// @vitest-environment happy-dom
// app first, to resolve the import cycle around Abstract/Account.ts
import { appGlobal } from "../../../logic/app";
import { NewFolderAccountFlow } from "../../Settings/Accounts/NewFolderAccountFlow";
import { expect, test } from "vitest";

test("Create New Folder makes a calendar on this computer", async () => {
  let flow = new NewFolderAccountFlow("calendar", true);
  expect(flow.step).toBe("settings");
  expect(flow.config.protocol).toBe("calendar-local");
  expect(flow.canContinue).toBe(false);
  flow.config.name = "  Holidays ";
  expect(flow.canContinue).toBe(true);
  // No database in tests
  flow.config.save = async () => undefined;
  await flow.next();
  expect(flow.isDone).toBe(true);
  expect(flow.config.name).toBe("Holidays");
  expect(appGlobal.calendars.contains(flow.config as any)).toBe(true);
});

test("A CardDAV address book needs a name, server and user name", () => {
  let flow = new NewFolderAccountFlow("addressbook");
  expect(flow.step).toBe("type");
  flow.isLocal = false;
  flow.chooseType(flow.isLocal);
  expect(flow.config.protocol).toBe("carddav");
  flow.config.name = "Work";
  flow.config.url = "https://dav.example.com/contacts/";
  expect(flow.canContinue).toBe(false);
  flow.config.username = "fred";
  expect(flow.canContinue).toBe(true);
  flow.back();
  expect(flow.step).toBe("type");
});

test("Choosing the server's calendars toggles them", () => {
  let flow = new NewFolderAccountFlow("calendar");
  let personal = { url: "https://dav.example.com/1/", displayName: "Personal" };
  let team = { url: "https://dav.example.com/2/", displayName: "Team" };
  flow.available = [personal, team];
  flow.chosen = [personal];
  flow.step = "choose";
  flow.toggle(team, true);
  expect(flow.chosen).toEqual([personal, team]);
  flow.toggle(personal, false);
  flow.toggle(team, false);
  expect(flow.canContinue).toBe(false);
});
