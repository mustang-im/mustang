// @vitest-environment happy-dom
import { OptionsNavigation } from "../../Settings/Options/OptionsNavigation";
import { IMAPAccount } from "../../../logic/Mail/IMAP/IMAPAccount";
import { Calendar } from "../../../logic/Calendar/Calendar";
import { Addressbook } from "../../../logic/Contacts/Addressbook";
import { appGlobal } from "../../../logic/app";
import { beforeAll, expect, test } from "vitest";

beforeAll(() => {
  // IMAPAccount needs the backend's connection factory, but these tests never connect
  appGlobal.remoteApp ??= { createIMAPFlowConnection: () => null } as any;
});

function makeIMAPAccount(): IMAPAccount {
  let account = new IMAPAccount();
  account.name = "Work";
  account.hostname = "imap.example.com";
  return account;
}

test("A mail account with its own server has General, Server and Identities pages", () => {
  let account = makeIMAPAccount();
  expect(OptionsNavigation.pagesOf(account).map(page => page.id)).toEqual([ "general", "server", "identities" ]);
  expect(OptionsNavigation.categoryOf(account)).toBe("mail");
});

test("A local calendar has General and Work hours pages", () => {
  let calendar = new Calendar();
  expect(OptionsNavigation.pagesOf(calendar).map(page => page.id)).toEqual([ "general", "work-hours" ]);
  expect(OptionsNavigation.categoryOf(calendar)).toBe("calendar");
  calendar.workHours = null;
  expect(OptionsNavigation.pagesOf(calendar).map(page => page.id)).toEqual([ "general" ]);
});

test("A calendar on a server gets a Server page, unless it's part of another account", () => {
  let calendar = new Calendar();
  calendar.url = "https://dav.example.com/calendars/fred/";
  expect(OptionsNavigation.pagesOf(calendar).map(page => page.id)).toContain("server");
  calendar.mainAccount = makeIMAPAccount();
  expect(OptionsNavigation.pagesOf(calendar).map(page => page.id)).not.toContain("server");
});

test("Address books belong to People", () => {
  expect(OptionsNavigation.categoryOf(new Addressbook())).toBe("people");
});

test("Change account opens the account at the asked page, if it has it", () => {
  let account = makeIMAPAccount();
  let selection = OptionsNavigation.selectionFor({ kind: "change-account", account, page: "server" });
  expect(selection).toEqual({ category: "mail", account, accountPage: "server" });
  let calendar = new Calendar();
  selection = OptionsNavigation.selectionFor({ kind: "change-account", account: calendar, page: "server" });
  expect(selection).toEqual({ category: "calendar", account: calendar, accountPage: "general" });
});

test("Options opens the category without an account", () => {
  expect(OptionsNavigation.selectionFor({ kind: "options", category: "calendar" }))
    .toEqual({ category: "calendar", account: null, accountPage: "general" });
});

test("Account Settings opens the given account, or the first one of its kind", () => {
  let account = makeIMAPAccount();
  expect(OptionsNavigation.selectionFor({ kind: "account-settings", tab: "email", account }))
    .toEqual({ category: "mail", account, accountPage: "general" });
  let selection = OptionsNavigation.selectionFor({ kind: "account-settings", tab: "calendars" });
  expect(selection.category).toBe("calendar");
  expect(selection.account).toBe(appGlobal.calendars.first ?? null);
});
