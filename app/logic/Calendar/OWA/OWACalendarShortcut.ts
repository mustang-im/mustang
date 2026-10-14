import { ExchangeCalendarShortcut } from "../EWS/ExchangeCalendarShortcut";
import type { OWACalendar } from "./OWACalendar";
import type { OWAAccount } from "../../Mail/OWA/OWAAccount";
import { OWAGetFolderRequest } from "../../Mail/OWA/Request/OWAGetFolderRequest";
import { owaResolveNamesRequest } from "../../Contacts/OWA/Request/OWAPersonRequests";
import { PersonUID } from "../../Abstract/PersonUID";
import { ensureArray } from "../../util/util";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";

export class OWACalendarShortcut extends ExchangeCalendarShortcut<OWACalendar> {
  readonly account: OWAAccount;
  readonly ownerEmailAddress: string | null;
  readonly sharedFolderID: string | null;

  constructor(account: OWAAccount, entry: any) {
    super();
    this.account = account;
    this.ownerEmailAddress = entry?.IsOwnerEmailAddressInvalid
      ? null
      : sanitize.emailAddress(entry?.OwnerEmailAddress, null);
    this.sharedFolderID = sanitize.nonemptystring(entry?.SharedFolderId?.Id, null);
  }

  static async listCalendars(account: OWAAccount): Promise<OWACalendar[]> {
    let response = await account.callOWA(new OWAGetCalendarFoldersRequest());
    let shortcuts = ensureArray(response?.CalendarGroups)
      .flatMap(group => ensureArray(group?.Calendars))
      .map(entry => new OWACalendarShortcut(account, entry));
    return await ExchangeCalendarShortcut.createCalendars(shortcuts);
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
