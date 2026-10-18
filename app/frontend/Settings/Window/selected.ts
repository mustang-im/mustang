import type { SettingsCategory } from "../SettingsCategory";
import type { Account } from "../../../logic/Abstract/Account";
import { AppWindow } from "../../MainWindow/AppWindow";
import { writable } from "svelte/store";

export function getSettingsSelection(appWindow = AppWindow.current()) {
  return appWindow.uiState(createSettingsSelection);
}

function createSettingsSelection() {
  return {
    selectedCategory: writable<SettingsCategory>(),
    selectedAccount: writable<Account>(),
  };
}
