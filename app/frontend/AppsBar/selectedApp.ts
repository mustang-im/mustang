import type { MustangApp } from "./MustangApp";
import { AppWindow } from "../MainWindow/AppWindow";
import { createHashHistory, createMemoryHistory } from "../Util/hashHistory";
import type AnyObject from "svelte-navigator/types/AnyObject";
import { minorError } from "../Util/error";
import { ArrayColl, MapColl } from "svelte-collections";
import { writable, get, type Writable } from "svelte/store";
import type RawLocation from "svelte-navigator/types/RawLocation";

export const mustangApps = new ArrayColl<MustangApp>;

export const showDemoToggle: Writable<boolean> = writable(true);

export type PageParams = Record<string, any>;

/** Which app and page shows in the window, separately for each main window */
export function getNavigation(appWindow = AppWindow.current()) {
  return appWindow.mainWindow.uiState(createNavigation);
}

function createNavigation(appWindow: AppWindow) {
  const selectedApp: Writable<MustangApp> = writable(null);
  const sidebarApp: Writable<MustangApp> = writable(null);
  /** Search bar in the window title, applies to all apps */
  const globalSearchTerm: Writable<string> = writable(null);
  // Going back in the browser history of another window would unload it, because `AppWindow` filled it with `document.open()`
  const history = appWindow == AppWindow.main ? createHashHistory() : createMemoryHistory();

  function openApp(app: MustangApp, params: PageParams) {
    selectedApp.set(app);
    goTo(app.appURL, params);
  }

  function goTo(pageURL: string, params: PageParams) {
    let location = history.location.pathname;
    let replace = pageURL == location;
    console.log("Go to", pageURL, replace ? "replace" : "", "from", location, "with params", params);
    history.navigate(pageURL, {
      replace,
      state: addParams(params),
    });
  }

  function goBack() {
    history.navigate(-1);
  }

  /** When `goTo()` is called, we need to update `selectedApp` accordingly */
  function syncSelectedApp(params: { location: RawLocation }) {
    let url = params.location.pathname as string;
    let matchingLength = 0;
    let selectedAppURL = get(selectedApp)?.appURL;
    if (selectedAppURL &&
        url.startsWith(selectedAppURL)) {
      matchingLength = selectedAppURL.length;
    }
    for (let app of mustangApps) {
      if (url.startsWith(app.appURL) &&
          app.appURL.length > matchingLength) {
        selectedApp.set(app);
        return;
      }
    }
  }
  history.listen(syncSelectedApp);

  function bringAppToFront() {
    appWindow.focus();
    appWindow.restore()
      .catch(minorError);
  }

  return { selectedApp, sidebarApp, globalSearchTerm, history, openApp, goTo, goBack, bringAppToFront };
}


/** History params
 * history state clones our objects, which fails. We need to keep the actual object around.
 * So, store the object here, generate an ID for it, and then store the ID on the history stack. */
const historyParams = new MapColl<number, any>();
let lastID = 1;
type HistoryIDObj = { id: number };

/** @returns ID. Put this as `state` on the history stack. */
function addParams(params: PageParams): HistoryIDObj {
  let id = lastID++;
  historyParams.set(id, params);
  return { id };
}
export function getParams(id: HistoryIDObj | AnyObject): PageParams {
  if (!id?.id) {
    return {};
  }
  return historyParams.get(id.id) ?? {};
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
