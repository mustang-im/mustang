import type { MustangApp } from "./MustangApp";
import { appGlobal } from "../../logic/app";
import { backgroundError } from "../Util/error";
import { ArrayColl, MapColl } from "svelte-collections";
import { writable, type Writable } from "svelte/store";
import { navigate } from "svelte-navigator";
import type AnyObject from "svelte-navigator/types/AnyObject";

export const selectedApp: Writable<MustangApp> = writable(null);
export const sidebarApp: Writable<MustangApp> = writable(null);
export const mustangApps = new ArrayColl<MustangApp>;

/** Search bar in the window title, applies to all apps */
export const globalSearchTerm: Writable<string> = writable(null);

export type PageParams = Record<string, any>;
export function openApp(app: MustangApp, params: PageParams) {
  selectedApp.set(app);
  goTo(app.appURL, params);
}

export function goTo(pageURL: string, params: PageParams) {
  let replace = pageURL == window.location.pathname;
  console.log("Go to", pageURL, replace ? "replace" : "add", "from", window.location.pathname, "with params", params);
  navigate(pageURL, {
    replace,
    state: addParams(params),
  });
}

export function bringAppToFront() {
  window.focus();
  appGlobal.remoteApp.unminimizeMainWindow()
    .catch(backgroundError);
}


/** History params
 * history state clones our objects, which fails. We need to keep the actual object around.
 * So, store the object here, generate an ID for it, and then store the ID on the history stack. */
const historyParams = new MapColl<number, any>();
let lastID = 1;
export type HistoryIDObj = { id: number };

/** @returns ID. Put this as `state` on the history stack. */
export function addParams(params: PageParams): HistoryIDObj {
  let id = lastID++;
  historyParams.set(id, params);
  return { id };
}
export function getParams(id: HistoryIDObj | AnyObject): PageParams {
  if (!id?.id) {
    return {};
  }
  return historyParams.get(id.id);
}
/** TODO call this
 * a) when the user goes back in history and then forward, remove the orphaned entries, or
 * b) if the user goes forward, delete all entries > 20 pages back. */
function deletePage(id: HistoryIDObj | AnyObject): void {
  if (!id?.id) {
    return;
  }
  historyParams.delete(id.id);
}
