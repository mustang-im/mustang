import type { Calendar } from "../../../logic/Calendar/Calendar";
import type { Account } from "../../../logic/Abstract/Account";
import { gt } from "../../../l10n/l10n";

export class CalendarGroup {
  readonly id: "mine" | "shared";
  readonly label: string;
  readonly calendars: Calendar[];

  constructor(id: "mine" | "shared", label: string, calendars: Calendar[]) {
    this.id = id;
    this.label = label;
    this.calendars = calendars;
  }
}

export class CalendarGroups {
  readonly groups: CalendarGroup[];

  constructor(calendars: Calendar[]) {
    let mine = calendars.filter(calendar => !CalendarGroups.isShared(calendar));
    let shared = calendars.filter(calendar => CalendarGroups.isShared(calendar));
    this.groups = [ new CalendarGroup("mine", gt`My Calendars`, mine) ];
    if (shared.length) {
      this.groups.push(new CalendarGroup("shared", gt`Shared Calendars`, shared));
    }
  }

  static isShared(calendar: Calendar): boolean {
    let ownAccount: Account = calendar.mainAccount;
    while (ownAccount?.mainAccount) {
      ownAccount = ownAccount.mainAccount;
    }
    if (!ownAccount?.username || !calendar.username) {
      return false;
    }
    return calendar.username.toLowerCase() != ownAccount.username.toLowerCase();
  }
}
