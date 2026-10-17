import { ContactColumn, ContactColumns, ContactView, type ContactSort } from "../Person/ContactColumns";
import { gt } from "../../../l10n/l10n";

export class ContactViewDraft {
  readonly view: ContactView;
  columns: ContactColumn[];
  sort: ContactSort;
  groupBy: ContactSort | null;

  constructor(view: ContactView, columns: ContactColumn[], sort: ContactSort, groupBy: ContactSort | null = null) {
    this.view = view;
    this.columns = ContactColumns.shownColumns(columns);
    this.sort = { ...sort };
    this.groupBy = groupBy ? { ...groupBy } : null;
  }

  static fromSettings(view: ContactView): ContactViewDraft {
    return new ContactViewDraft(view, ContactColumns.columnsSetting(view).value, ContactColumns.sort.value,
      ContactColumns.groupBySetting(view).value);
  }

  static defaults(view: ContactView): ContactViewDraft {
    return new ContactViewDraft(view, ContactColumns.defaultColumns(view), ContactColumns.sort.defaultValue,
      ContactColumns.defaultGroupBy(view));
  }

  save() {
    ContactColumns.setColumns(this.view, this.columns);
    ContactColumns.sort.value = { ...this.sort };
    ContactColumns.groupBySetting(this.view).value = this.groupBy ? { ...this.groupBy } : null;
  }

  get groupBySummary(): string {
    if (!this.groupBy) {
      return gt`None`;
    }
    let column = ContactColumns.label(this.groupBy.column);
    return this.groupBy.ascending ? gt`${column} (ascending)` : gt`${column} (descending)`;
  }

  get columnsSummary(): string {
    return this.columns.map(column => ContactColumns.label(column)).join(", ");
  }

  get sortSummary(): string {
    let column = ContactColumns.label(this.sort.column);
    return this.sort.ascending ? gt`${column} (ascending)` : gt`${column} (descending)`;
  }
}
