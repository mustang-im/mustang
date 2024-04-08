import { MustangApp } from "../../AppsBar/MustangApp";
import SettingsApp from "./SettingsApp.svelte";
import SettingsIcon from "lucide-svelte/icons/settings";

export class SettingsMustangApp extends MustangApp {
  id = "settings";
  name = "Settings";
  icon = SettingsIcon;
  mainWindow = SettingsApp;
}

export const settingsMustangApp = new SettingsMustangApp();
