import type { WebAppListed } from "../../../logic/WebApps/WebAppListed";
import { selectedWebApp, showingWebApp, webAppsRunning } from "./WebAppsRunning";
import { openApp } from "../../AppsBar/selectedApp";
import { webAppsMustangApp } from "../WebAppsMustangApp";

export function startWebApp(webApp: WebAppListed) {
  webAppsRunning.add(webApp);
  showingWebApp.set(webApp);
  selectedWebApp.set(webApp);
  openApp(webAppsMustangApp, {});
}
