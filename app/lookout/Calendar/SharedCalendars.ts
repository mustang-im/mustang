import type { Calendar } from "../../logic/Calendar/Calendar";
import type { PersonUID } from "../../logic/Abstract/PersonUID";
import type { MailAccount } from "../../logic/Mail/MailAccount";
import { appGlobal } from "../../logic/app";
import { assert } from "../../logic/util/util";
import { gt } from "../../l10n/l10n";

export class SharedCalendars {
  static async open(account: MailAccount, person: PersonUID): Promise<Calendar> {
    let name = person.name || person.emailAddress;
    let address = person.emailAddress?.toLowerCase();
    assert(!appGlobal.calendars.contents.some(calendar => calendar.username?.toLowerCase() == address),
      gt`The calendar of ${name} is already in your calendar list.`);
    let shared = await account.findSharedFolders(person, ["calendar"]);
    assert(shared.includes("calendar"),
      gt`The calendar of ${name} could not be opened. You don't have permission to see it. Ask ${name} to share the calendar with you.`);
    return await account.addSharedCalendar(person);
  }
}
