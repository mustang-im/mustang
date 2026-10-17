import type { Account } from "../../../logic/Abstract/Account";
import type { AccountPage, OptionsCategory, SettingsDialog } from "../SettingsDialogs";
import { AccountDraft } from "../Accounts/AccountDraft";
import { Calendar } from "../../../logic/Calendar/Calendar";
import { Addressbook } from "../../../logic/Contacts/Addressbook";
import { appGlobal } from "../../../logic/app";
import type { Collection } from "svelte-collections";
import { gt } from "../../../l10n/l10n";

export interface OptionsSelection {
  category: OptionsCategory;
  account: Account | null;
  accountPage: AccountPage;
}

export interface AccountPageEntry {
  id: AccountPage;
  label: string;
}

export class OptionsNavigation {
  static accountsOf(category: OptionsCategory): Collection<Account> | null {
    switch (category) {
      case "mail":
        return appGlobal.emailAccounts as Collection<Account>;
      case "calendar":
        return appGlobal.calendars as Collection<Account>;
      case "people":
        return appGlobal.addressbooks as Collection<Account>;
      default:
        return null;
    }
  }

  static categoryOf(account: Account): OptionsCategory {
    if (account instanceof Calendar) {
      return "calendar";
    }
    if (account instanceof Addressbook) {
      return "people";
    }
    return "mail";
  }

  static hasOwnServer(account: Account): boolean {
    return !account.isDependentAccount && new AccountDraft(account).hasServer;
  }

  static pagesOf(account: Account): AccountPageEntry[] {
    let pages: AccountPageEntry[] = [ { id: "general", label: gt`General` } ];
    if (OptionsNavigation.hasOwnServer(account)) {
      pages.push({ id: "server", label: gt`Server` });
    }
    if (account instanceof Calendar && account.workHours) {
      pages.push({ id: "work-hours", label: gt`Work hours` });
    }
    return pages;
  }

  static pageOf(account: Account, page: AccountPage): AccountPage {
    return OptionsNavigation.pagesOf(account).some(entry => entry.id == page) ? page : "general";
  }

  static selectionFor(dialog: SettingsDialog): OptionsSelection {
    if (dialog.kind == "change-account") {
      return {
        category: OptionsNavigation.categoryOf(dialog.account),
        account: dialog.account,
        accountPage: OptionsNavigation.pageOf(dialog.account, dialog.page),
      };
    }
    if (dialog.kind == "account-settings") {
      let category: OptionsCategory = dialog.tab == "calendars" ? "calendar" : dialog.tab == "addressbooks" ? "people" : "mail";
      let account = dialog.account ?? OptionsNavigation.accountsOf(category).first ?? null;
      return { category, account, accountPage: "general" };
    }
    if (dialog.kind == "options") {
      return { category: dialog.category, account: null, accountPage: "general" };
    }
    return { category: "general", account: null, accountPage: "general" };
  }
}
