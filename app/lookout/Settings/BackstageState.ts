import { Observable, notifyChangedProperty } from "../../logic/util/Observable";

export type BackstagePage = "info" | "options";

export class BackstageState extends Observable {
  @notifyChangedProperty
  isOpen = false;
  @notifyChangedProperty
  page: BackstagePage = "info";

  open(page: BackstagePage = "info") {
    this.page = page;
    this.isOpen = true;
  }

  close() {
    this.isOpen = false;
  }
}

export const backstageState = new BackstageState();
