import { MailAccount } from "../../../logic/Mail/MailAccount";
import type { PersonUID } from "../../../logic/Abstract/PersonUID";
import { assert } from "../../../logic/util/util";
import { gt } from "../../../l10n/l10n";

export enum SharedFolderType {
  Inbox = "inbox",
  Calendar = "calendar",
  Contacts = "contacts",
}

export class SharedFolders {
  static typeLabel(type: SharedFolderType): string {
    switch (type) {
      case SharedFolderType.Calendar:
        return gt`Calendar`;
      case SharedFolderType.Contacts:
        return gt`Contacts`;
      default:
        return gt`Inbox`;
    }
  }

  static distinguishedIDs(type: SharedFolderType): string[] {
    switch (type) {
      case SharedFolderType.Calendar:
        return ["calendar"];
      case SharedFolderType.Contacts:
        return ["contacts"];
      default:
        return ["msgfolderroot", "inbox"];
    }
  }

  static hasMailAccountOf(account: MailAccount, person: PersonUID): boolean {
    // <copied from="../../../frontend/Settings/Mail/SharingIncoming.svelte" notYetAdded()>
    return !!account.dependentAccounts().find(dependent =>
      dependent.protocol == account.protocol && dependent instanceof MailAccount &&
      dependent.isMyEMailAddress(person.emailAddress));
    // </copied>
  }

  static async open(account: MailAccount, person: PersonUID, type: SharedFolderType) {
    let name = person.name || person.emailAddress;
    if (type == SharedFolderType.Inbox) {
      assert(!SharedFolders.hasMailAccountOf(account, person), gt`You have already opened the mail of ${name}`);
    }
    let shared = await account.findSharedFolders(person, SharedFolders.distinguishedIDs(type));
    assert(shared.length, gt`You have no access to the ${SharedFolders.typeLabel(type)} of ${name}`);
    if (type == SharedFolderType.Calendar) {
      await account.addSharedCalendar(person);
    } else if (type == SharedFolderType.Contacts) {
      await account.addSharedAddressbook(person);
    } else {
      await account.addSharedFolders(person, shared.includes("msgfolderroot") ? "msgfolderroot" : "inbox");
    }
  }
}
