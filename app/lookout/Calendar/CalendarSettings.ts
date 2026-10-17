import { getLocalStorage } from "../../frontend/Util/LocalStorage";
import { ReadingPanePosition } from "../Mail/MailView";
import { gt } from "../../l10n/l10n";

export type CalendarViewType = "day" | "workweek" | "week" | "month" | "schedule" | "dual";

export enum CalendarCurrentView {
  Calendar = "calendar",
  Preview = "preview",
  List = "list",
  Active = "active",
}

export enum CalendarFolderPane {
  Normal = "normal",
  Minimized = "minimized",
  Off = "off",
}

export enum EventTableColumn {
  Subject = "subject",
  Location = "location",
  Start = "start",
  End = "end",
  Recurrence = "recurrence",
  Calendar = "calendar",
}

export enum EventTableGrouping {
  Recurrence = "recurrence",
  None = "none",
}

export class CalendarSettings {
  static readonly view = getLocalStorage<CalendarViewType>("lookout.calendar.view", "workweek");
  static readonly currentView = getLocalStorage<CalendarCurrentView>("lookout.calendar.currentView", CalendarCurrentView.Calendar);
  static readonly dayCount = getLocalStorage<number>("lookout.calendar.dayCount", 1);
  static readonly timeScale = getLocalStorage<number>("lookout.calendar.timeScale", 30);
  static readonly splitView = getLocalStorage<boolean>("lookout.calendar.splitView", false);
  static readonly showDeclined = getLocalStorage<boolean>("lookout.calendar.showDeclined", true);
  static readonly weekNumbers = getLocalStorage<boolean>("lookout.calendar.weekNumbers", false);
  static readonly folderPane = getLocalStorage<CalendarFolderPane>("lookout.calendar.folderPaneMode", CalendarFolderPane.Normal);
  static readonly readingPane = getLocalStorage<ReadingPanePosition>("lookout.calendar.readingPane", ReadingPanePosition.Off);
  static readonly listSortColumn = getLocalStorage<EventTableColumn>("lookout.calendar.list.sortColumn", EventTableColumn.Start);
  static readonly listSortAscending = getLocalStorage<boolean>("lookout.calendar.list.sortAscending", true);
  static readonly listGrouping = getLocalStorage<EventTableGrouping>("lookout.calendar.list.grouping", EventTableGrouping.Recurrence);
  static readonly listColumns = getLocalStorage<EventTableColumn[]>("lookout.calendar.list.columns", [
    EventTableColumn.Subject, EventTableColumn.Location, EventTableColumn.Start, EventTableColumn.End, EventTableColumn.Recurrence,
  ]);
  static readonly timeZoneLabel = getLocalStorage<string>("lookout.calendar.timeZone.label", "");
  static readonly secondTimeZoneShown = getLocalStorage<boolean>("lookout.calendar.timeZone2.shown", false);
  static readonly secondTimeZoneLabel = getLocalStorage<string>("lookout.calendar.timeZone2.label", "");
  static readonly secondTimeZone = getLocalStorage<string>("lookout.calendar.timeZone2.zone", "Etc/UTC");
  static readonly thirdTimeZoneShown = getLocalStorage<boolean>("lookout.calendar.timeZone3.shown", false);
  static readonly thirdTimeZoneLabel = getLocalStorage<string>("lookout.calendar.timeZone3.label", "");
  static readonly thirdTimeZone = getLocalStorage<string>("lookout.calendar.timeZone3.zone", "Etc/UTC");
  static readonly timeScales = [60, 30, 15, 10, 6, 5];

  static timeScaleLabel(minutes: number): string {
    if (minutes == 60) {
      return gt`60 minutes - Least space for details`;
    }
    if (minutes == 5) {
      return gt`5 minutes - Most space for details`;
    }
    return gt`${minutes} minutes`;
  }
}
