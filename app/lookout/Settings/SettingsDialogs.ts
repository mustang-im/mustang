import type { Account } from "../../logic/Abstract/Account";
import type { Addressbook } from "../../logic/Contacts/Addressbook";
import type { Calendar } from "../../logic/Calendar/Calendar";
import type { MailIdentity } from "../../logic/Mail/MailIdentity";
import type { FolderAccountKind } from "../Setup/NewFolderAccountFlow";
import { selectedIdentity } from "./TrustCenter/selected";
import { SetupMustangApp } from "../../frontend/Setup/SetupMustangApp";
import { openApp, selectedApp } from "../../frontend/AppsBar/selectedApp";
import { mailMustangApp } from "../../frontend/Mail/MailMustangApp";
import { get, writable } from "svelte/store";

export type TrustCenterPage = "email-security";
export type ImportExportAction = "export" | "import-vcard" | "import-ical" | "import-program";

export type SettingsDialog =
  { kind: "options", categoryID?: string, account?: Account } |
  { kind: "account", account: Account, categoryID?: string } |
  { kind: "import-export", preselected?: Calendar | Addressbook, action?: ImportExportAction } |
  { kind: "new-folder-account", folderKind: FolderAccountKind, localOnly?: boolean };

export class SettingsDialogs {
  static readonly current = writable<SettingsDialog | null>(null);

  static open(dialog: SettingsDialog) {
    SettingsDialogs.current.set(dialog);
  }

  static openOptions(categoryID = "global") {
    SettingsDialogs.open({ kind: "options", categoryID });
  }

  static openAccount(account: Account, categoryID = "acc-general") {
    SettingsDialogs.open({ kind: "account", account, categoryID });
  }

  static openTrustCenter(page: TrustCenterPage = "email-security", identity: MailIdentity = null) {
    selectedIdentity.set(identity);
    SettingsDialogs.openOptions("trust-center");
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
