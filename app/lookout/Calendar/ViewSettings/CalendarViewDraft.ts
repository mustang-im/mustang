import { CalendarSettings, EventTableColumn, EventTableGrouping } from "../CalendarSettings";
import { EventTable } from "../ListView/EventTable";
import { gt } from "../../../l10n/l10n";

export class CalendarViewDraft {
  timeScale: number;
  weekNumbers: boolean;
  showDeclined: boolean;
  columns: EventTableColumn[];
  sortColumn: EventTableColumn;
  sortAscending: boolean;
  grouping: EventTableGrouping;

  static fromSettings(): CalendarViewDraft {
    let draft = new CalendarViewDraft();
    draft.timeScale = CalendarSettings.timeScale.value;
    draft.weekNumbers = CalendarSettings.weekNumbers.value;
    draft.showDeclined = CalendarSettings.showDeclined.value;
    draft.columns = [...CalendarSettings.listColumns.value];
    draft.sortColumn = CalendarSettings.listSortColumn.value;
    draft.sortAscending = CalendarSettings.listSortAscending.value;
    draft.grouping = CalendarSettings.listGrouping.value;
    return draft;
  }

  static defaults(): CalendarViewDraft {
    let draft = new CalendarViewDraft();
    draft.timeScale = CalendarSettings.timeScale.defaultValue;
    draft.weekNumbers = CalendarSettings.weekNumbers.defaultValue;
    draft.showDeclined = CalendarSettings.showDeclined.defaultValue;
    draft.columns = [...CalendarSettings.listColumns.defaultValue];
    draft.sortColumn = CalendarSettings.listSortColumn.defaultValue;
    draft.sortAscending = CalendarSettings.listSortAscending.defaultValue;
    draft.grouping = CalendarSettings.listGrouping.defaultValue;
    return draft;
  }

  save() {
    CalendarSettings.timeScale.value = this.timeScale;
    CalendarSettings.weekNumbers.value = this.weekNumbers;
    CalendarSettings.showDeclined.value = this.showDeclined;
    CalendarSettings.listColumns.value = [...this.columns];
    CalendarSettings.listSortColumn.value = this.sortColumn;
    CalendarSettings.listSortAscending.value = this.sortAscending;
    CalendarSettings.listGrouping.value = this.grouping;
  }

  get columnsSummary(): string {
    return this.columns.map(column => EventTable.columnLabel(column)).join(", ");
  }

  get groupSummary(): string {
    return this.grouping == EventTableGrouping.Recurrence
      ? gt`Recurrence (ascending)`
      : gt`None`;
  }

  get sortSummary(): string {
    let column = EventTable.columnLabel(this.sortColumn);
    return this.sortAscending ? gt`${column} (ascending)` : gt`${column} (descending)`;
  }

  static get allColumns(): EventTableColumn[] {
    return [
      EventTableColumn.Subject, EventTableColumn.Location, EventTableColumn.Start, EventTableColumn.End,
      EventTableColumn.Recurrence, EventTableColumn.Calendar,
    ];
  }

  availableColumns(): EventTableColumn[] {
    return CalendarViewDraft.allColumns.filter(column => !this.columns.includes(column));
  }

  addColumn(column: EventTableColumn) {
    if (!this.columns.includes(column)) {
      this.columns = [...this.columns, column];
    }
  }

  removeColumn(column: EventTableColumn) {
    if (column == EventTableColumn.Subject) {
      return;
    }
    this.columns = this.columns.filter(shown => shown != column);
  }

  moveColumn(column: EventTableColumn, offset: number) {
    let index = this.columns.indexOf(column);
    let target = index + offset;
    if (index < 0 || target < 0 || target >= this.columns.length) {
      return;
    }
    let columns = [...this.columns];
    columns.splice(index, 1);
    columns.splice(target, 0, column);
    this.columns = columns;
  }
}
