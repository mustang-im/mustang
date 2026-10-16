import { ContactColumn, ContactColumns, ContactView, type ContactSort } from "./ContactColumns";
import { gt } from "../../../l10n/l10n";

export class ContactViewDraft {
  readonly view: ContactView;
  columns: ContactColumn[];
  sort: ContactSort;

  constructor(view: ContactView, columns: ContactColumn[], sort: ContactSort) {
    this.view = view;
    this.columns = ContactColumns.shownColumns(columns);
    this.sort = { ...sort };
  }

  static fromSettings(view: ContactView): ContactViewDraft {
    return new ContactViewDraft(view, ContactColumns.columnsSetting(view).value, ContactColumns.sort.value);
  }

  static defaults(view: ContactView): ContactViewDraft {
    return new ContactViewDraft(view, ContactColumns.defaultColumns(view), ContactColumns.sort.defaultValue);
  }

  save() {
    ContactColumns.setColumns(this.view, this.columns);
    ContactColumns.sort.value = { ...this.sort };
  }

  get columnsSummary(): string {
    return this.columns.map(column => ContactColumns.label(column)).join(", ");
  }

  get sortSummary(): string {
    let column = ContactColumns.label(this.sort.column);
    return this.sort.ascending ? gt`${column} (ascending)` : gt`${column} (descending)`;
  }
}
