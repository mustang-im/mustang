import type { MailAccount } from "../../logic/Mail/MailAccount";
import type { Folder } from "../../logic/Mail/Folder";
import type { EMail } from "../../logic/Mail/EMail";
import { QuickSearchEMail } from "../../logic/Mail/Store/QuickSearchEMail";
import { SearchView } from "./LeftPane/SearchSwitcher.svelte";
import { AppWindow } from "../MainWindow/AppWindow";
import type { ArrayColl } from "svelte-collections";
import { writable } from "svelte/store";

export function getMailSelection(appWindow = AppWindow.current()) {
  return appWindow.uiState(createMailSelection);
}

function createMailSelection() {
  return {
    selectedAccount: writable<MailAccount>(),
    selectedFolder: writable<Folder>(),
    selectedMessage: writable<EMail>(),
    selectedMessages: writable<ArrayColl<EMail>>(),
    selectedSearchTab: writable<SearchView>(SearchView.Folder),
    /** The current quick search criteria that filter the message list.
     * Allows to restore the view after coming back. */
    quickSearch: new QuickSearchEMail(),
  };
}
