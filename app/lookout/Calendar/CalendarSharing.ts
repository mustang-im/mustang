import { CalendarShareCombinedPermissions, type Calendar } from "../../logic/Calendar/Calendar";
import type { PersonUID } from "../../logic/Abstract/PersonUID";
import type { MailAccount } from "../../logic/Mail/MailAccount";
import { getBaseDomainFromHost, getDomainForEmailAddress } from "../../logic/util/netUtil";
import { assert } from "../../logic/util/util";
import { gt } from "../../l10n/l10n";

export class CalendarSharing {
  static levelLabel(level: CalendarShareCombinedPermissions): string {
    switch (level) {
    case CalendarShareCombinedPermissions.ReadAvailability:
      return gt`Can view when I'm busy`;
    case CalendarShareCombinedPermissions.ReadTitle:
      return gt`Can view titles and locations`;
    case CalendarShareCombinedPermissions.ReadAll:
      return gt`Can view all details`;
    case CalendarShareCombinedPermissions.Modify:
      return gt`Can edit`;
    }
  }

  static async share(calendar: Calendar, person: PersonUID, level: CalendarShareCombinedPermissions) {
    let account = calendar.mainAccount as MailAccount;
    // <copied from="../../frontend/Settings/Mail/SharingOutgoing.svelte">
    assert(getBaseDomainFromHost(getDomainForEmailAddress(person.emailAddress)) ==
      getBaseDomainFromHost(getDomainForEmailAddress(account.emailAddress)),
      gt`You can only share with users in your company`);
    // </copied>
    await calendar.addSharedPerson(person, level);
  }
}
