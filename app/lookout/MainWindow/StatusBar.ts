import { Observable, notifyChangedProperty } from "../../logic/util/Observable";
import type { StatusBarItem, StatusBarView } from "./StatusBar.svelte";
import { ArrayColl } from "svelte-collections";

export class StatusBarSection extends Observable {
  @notifyChangedProperty
  left: StatusBarItem[] = [];
  @notifyChangedProperty
  right: StatusBarItem[] = [];
  @notifyChangedProperty
  views: StatusBarView[] = [];
  protected readonly statusBar: StatusBarModel;

  constructor(statusBar: StatusBarModel) {
    super();
    this.statusBar = statusBar;
  }

  remove() {
    this.statusBar.sections.remove(this);
  }
}

export class StatusBarModel {
  readonly sections = new ArrayColl<StatusBarSection>();

  addSection(): StatusBarSection {
    let section = new StatusBarSection(this);
    this.sections.add(section);
    return section;
  }
}

export const statusBar = new StatusBarModel();
