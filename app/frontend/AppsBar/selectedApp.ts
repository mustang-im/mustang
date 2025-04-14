import type { MustangApp } from "./MustangApp";
import { ArrayColl } from "svelte-collections";
import { writable, type Writable } from "svelte/store";
import { navigate } from "svelte-navigator";

export const selectedApp: Writable<MustangApp> = writable(null);
export const sidebarApp: Writable<MustangApp> = writable(null);
export const mustangApps = new ArrayColl<MustangApp>;

/** Search bar in the window title, applies to all apps */
export const globalSearchTerm: Writable<string> = writable(null);

export function openApp(app: MustangApp) {
  selectedApp.set(app);
}

export function goTo(pageURL: string) {
  console.log("Go to", pageURL, "from", window.location.href);
  navigate(pageURL);
}
