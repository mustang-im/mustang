import type { MailAccount } from "../../logic/Mail/MailAccount";
import type { Folder } from "../../logic/Mail/Folder";
import type { EMail } from "../../logic/Mail/EMail";
import { QuickSearchEMail } from "../../logic/Mail/Store/QuickSearchEMail";
import { SearchView } from "./LeftPane/SearchSwitcher.svelte";
import type { ArrayColl } from "svelte-collections";
import { writable } from "svelte/store";

export const selectedAccount = writable<MailAccount>();
export const selectedFolder = writable<Folder>();
export const selectedMessage = writable<EMail>();
export const selectedMessages = writable<ArrayColl<EMail>>();
export const selectedSearchTab = writable<SearchView>(SearchView.Folder);

/** The current quick search criteria that filter the message list.
 * Allows to restore the view after coming back. */
export const quickSearch = new QuickSearchEMail();
