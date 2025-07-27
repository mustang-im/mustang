import { WebAppListed } from "../../../logic/WebApps/WebAppListed";
import { ArrayColl } from "svelte-collections";
import { writable } from "svelte/store";

export const webAppsRunning = new ArrayColl<WebAppListed>;
export const showingWebApp = writable<WebAppListed | null>();
