import type { ExchangeCalendar } from "./ExchangeCalendar";
import { logError } from "../../../frontend/Util/error";

export abstract class ExchangeCalendarShortcut<T extends ExchangeCalendar & { folderID: string }> {
  static readonly kStaleErrors = [
    "ErrorNameResolutionNoResults",
    "ErrorNonExistentMailbox",
    "ErrorFolderNotFound",
    "ErrorItemNotFound",
    "ErrorAccessDenied",
  ];

  abstract get isCalendarOfOtherUser(): boolean;

  abstract createCalendar(): Promise<T | null>;

  static async createCalendars<T extends ExchangeCalendar & { folderID: string }>(shortcuts: ExchangeCalendarShortcut<T>[]): Promise<T[]> {
    let calendars: T[] = [];
    for (let shortcut of shortcuts.filter(shortcut => shortcut.isCalendarOfOtherUser)) {
      try {
        let calendar = await shortcut.createCalendar();
        if (calendar && !calendars.some(other => other.folderID == calendar.folderID)) {
          calendars.push(calendar);
        }
      } catch (ex) {
        if (!shortcut.isStaleError(ex)) {
          logError(ex);
        }
      }
    }
    return calendars;
  }

  isStaleError(ex: any): boolean {
    return ExchangeCalendarShortcut.kStaleErrors.includes(ex?.type);
  }
}
