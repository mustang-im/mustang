import { MailShareCombinedPermissions, MailShareIndividualPermissions } from "../Folder";
import { AddressbookShareCombinedPermissions } from "../../Contacts/Addressbook";
import { CalendarShareCombinedPermissions } from "../../Calendar/Calendar";
import { PersonUID } from "../../Abstract/PersonUID";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { NotReached } from "../../util/util";
import { ArrayColl } from "svelte-collections";
import { gt } from "../../../l10n/l10n";

export class ExchangePermission {
  exchangePermissions: ExchangePermissions;
  distinguishedUser?: string;
  protected emailAddress?: string;

  constructor(permissions: Partial<ExchangePermissions> & ExchangeUser) {
    this.exchangePermissions = new ExchangePermissions(permissions);
    this.distinguishedUser = permissions.UserId.DistinguishedUser;
    this.emailAddress = permissions.UserId.PrimarySmtpAddress;
  }

  matchesEMailAddress(emailAddress: string) {
    // (Null check: Permissions for the special users "Default" and "Anonymous" don't have an email address)
    return this.emailAddress?.toLowerCase() == emailAddress.toLowerCase();
  }

  toEWSFolderPermission() {
    return Object.assign({
      t$UserId: this.distinguishedUser
      ? { t$DistinguishedUser: this.distinguishedUser, }
      : { t$PrimarySmtpAddress: this.emailAddress, },
    }, { t$PermissionLevel: "Custom" }, this.exchangePermissions.toEWS());
  }

  toEWSCalendarPermission() {
    return Object.assign({
      t$UserId: this.distinguishedUser
      ? { t$DistinguishedUser: this.distinguishedUser, }
      : { t$PrimarySmtpAddress: this.emailAddress, },
    }, { t$CalendarPermissionLevel: "Custom" }, this.exchangePermissions.toEWS());
  }

  toOWAFolderPermission() {
    return Object.assign({
      __type: "Permission:#Exchange",
      UserId: this.distinguishedUser
      ? { DistinguishedUser: this.distinguishedUser, }
      : { PrimarySmtpAddress: this.emailAddress, },
    }, { PermissionLevel: "Custom" }, this.exchangePermissions);
  }

  toOWACalendarPermission() {
    return Object.assign({
      __type: "CalendarPermission:#Exchange",
      UserId: this.distinguishedUser
      ? { DistinguishedUser: this.distinguishedUser, }
      : { PrimarySmtpAddress: this.emailAddress, },
    }, { PermissionLevel: "Custom" }, this.exchangePermissions);
  }
}

export function getSharedPersons(permissions: ExchangeUser[], thisUser: string): ArrayColl<PersonUID> {
  return new ArrayColl(permissions
    .filter(permission => !permission.UserId.DistinguishedUser && permission.UserId.PrimarySmtpAddress.toLowerCase() != thisUser.toLowerCase())
    .map(permission => new PersonUID(permission.UserId.PrimarySmtpAddress, permission.UserId.DisplayName)));
}

export async function deleteExchangePermissions(target: { getPermissions(): Promise<ExchangePermission[]>, setPermissions(permission: ExchangePermission[]): Promise<void> }, otherPerson: PersonUID) {
  let targetPermissions = await target.getPermissions();
  let personPermission = targetPermissions.findIndex(permission => permission.matchesEMailAddress(otherPerson.emailAddress));
  if (personPermission >= 0) {
    targetPermissions.splice(personPermission, 1);
    await target.setPermissions(targetPermissions);
  }
}

export async function setExchangePermissions(target: { getPermissions(): Promise<ExchangePermission[]>, setPermissions(permission: ExchangePermission[]): Promise<void> }, person: PersonUID, access: string, ...permissions: MailShareIndividualPermissions[]) {
  let targetPermissions = await target.getPermissions();
  let personPermission = targetPermissions.find(permission => permission.matchesEMailAddress(person.emailAddress));
  if (!personPermission) {
    personPermission = new ExchangePermission({ IsFolderVisible: true, UserId: { DisplayName: undefined, DistinguishedUser: undefined, PrimarySmtpAddress: person.emailAddress } });
    targetPermissions.push(personPermission);
  }
  let permission = personPermission.exchangePermissions;
  switch (access) {
  case CalendarShareCombinedPermissions.ReadAvailability:
    permission.ReadItems = "TimeOnly";
    break;
  case CalendarShareCombinedPermissions.ReadTitle:
    permission.ReadItems = "TimeAndSubjectAndLocation";
    break;
  case CalendarShareCombinedPermissions.ReadAll:
  case AddressbookShareCombinedPermissions.Read:
  case MailShareCombinedPermissions.Read:
    permission.ReadItems = "FullDetails";
    break;
  case MailShareCombinedPermissions.FlagChange:
    permission.ReadItems = "FullDetails";
    permission.EditItems = "All";
    break;
  case CalendarShareCombinedPermissions.Modify:
  case AddressbookShareCombinedPermissions.Modify:
  case MailShareCombinedPermissions.Modify:
    permission.ReadItems = "FullDetails";
    permission.EditItems = "All";
    permission.DeleteItems = "All";
    permission.CanCreateItems = true;
    break;
  case MailShareCombinedPermissions.Custom:
    permission.ReadItems = permissions.includes(MailShareIndividualPermissions.Read) ? "FullDetails" : "None";
    permission.EditItems = permissions.includes(MailShareIndividualPermissions.FlagChange) ? "All" : "None"; // closest supported by Exchange
    permission.DeleteItems = permissions.includes(MailShareIndividualPermissions.Delete) ? "All" : "None";
    permission.CanCreateItems = permissions.includes(MailShareIndividualPermissions.Create);
    permission.IsFolderOwner = permissions.includes(MailShareIndividualPermissions.DeleteFolder); // closest supported by Exchange
    permission.CanCreateSubFolders = permissions.includes(MailShareIndividualPermissions.CreateSubfolders);
    break;
  default:
    throw new NotReached();
  }
  await target.setPermissions(targetPermissions);
}

class ExchangePermissions {
  CanCreateItems: boolean;
  CanCreateSubFolders: boolean;
  DeleteItems: "None" | "Owned" | "All";
  EditItems: "None" | "Owned" | "All";
  IsFolderContact: boolean;
  IsFolderOwner: boolean;
  IsFolderVisible: boolean;
  ReadItems: "None" | "TimeOnly" | "TimeAndSubjectAndLocation" | "FullDetails";

  constructor(permissions: Partial<ExchangePermissions> = {}) {
    this.CanCreateItems = sanitize.boolean(permissions.CanCreateItems, false);
    this.CanCreateSubFolders = sanitize.boolean(permissions.CanCreateSubFolders, false);
    this.DeleteItems = sanitize.enum(permissions.DeleteItems, ["None", "Owned", "All"], "None");
    this.EditItems = sanitize.enum(permissions.EditItems, ["None", "Owned", "All"], "None");
    this.IsFolderContact = sanitize.boolean(permissions.IsFolderContact, false);
    this.IsFolderOwner = sanitize.boolean(permissions.IsFolderOwner, false);
    this.IsFolderVisible = sanitize.boolean(permissions.IsFolderVisible, true);
    this.ReadItems = sanitize.enum(permissions.ReadItems, ["None", "TimeOnly", "TimeAndSubjectAndLocation", "FullDetails"], "None");
  }

  toEWS() {
    let result: Record<string, boolean | string> = {};
    for (let permission in this) {
      result["t$" + permission] = this[permission] as string | boolean;
    }
    return result;
  }
}

type ExchangeUser = { UserId: { DisplayName: string; DistinguishedUser: string; PrimarySmtpAddress: string; } };
