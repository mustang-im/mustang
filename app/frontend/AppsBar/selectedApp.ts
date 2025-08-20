import type { MustangApp } from "./MustangApp";
import { appGlobal } from "../../logic/app";
import { backgroundError } from "../Util/error";
import { ArrayColl } from "svelte-collections";
import { writable, type Writable } from "svelte/store";
import { navigate } from "svelte-navigator";

export const selectedApp: Writable<MustangApp> = writable(null);
//export const selectedAppParams: Writable<Record<string, any>> = writable(null); // TODO move into history stack
export const sidebarApp: Writable<MustangApp> = writable(null);
export const mustangApps = new ArrayColl<MustangApp>;

/** Search bar in the window title, applies to all apps */
export const globalSearchTerm: Writable<string> = writable(null);

export function openApp(app: MustangApp, params: Record<string, any>) {
  selectedApp.set(app);
  goTo(app.appURL, params);
}

export function goTo(pageURL: string, params: Record<string, any>) {
  console.log("Go to", pageURL, "from", window.location.href, "with params", params);
  //selectedAppParams.set(params);
  let replace = pageURL == window.location.href;
  navigate(pageURL, {
    replace,
    state: params,
  });
}

export function bringAppToFront() {
  window.focus();
  appGlobal.remoteApp.unminimizeMainWindow()
    .catch(backgroundError);
}
