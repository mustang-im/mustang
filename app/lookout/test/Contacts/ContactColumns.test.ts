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
  expect(ContactColumns.defaultColumns(ContactView.Phone)).toEqual([
    ContactColumn.FullName, ContactColumn.Company, ContactColumn.BusinessPhone, ContactColumn.BusinessFax,
    ContactColumn.HomePhone, ContactColumn.MobilePhone,
  ]);
  expect(ContactColumns.defaultColumns(ContactView.List)).toContain(ContactColumn.EMail);
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

test("More columns: names, second e-mail, address parts, web page, notes and the folder", () => {
  let anna = person("Anna Smith", "ACME");
  anna.firstName = "Anna";
  anna.lastName = "Smith";
  anna.emailAddresses.addAll([ new ContactEntry("anna@example.com", "work", "email"), new ContactEntry("anna@home.example", "home", "email") ]);
  anna.streetAddresses.add(new ContactEntry(JSON.stringify({ street: "Main St 1", city: "Springfield", postalCode: "12345", country: "USA" }), "home"));
  anna.urls.add(new ContactEntry("https://anna.example", "work", "url"));
  anna.notes = "Met at\nthe fair";
  expect(ContactColumns.value(ContactColumn.FirstName, anna)).toBe("Anna");
  expect(ContactColumns.value(ContactColumn.LastName, anna)).toBe("Smith");
  expect(ContactColumns.value(ContactColumn.EMail2, anna)).toBe("anna@home.example");
  expect(ContactColumns.value(ContactColumn.EMail3, anna)).toBe("");
  expect(ContactColumns.value(ContactColumn.HomeCity, anna)).toBe("Springfield");
  expect(ContactColumns.value(ContactColumn.HomeCountry, anna)).toBe("USA");
  expect(ContactColumns.value(ContactColumn.BusinessCity, anna)).toBe("");
  expect(ContactColumns.value(ContactColumn.HomeAddress, anna)).toContain("Main St 1");
  expect(ContactColumns.value(ContactColumn.WebPage, anna)).toBe("https://anna.example");
  expect(ContactColumns.value(ContactColumn.Notes, anna)).toBe("Met at the fair");
  expect(ContactColumns.value(ContactColumn.InFolder, anna)).toBe("");
});

test("Every column has a label, and the column sets offer only known columns", () => {
  for (let column of ContactColumns.allColumns) {
    expect(ContactColumns.label(column)).not.toBe(column);
  }
  let sets = ContactColumns.columnSets();
  expect(sets[0].label).toBe("Frequently-used fields");
  expect(sets.at(-1).label).toBe("All Contact fields");
  expect(sets.at(-1).columns.length).toBe(ContactColumns.allColumns.length);
  for (let set of sets) {
    for (let column of set.columns) {
      expect(ContactColumns.allColumns).toContain(column);
    }
  }
});

test("Stored columns: unknown ones dropped, Full Name always there", () => {
  expect(ContactColumns.shownColumns([ ContactColumn.Company, "gone" as ContactColumn ]))
    .toEqual([ ContactColumn.FullName, ContactColumn.Company ]);
  expect(ContactColumns.shownColumns(null)).toEqual([ ContactColumn.FullName ]);
});
