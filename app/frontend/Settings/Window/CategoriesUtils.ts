import type { SettingsCategory } from "./SettingsCategory";
import { settingsCategories } from "../SettingsCategories";
import type { MustangApp } from "../../AppsBar/MustangApp";

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
