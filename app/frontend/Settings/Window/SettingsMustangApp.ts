import { MustangApp } from "../../AppsBar/MustangApp";
import SettingsApp from "./SettingsApp.svelte";
import SettingsIcon from "lucide-svelte/icons/settings";
import { gt } from "svelte-i18n-lingui";

export class SettingsMustangApp extends MustangApp {
  id = "settings";
  name = gt`Settings`;
  icon = SettingsIcon;
  mainWindow = SettingsApp;
}

export const settingsMustangApp = new SettingsMustangApp();
