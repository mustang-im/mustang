import { MustangApp } from "../../AppsBar/MustangApp";
import SettingsIcon from "lucide-svelte/icons/settings";

export class SetupMustangApp extends MustangApp {
  id = "setup";
  name = "Setup";
  icon = SettingsIcon;
  mainWindow = null; // Need to set this when instantiating
}
