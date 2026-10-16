// app first, to resolve the import cycle around Abstract/Account.ts
import "../../../logic/app";
import { Person, ContactEntry } from "../../../logic/Abstract/Person";
import { Group } from "../../../logic/Abstract/Group";
import { ContactColumn, ContactColumns, ContactView } from "../../Contacts/Views/ContactColumns";
import { expect, test } from "vitest";

function person(name: string, company: string | null, phones: ContactEntry[] = []): Person {
  let result = new Person();
  result.name = name;
  result.company = company;
  result.phoneNumbers.addAll(phones);
  return result;
}

test("Phone view shows Outlook's phone columns", () => {
  expect(ContactColumns.columnsOf(ContactView.Phone)).toEqual([
    ContactColumn.FullName, ContactColumn.Company, ContactColumn.BusinessPhone, ContactColumn.BusinessFax,
    ContactColumn.HomePhone, ContactColumn.MobilePhone,
  ]);
  expect(ContactColumns.columnsOf(ContactView.List)).toContain(ContactColumn.EMail);
});

test("Phone columns take the numbers by purpose, faxes separately", () => {
  let anna = person("Anna", "ACME", [
    new ContactEntry("111", "work", "tel"),
    new ContactEntry("222", "work", "fax"),
    new ContactEntry("333", "mobile", "tel"),
  ]);
  expect(ContactColumns.value(ContactColumn.BusinessPhone, anna)).toBe("111");
  expect(ContactColumns.value(ContactColumn.BusinessFax, anna)).toBe("222");
  expect(ContactColumns.value(ContactColumn.MobilePhone, anna)).toBe("333");
  expect(ContactColumns.value(ContactColumn.HomePhone, anna)).toBe("");
});

test("Groups show only their name and \"Contact group\"", () => {
  let group = new Group();
  group.name = "Board";
  expect(ContactColumns.value(ContactColumn.FullName, group)).toBe("Board");
  expect(ContactColumns.value(ContactColumn.JobTitle, group)).toBe("Contact group");
  expect(ContactColumns.value(ContactColumn.Company, group)).toBe("");
});

test("Sorting by a column puts empty values last, in both directions", () => {
  let contacts = [person("Bea", null), person("Carl", "Zeta"), person("Anna", "Acme")];
  let ascending = [...contacts].sort(ContactColumns.compare({ column: ContactColumn.Company, ascending: true }));
  expect(ascending.map(contact => contact.name)).toEqual(["Anna", "Carl", "Bea"]);
  let descending = [...contacts].sort(ContactColumns.compare({ column: ContactColumn.Company, ascending: false }));
  expect(descending.map(contact => contact.name)).toEqual(["Carl", "Anna", "Bea"]);
});

test("Clicking the sorted column again reverses the order", () => {
  let sort = { column: ContactColumn.FullName, ascending: true };
  expect(ContactColumns.toggledSort(sort, ContactColumn.FullName)).toEqual({ column: ContactColumn.FullName, ascending: false });
  expect(ContactColumns.toggledSort(sort, ContactColumn.Company)).toEqual({ column: ContactColumn.Company, ascending: true });
});

test("Street addresses are shown as text", () => {
  expect(ContactColumns.addressText(JSON.stringify({ street: "Main St 1", city: "Springfield", postalCode: "12345" })))
    .toBe("Main St 1\n12345 Springfield");
  expect(ContactColumns.addressText("Plain text")).toBe("Plain text");
});
