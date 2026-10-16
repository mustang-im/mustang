import type { Account } from "../../logic/Abstract/Account";
import type { Addressbook } from "../../logic/Contacts/Addressbook";
import type { Calendar } from "../../logic/Calendar/Calendar";
import { writable } from "svelte/store";

export type OptionsCategory = "general" | "mail" | "calendar" | "language" | "advanced" | "trust-center";
export type AccountSettingsTab = "email" | "calendars" | "addressbooks";
export type ChangeAccountPage = "general" | "server";

export type SettingsDialog =
  { kind: "options", category: OptionsCategory } |
  { kind: "account-settings", tab: AccountSettingsTab } |
  { kind: "change-account", account: Account, page: ChangeAccountPage } |
  { kind: "import-export", preselected?: Calendar | Addressbook } |
  { kind: "add-account" };

export class SettingsDialogs {
  static readonly current = writable<SettingsDialog | null>(null);

  static open(dialog: SettingsDialog) {
    SettingsDialogs.current.set(dialog);
  }

  static openOptions(category: OptionsCategory = "general") {
    SettingsDialogs.open({ kind: "options", category });
  }

  static close() {
    SettingsDialogs.current.set(null);
  }
}
