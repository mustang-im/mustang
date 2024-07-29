import AppCategory from "./AppCategory";
import AppListed from "./AppListed";
import appStore from "./appStore.json";
import { sanitize } from "../../../lib/util/sanitizeDatatypes";
import { MapColl, ArrayColl } from 'svelte-collections';
import { showError } from "../../frontend/Util/error";

export default class Apps {
  /** fullID -> AppCategory */
  readonly categories = new MapColl<string, AppCategory>();
  readonly apps = new MapColl<string, AppListed>();
  readonly myApps = new ArrayColl<AppListed>();
  readonly runningApps = new ArrayColl<AppListed>();

  async load() {
    if (this.apps.hasItems) {
      return;
    }
    for (let json of appStore.categories) {
      let cat = AppCategory.fromJSON(json);
      this.categories.set(cat.fullID, cat);
    }
    this.apps.addAll(appStore.apps.map(json => AppListed.fromJSON(json)));
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
    this.categories.get("selectedApps").apps.addAll(this.myApps);
  }
}
