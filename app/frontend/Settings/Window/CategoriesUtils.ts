import type { SettingsCategory } from "../SettingsCategory";
import { accountSettings, settingsCategories } from "../SettingsCategory";
import type { MustangApp } from "../../AppsBar/MustangApp";
import type { Account } from "../../../logic/Abstract/Account";
import { settingsMustangApp } from "./SettingsMustangApp";
import { getNavigation } from "../../AppsBar/selectedApp";
import { getSettingsSelection } from "./selected";
import type { AppWindow } from "../../MainWindow/AppWindow";
import { assert } from "../../../logic/util/util";

export function getAllSettingsCategories(): SettingsCategory[] {
  let results: SettingsCategory[] = []
  function processCat(cat: SettingsCategory) {
    results.push(cat);
    for (let subCat of cat.subCategories) {
      processCat(subCat);
    }
  }
  for (let cat of settingsCategories) {
    processCat(cat);
  }
  return results;
}

export function getSettingsCategoryByID(id: string): SettingsCategory {
  return getAllSettingsCategories().find(cat => cat.id == id);
}

export function getSettingsCategoryForApp(app: MustangApp) {
  return getAllSettingsCategories().find(cat => cat.forApp == app);
}

export function openSettingsCategoryForApp(app: MustangApp, appWindow: AppWindow) {
  openSettingsCategory(getSettingsCategoryForApp(app), appWindow);
}

export function openSettingsCategoryByID(id: string, appWindow: AppWindow) {
  openSettingsCategory(getSettingsCategoryByID(id), appWindow);
}

export function openSettingsCategory(cat: SettingsCategory, appWindow: AppWindow) {
  let { openApp, bringAppToFront } = getNavigation(appWindow);
  getSettingsSelection(appWindow.mainWindow).selectedCategory.set(cat);
  openApp(settingsMustangApp, {});
  if (appWindow.mainWindow != appWindow) {
    bringAppToFront();
  }
}

export function getSettingsCategoryForAccount(account: Account, categoryID = "main") {
  return accountSettings.find(cat => account instanceof cat.type &&
    cat.id == categoryID || categoryID == "main" && cat.isMain);
}

export function openSettingsCategoryForAccount(account: Account, appWindow: AppWindow, categoryID = "main") {
  let cat = getSettingsCategoryForAccount(account, categoryID);
  assert(cat, "Account not found in settings");
  let { selectedAccount, selectedCategory } = getSettingsSelection(appWindow.mainWindow);
  let { openApp, bringAppToFront } = getNavigation(appWindow);
  selectedAccount.set(account);
  selectedCategory.set(cat);
  // TODO Mobile? goTo(URLPart`/settings/account/${account.id}`, { category, account }); or goTo(URLPart`/settings/account/${account.id}/${category.id}`, { category, account });
  openApp(settingsMustangApp, { category: cat, account: account });
  if (appWindow.mainWindow != appWindow) {
    bringAppToFront();
  }
}
