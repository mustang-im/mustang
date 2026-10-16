import type { Calendar } from "../../../logic/Calendar/Calendar";
import type { MailAccount } from "../../../logic/Mail/MailAccount";
import { writable } from "svelte/store";

export type CalendarPropertiesTab = "general" | "permissions";

export type CalendarDialog =
  { kind: "properties", calendar: Calendar, tab: CalendarPropertiesTab } |
  { kind: "open-calendar", account: MailAccount | null, fromAddressBook: boolean } |
  { kind: "rename", calendar: Calendar } |
  { kind: "view-settings", isTable: boolean };

export class CalendarDialogs {
  static readonly current = writable<CalendarDialog | null>(null);

  static open(dialog: CalendarDialog) {
    CalendarDialogs.current.set(dialog);
  }

  static close() {
    CalendarDialogs.current.set(null);
  }
}
