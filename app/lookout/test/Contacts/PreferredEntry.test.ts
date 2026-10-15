// @vitest-environment happy-dom
// app first, to resolve the import cycle around Abstract/Account.ts
import "../../../logic/app";
import { ContactEntry } from "../../../logic/Abstract/Person";
import { PreferredEntry } from "../../Contacts/PreferredEntry";
import { ArrayColl } from "svelte-collections";
import { expect, test } from "vitest";

test("Entry with the lowest preference value wins", () => {
  let entries = new ArrayColl<ContactEntry>([
    new ContactEntry("home@example.com", "home", null, 50),
    new ContactEntry("work@example.com", "work", null, 10),
    new ContactEntry("other@example.com", "other"),
  ]);
  expect(PreferredEntry.of(entries).value).toBe("work@example.com");
  expect(PreferredEntry.valueOf(entries)).toBe("work@example.com");
});

test("Same preference keeps the list order", () => {
  let entries = new ArrayColl<ContactEntry>([
    new ContactEntry("first@example.com", "work"),
    new ContactEntry("second@example.com", "home"),
  ]);
  expect(PreferredEntry.valueOf(entries)).toBe("first@example.com");
});

test("No entries", () => {
  let entries = new ArrayColl<ContactEntry>();
  expect(PreferredEntry.of(entries)).toBeNull();
  expect(PreferredEntry.valueOf(entries)).toBeNull();
});

test("Empty value counts as no value", () => {
  let entries = new ArrayColl<ContactEntry>([ new ContactEntry("", "work") ]);
  expect(PreferredEntry.of(entries)).not.toBeNull();
  expect(PreferredEntry.valueOf(entries)).toBeNull();
});
