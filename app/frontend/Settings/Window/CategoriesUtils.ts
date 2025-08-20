import type { SettingsCategory } from "./SettingsCategory";
import { accountSettings, settingsCategories } from "../SettingsCategories";
import type { MustangApp } from "../../AppsBar/MustangApp";
import type { Account } from "../../../logic/Abstract/Account";
import { settingsMustangApp } from "./SettingsMustangApp";
import { openApp } from "../../AppsBar/selectedApp";
import { selectedAccount, selectedCategory } from "./selected";
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

export function openSettingsCategoryForApp(app: MustangApp) {
  let cat = getSettingsCategoryForApp(app);
  selectedCategory.set(cat);
  // openApp(settingsMustangApp, { category: cat });
  openApp(settingsMustangApp, {});
}

export function openSettingsCategoryForAccount(account: Account) {
  // let mainCat = getAllSettingsCategories().find(cat => cat.accounts.contains(account));
  let cat = accountSettings.find(cat => account instanceof cat.type && cat.isMain);
  assert(cat, "Account not found in settings");
  selectedAccount.set(account);
  selectedCategory.set(cat);
  openApp(settingsMustangApp, { category: cat, account: account });
}
