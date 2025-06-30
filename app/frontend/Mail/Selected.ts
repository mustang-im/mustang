import type { MailAccount } from "../../logic/Mail/MailAccount";
import type { Folder } from "../../logic/Mail/Folder";
import type { EMail } from "../../logic/Mail/EMail";
import type { ArrayColl } from "svelte-collections";
import { SearchView } from "./LeftPane/SearchSwitcher.svelte";
import { writable } from "svelte/store";

export const selectedAccount = writable<MailAccount>();
export const selectedFolder = writable<Folder>();
export const selectedMessage = writable<EMail>();
export const selectedMessages = writable<ArrayColl<EMail>>();
export const selectedSearchTab = writable<SearchView>(SearchView.Folder);
