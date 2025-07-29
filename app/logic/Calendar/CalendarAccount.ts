import { Account } from "../Abstract/Account";
import { appGlobal } from "../app";
import type { Calendar } from "./Calendar";
import { ArrayColl } from "svelte-collections";

/**
 * This is a user account on a server with its own login and configuration,
 * specifically for calendars only, e.g. CalDAV.
 * It may hold multiple calendars.
 *
 * Calendars that are access together with a mail account,
 * e.g. JMAP, EWS, OWA, ActiveSync, are *not* `CalendarAccount`s,
 * but their Calendar uses the `MailAccount` as `account`.
 */
export abstract class CalendarAccount extends Account {
  readonly protocol: string = "calendar-server";
  storage: CalendarStorage | null = null;
  readonly calendars = new ArrayColl<Calendar>();

  abstract listCalendars(): Promise<void>;

  /**
   * @param duplicates Include those that are already known locally
   */
  abstract listCalendarsOnServer(duplicates: boolean): Promise<ArrayColl<Calendar>>;

  async save(): Promise<void> {
    await this.storage?.saveAccount(this);
  }

  async deleteIt(): Promise<void> {
    await super.deleteIt();
    await this.storage?.deleteAccount(this);
    appGlobal.calendarAccounts.remove(this);
  }
}

export interface CalendarStorage {
  saveEvent(event: Event): Promise<void>;
  deleteEvent(event: Event): Promise<void>;
  saveCalendar(calendar: Calendar): Promise<void>;
  deleteCalendar(calendar: Calendar): Promise<void>;
  saveAccount(account: CalendarAccount): Promise<void>;
  deleteAccount(account: CalendarAccount): Promise<void>;
}
