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

    let myAppIDs = JSON.parse(localStorage.getItem("apps.selected"));
    this.myApps.addAll(this.apps.contents.filter(app => myAppIDs.includes(app.id)));
    this.categories.get("selected").apps = this.myApps;
    this.myApps.subscribe(() => {
      let myAppIDs = this.myApps.map(app => app.id).contents;
      localStorage.setItem("apps.selected", JSON.stringify(myAppIDs));
    });
  }
}
