import { EWSCalendarShortcut } from "../EWS/EWSCalendarShortcut";
import type { OWACalendar } from "./OWACalendar";
import type { OWAAccount } from "../../Mail/OWA/OWAAccount";
import { OWAGetFolderRequest } from "../../Mail/OWA/Request/OWAGetFolderRequest";
import { owaResolveNamesRequest } from "../../Contacts/OWA/Request/OWAPersonRequests";
import { PersonUID } from "../../Abstract/PersonUID";
import { ensureArray } from "../../util/util";
import { logError } from "../../../frontend/Util/error";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";

export class OWACalendarShortcut {
  readonly account: OWAAccount;
  readonly ownerEmailAddress: string | null;
  readonly sharedFolderID: string | null;

  /**
   * @param entry A `CalendarEntry`, as OWA's `GetCalendarFolders` returns it in
   *   `CalendarGroups[].Calendars[]`. Only a `LinkedCalendarEntry`, i.e. the
   *   calendar of another user, has `OwnerEmailAddress` and
   *   `IsOwnerEmailAddressInvalid`, and `SharedFolderId: { Id }`,
   *   if the shortcut is to a specific folder of the owner,
   *   not their default calendar.
   */
  constructor(account: OWAAccount, entry: any) {
    this.account = account;
    this.ownerEmailAddress = entry?.IsOwnerEmailAddressInvalid
      ? null
      : sanitize.emailAddress(entry?.OwnerEmailAddress, null);
    this.sharedFolderID = sanitize.nonemptystring(entry?.SharedFolderId?.Id, null);
  }

  static async listCalendars(account: OWAAccount): Promise<OWACalendar[]> {
    let response = await account.callOWA(new OWAGetCalendarFoldersRequest());
    let entries = ensureArray(response?.CalendarGroups).flatMap(group => ensureArray(group?.Calendars));
    let calendars: OWACalendar[] = [];
    for (let entry of entries) {
      let shortcut = new OWACalendarShortcut(account, entry);
      if (!shortcut.isCalendarOfOtherUser) {
        continue;
      }
      try {
        let calendar = await shortcut.createCalendar();
        if (calendar && !calendars.some(other => other.folderID == calendar.folderID)) {
          calendars.push(calendar);
        }
      } catch (ex) {
        if (!EWSCalendarShortcut.isStaleError(ex)) {
          logError(ex);
        }
      }
    }
    return calendars;
  }

  get isCalendarOfOtherUser(): boolean {
    return !!this.ownerEmailAddress && !this.account.isMyEMailAddress(this.ownerEmailAddress);
  }

  async createCalendar(): Promise<OWACalendar | null> {
    let folderID = this.sharedFolderID
      ? {
        __type: "FolderId:#Exchange",
        Id: this.sharedFolderID,
      }
      : {
        __type: "DistinguishedFolderId:#Exchange",
        Id: "calendar",
        Mailbox: {
          EmailAddress: this.ownerEmailAddress,
        },
      };
    let result = await this.account.callOWA(new OWAGetFolderRequest(folderID));
    let folder = result.Folders?.[0];
    if (folder?.FolderClass != "IPF.Appointment") {
      return null;
    }
    let owner = await this.resolveOwner();
    return this.account.createCalendarAccount(folder, {
      name: owner.nameOrEMail,
      username: owner.emailAddress,
      color: this.account.colorForSharedAccount(owner),
    });
  }

  protected async resolveOwner(): Promise<PersonUID> {
    try {
      let response = await this.account.callOWA(owaResolveNamesRequest(this.ownerEmailAddress));
      let resolution = ensureArray(response.ResolutionSet).find(candidate =>
        candidate?.Mailbox?.EmailAddress?.toLowerCase() == this.ownerEmailAddress);
      return new PersonUID(this.ownerEmailAddress, sanitize.nonemptylabel(resolution?.Mailbox?.Name, null) ?? undefined);
    } catch (ex) {
      if (ex.type != "ErrorNameResolutionNoResults") {
        throw ex;
      }
      return new PersonUID(this.ownerEmailAddress);
    }
  }
}

class OWAGetCalendarFoldersRequest {
  get action() {
    return "GetCalendarFolders";
  }
}
