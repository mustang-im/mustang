import type { WebAppListed } from "../../../logic/WebApps/WebAppListed";
import { getWebAppsRunning } from "./WebAppsRunning";
import { getNavigation } from "../../AppsBar/selectedApp";
import { webAppsMustangApp } from "../WebAppsMustangApp";
import type { AppWindow } from "../../MainWindow/AppWindow";

export function startWebApp(webApp: WebAppListed, appWindow: AppWindow) {
  let { webAppsRunning, showingWebApp, selectedWebApp } = getWebAppsRunning(appWindow.mainWindow);
  webAppsRunning.add(webApp);
  showingWebApp.set(webApp);
  selectedWebApp.set(webApp);
  getNavigation(appWindow).openApp(webAppsMustangApp, {});
}
