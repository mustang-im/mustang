import { Account } from "../Abstract/Account";

/**
 * This is a user account on a server with its own login and configuration,
 * specifically for calendars only, e.g. CalDAV.
 * It may hold multiple calendars.
 *
 * Calendars that are access together with a mail account,
 * e.g. JMAP, EWS, OWA, ActiveSync, are *not* `CalendarAccount`s,
 * but their Calendar uses the `MailAccount` as `account`.
 */
export class CalendarAccount extends Account {
  readonly protocol: string = "calendar-server";
  storage: CalendarAccountStorage | null = null;
}

export interface CalendarAccountStorage {
  saveccount(account: CalendarAccount): Promise<void>;
  deleteAccount(account: CalendarAccount): Promise<void>;
}
