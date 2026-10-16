// @vitest-environment happy-dom
// app first, to resolve the import cycle around Abstract/Account.ts
import "../../../logic/app";
import { ContactColumn, ContactColumns, ContactView } from "../../Contacts/Views/ContactColumns";
import { ContactViewDraft } from "../../Contacts/Views/ContactViewDraft";
import { expect, test } from "vitest";

test("Columns are stored per view and change only on save", () => {
  ContactColumns.setColumns(ContactView.List, ContactColumns.defaultColumns(ContactView.List));
  let draft = ContactViewDraft.fromSettings(ContactView.List);
  draft.columns = [ ContactColumn.FullName, ContactColumn.HomeCity ];
  draft.sort = { column: ContactColumn.HomeCity, ascending: false };
  expect(ContactColumns.listColumns.value).toEqual(ContactColumns.defaultColumns(ContactView.List));
  draft.save();
  expect(ContactColumns.listColumns.value).toEqual([ ContactColumn.FullName, ContactColumn.HomeCity ]);
  expect(ContactColumns.phoneColumns.value).toEqual(ContactColumns.defaultColumns(ContactView.Phone));
  expect(ContactColumns.sort.value).toEqual({ column: ContactColumn.HomeCity, ascending: false });
  expect(draft.columnsSummary).toBe("Full Name, Home City");
  expect(draft.sortSummary).toBe("Home City (descending)");
  ContactViewDraft.defaults(ContactView.List).save();
  expect(ContactColumns.listColumns.value).toEqual(ContactColumns.defaultColumns(ContactView.List));
});

test("Remove and move a column from the header", () => {
  ContactColumns.setColumns(ContactView.Phone, ContactColumns.defaultColumns(ContactView.Phone));
  ContactColumns.removeColumn(ContactView.Phone, ContactColumn.BusinessFax);
  expect(ContactColumns.phoneColumns.value).not.toContain(ContactColumn.BusinessFax);
  ContactColumns.removeColumn(ContactView.Phone, ContactColumn.FullName);
  expect(ContactColumns.phoneColumns.value[0]).toBe(ContactColumn.FullName);
  ContactColumns.moveColumn(ContactView.Phone, ContactColumn.MobilePhone, ContactColumn.Company);
  expect(ContactColumns.phoneColumns.value.slice(0, 3)).toEqual([ ContactColumn.FullName, ContactColumn.MobilePhone, ContactColumn.Company ]);
  ContactColumns.moveColumn(ContactView.Phone, ContactColumn.FullName, null);
  expect(ContactColumns.phoneColumns.value.at(-1)).toBe(ContactColumn.FullName);
});
