import { WebAppListed } from "../../../logic/WebApps/WebAppListed";
import { SetColl } from "svelte-collections";
import { writable } from "svelte/store";

export const webAppsRunning = new SetColl<WebAppListed>;
export const showingWebApp = writable<WebAppListed | null>();
