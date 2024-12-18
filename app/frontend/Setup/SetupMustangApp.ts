import { MustangApp } from "../AppsBar/MustangApp";
import SettingsIcon from "lucide-svelte/icons/settings";
import { gt } from "../../l10n/l10n";

export class SetupMustangApp extends MustangApp {
  id = "setup";
  name = gt`Setup`;
  icon = SettingsIcon;
  mainWindow = null; // Need to set this when instantiating
  onBack: () => void = null;
}
