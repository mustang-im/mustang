import { MustangApp } from "../AppsBar/MustangApp";
import AppsApp from "./WebAppsApp.svelte";
import appsLauncherIcon from '../asset/icon/appBar/appsLauncher.svg?raw';

export class WebAppsMustangApp extends MustangApp {
  id = "webapps";
  name = "Apps";
  icon = appsLauncherIcon;
  mainWindow = AppsApp;
}

export const webAppsMustangApp = new WebAppsMustangApp();
