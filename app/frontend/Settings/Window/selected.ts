import type { SettingsCategory } from "../SettingsCategory";
import type { Account } from "../../../logic/Abstract/Account";
import { writable } from "svelte/store";

export const selectedCategory = writable<SettingsCategory>();
export const selectedAccount = writable<Account>();

