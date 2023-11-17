import AppCategory from "./AppCategory";
import AppListed from "./AppListed";
import appStore from "./appStore.json";
import { MapColl, ArrayColl } from 'svelte-collections';

export default class Apps {
  /** fullID -> AppCategory */
  categories = new MapColl<string, AppCategory>();
  apps = new MapColl<string, AppListed>();
  myApps = new ArrayColl<AppListed>();
  runningApps = new ArrayColl<AppListed>();

  async load() {
    if (!this.apps.isEmpty) {
      return;
    }
    for (let json of appStore.categories) {
      let cat = AppCategory.fromJSON(json);
      this.categories.set(cat.fullID, cat);
    }
    this.apps.addAll(appStore.apps.map(json => AppListed.fromJSON(json)));
    // TODO store selected apps
    this.myApps = this.apps.filter(app => app.categoryFullIDs.includes("recommended"));
    this.myApps.subscribe(() => {
    });
  }
}
