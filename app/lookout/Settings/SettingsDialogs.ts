import type { Account } from "../../logic/Abstract/Account";
import type { Addressbook } from "../../logic/Contacts/Addressbook";
import type { Calendar } from "../../logic/Calendar/Calendar";
import type { MailIdentity } from "../../logic/Mail/MailIdentity";
import type { FolderAccountKind } from "../Setup/NewFolderAccountFlow";
import { SetupMustangApp } from "../../frontend/Setup/SetupMustangApp";
import { openApp, selectedApp } from "../../frontend/AppsBar/selectedApp";
import { mailMustangApp } from "../../frontend/Mail/MailMustangApp";
import { get, writable } from "svelte/store";

export type OptionsCategory = "general" | "mail" | "calendar" | "people" | "language" | "advanced" | "trust-center";
export type AccountSettingsTab = "email" | "calendars" | "addressbooks";
export type ChangeAccountPage = "general" | "server";
export type AccountPage = ChangeAccountPage | "identities" | "work-hours";
export type TrustCenterPage = "email-security";
export type ImportExportAction = "export" | "import-vcard" | "import-ical" | "import-program";

export type SettingsDialog =
  { kind: "options", category: OptionsCategory } |
  { kind: "trust-center", page: TrustCenterPage, identity?: MailIdentity } |
  { kind: "account-settings", tab: AccountSettingsTab, account?: Account } |
  { kind: "change-account", account: Account, page: AccountPage } |
  { kind: "import-export", preselected?: Calendar | Addressbook, action?: ImportExportAction } |
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

  static openSetup(setupURL: string, returnTo: SettingsDialog | null = null) {
    let previousApp = get(selectedApp) ?? mailMustangApp;
    SettingsDialogs.close();
    let setupApp = new SetupMustangApp();
    setupApp.appURL = setupURL;
    if (returnTo) {
      setupApp.onBack = () => {
        openApp(previousApp, {});
        SettingsDialogs.open(returnTo);
      };
    }
    openApp(setupApp, {});
  }

  static close() {
    SettingsDialogs.current.set(null);
  }
}
