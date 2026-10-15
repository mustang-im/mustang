import { CalendarGroups } from "../../Calendar/FolderPane/CalendarGroups";
import type { Calendar } from "../../../logic/Calendar/Calendar";
import { expect, test } from "vitest";

// CalendarGroups needs only `username` and `mainAccount`, so plain objects stand in for accounts
function account(username: string | null, mainAccount: any = null): any {
  return { username, mainAccount };
}

function calendar(name: string, username: string | null, mainAccount: any = null): Calendar {
  return { name, username, mainAccount } as Calendar;
}

test("Calendars of my own accounts are mine", () => {
  let mine = account("me@example.com");
  expect(CalendarGroups.isShared(calendar("Calendar", "me@example.com", mine))).toBe(false);
  expect(CalendarGroups.isShared(calendar("Birthdays", "ME@example.com", mine))).toBe(false);
});

test("Local calendars and calendars without user name are mine", () => {
  expect(CalendarGroups.isShared(calendar("Local", null))).toBe(false);
  expect(CalendarGroups.isShared(calendar("CalDAV", "me", account(null)))).toBe(false);
});

test("Calendars of colleagues, opened via my account, are shared", () => {
  let mine = account("me@example.com");
  expect(CalendarGroups.isShared(calendar("Alex Calendar", "alex@example.com", mine))).toBe(true);
});

test("Calendars of shared accounts below my account are shared", () => {
  let mine = account("me@example.com");
  let sharedMailbox = account("team@example.com", mine);
  expect(CalendarGroups.isShared(calendar("Team Calendar", "team@example.com", sharedMailbox))).toBe(true);
});

test("Groups: My Calendars first, Shared Calendars only when there are some", () => {
  let mine = account("me@example.com");
  let own = calendar("Calendar", "me@example.com", mine);
  let shared = calendar("Alex", "alex@example.com", mine);
  let groups = new CalendarGroups([shared, own]).groups;
  expect(groups.map(group => [group.id, group.calendars.map(cal => cal.name)])).toEqual([
    ["mine", ["Calendar"]],
    ["shared", ["Alex"]],
  ]);
  expect(new CalendarGroups([own]).groups.map(group => group.id)).toEqual(["mine"]);
  expect(new CalendarGroups([]).groups.map(group => group.id)).toEqual(["mine"]);
});
