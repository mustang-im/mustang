import type { WebAppListed } from "../../../logic/WebApps/WebAppListed";
import { AppWindow } from "../../MainWindow/AppWindow";
import { SetColl } from "svelte-collections";
import { writable } from "svelte/store";

/** The web apps that run in a window */
export function getWebAppsRunning(appWindow = AppWindow.current()) {
  return appWindow.uiState(createWebAppsRunning);
}

function createWebAppsRunning() {
  return {
    webAppsRunning: new SetColl<WebAppListed>,
    /** The web app currently visible */
    showingWebApp: writable<WebAppListed | null>(),
    /** If a webapp is visible: same as showingWebApp
     * If no webapp visible: last showingWebApp */
    selectedWebApp: writable<WebAppListed | null>(),
  };
}
