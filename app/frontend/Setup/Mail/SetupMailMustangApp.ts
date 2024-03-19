import { MustangApp } from "../../AppsBar/MustangApp";
import SetupMailApp from "./SetupMail.svelte";
import SettingsIcon from "lucide-svelte/icons/settings";
// import mailIcon from '../../asset/icon/appBar/mail.svg?raw';

export class SetupMailMustangApp extends MustangApp {
  id = "setup-mail";
  name = "Setup mail";
  icon = SettingsIcon;
  mainWindow = SetupMailApp;
}

export const setupMailMustangApp = new SetupMailMustangApp();
