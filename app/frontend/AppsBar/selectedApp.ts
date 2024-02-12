import type { MustangApp } from "./MustangApp";
import { ArrayColl } from "svelte-collections";
import { writable, type Writable } from "svelte/store";

export const selectedApp: Writable<MustangApp> = writable(null);
export const sidebarApp: Writable<MustangApp> = writable(null);
export const mustangApps = new ArrayColl<MustangApp>;

export function openApp(app: MustangApp) {
  selectedApp.set(app);
}
