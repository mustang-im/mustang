import type { SettingsCategory } from "./SettingsCategory";
import type { Account } from "../../../logic/Abstract/Account";
import { writable } from "svelte/store";
import { settingsCategories } from "./SettingsCategories";

export const selectedCategory = writable<SettingsCategory>();
export const selectedAccount = writable<Account>();

