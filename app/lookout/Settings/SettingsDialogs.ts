import type { Account } from "../../logic/Abstract/Account";
import type { Addressbook } from "../../logic/Contacts/Addressbook";
import type { Calendar } from "../../logic/Calendar/Calendar";
import type { MailIdentity } from "../../logic/Mail/MailIdentity";
import type { MailAccount } from "../../logic/Mail/MailAccount";
import type { ImportExportAction } from "./ImportExport/ImportExportFlow";
import type { FolderAccountKind } from "./Accounts/NewFolderAccountFlow";
import { writable } from "svelte/store";

export type OptionsCategory = "general" | "mail" | "calendar" | "people" | "language" | "advanced" | "trust-center";
export type AccountSettingsTab = "email" | "calendars" | "addressbooks";
export type ChangeAccountPage = "general" | "server";
export type AccountPage = ChangeAccountPage | "work-hours";
export type TrustCenterPage = "email-security";

export type SettingsDialog =
  { kind: "options", category: OptionsCategory } |
  { kind: "trust-center", page: TrustCenterPage, identity?: MailIdentity } |
  { kind: "account-settings", tab: AccountSettingsTab, account?: Account } |
  { kind: "change-account", account: Account, page: AccountPage } |
  { kind: "import-export", preselected?: Calendar | Addressbook, action?: ImportExportAction, firstRun?: boolean } |
  { kind: "add-account", prepared?: MailAccount[], firstRun?: boolean } |
  { kind: "new-folder-account", folderKind: FolderAccountKind, localOnly?: boolean };

export class SettingsDialogs {
  static readonly current = writable<SettingsDialog | null>(null);

  static open(dialog: SettingsDialog) {
    SettingsDialogs.current.set(dialog);
  }

  static openOptions(category: OptionsCategory = "general") {
    SettingsDialogs.open({ kind: "options", category });
  }

  static openAccount(account: Account, page: AccountPage = "general") {
    SettingsDialogs.open({ kind: "change-account", account, page });
  }

  static openTrustCenter(page: TrustCenterPage = "email-security", identity: MailIdentity = null) {
    SettingsDialogs.open({ kind: "trust-center", page, identity });
  }

  static openFirstRun(predefined: MailAccount | null = null) {
    SettingsDialogs.open({ kind: "add-account", firstRun: true, prepared: predefined ? [predefined] : [] });
  }

  static openImportFromProgram(firstRun = false) {
    SettingsDialogs.open({ kind: "import-export", action: "import-program", firstRun });
  }

  static close() {
    SettingsDialogs.current.set(null);
  }
}
