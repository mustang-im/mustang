import { WebAppCategory } from "./WebAppCategory";
import { WebAppListed } from "./WebAppListed";
import appStore from "./webAppStore.json";
import { sanitize } from "../../../lib/util/sanitizeDatatypes";
import { MapColl, ArrayColl } from 'svelte-collections';
import { showError } from "../../frontend/Util/error";

export class WebApps {
  /** fullID -> AppCategory */
  readonly categories = new MapColl<string, WebAppCategory>();
  readonly apps = new MapColl<string, WebAppListed>();
  readonly myApps = new ArrayColl<WebAppListed>();
  readonly runningApps = new ArrayColl<WebAppListed>();

  async load() {
    if (this.apps.hasItems) {
      return;
    }
    for (let json of appStore.categories) {
      let cat = WebAppCategory.fromJSON(json);
      this.categories.set(cat.fullID, cat);
    }
    this.apps.addAll(appStore.apps.map(json => WebAppListed.fromJSON(json)));
    for (let category of this.categories) {
      let apps = this.apps.contents.filter(app => app.categoryFullIDs.includes(category.fullID));
      category.apps.addAll(apps);
    }

    try {
      let configuredIDs = sanitize.array(JSON.parse(sanitize.nonemptystring(localStorage.getItem("apps.selected"), null)), []);
      for (let configuredID of configuredIDs) {
        try {
          let app = this.apps.find(app => app.id == sanitize.nonemptystring(configuredID));
          this.myApps.add(app);
        } catch (ex) {
          console.log("Configured app not found in app store", ex);
        }
      }
    } catch (ex) {
      showError(ex);
    }
    this.myApps.subscribe(() => {
      let myAppIDs = this.myApps.map(app => app.id).contents;
      localStorage.setItem("apps.selected", JSON.stringify(myAppIDs));
    });
    this.categories.get("selectedApps").apps = this.myApps;
  }
}
