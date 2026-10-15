import { getLocalStorage } from "../../frontend/Util/LocalStorage";

export type CalendarViewType = "day" | "workweek" | "week" | "month";

export class CalendarSettings {
  static readonly view = getLocalStorage<CalendarViewType>("lookout.calendar.view", "workweek");
  static readonly dayCount = getLocalStorage<number>("lookout.calendar.dayCount", 1);
  static readonly timeScale = getLocalStorage<number>("lookout.calendar.timeScale", 30);
  static readonly splitView = getLocalStorage<boolean>("lookout.calendar.splitView", false);
  static readonly showDeclined = getLocalStorage<boolean>("lookout.calendar.showDeclined", true);
  static readonly weekNumbers = getLocalStorage<boolean>("lookout.calendar.weekNumbers", false);
  static readonly folderPane = getLocalStorage<boolean>("lookout.calendar.folderPane", true);
}
