import { getLocalStorage } from "../../../frontend/Util/LocalStorage";
import { writable, get, type Writable } from "svelte/store";

export type RibbonLayout = "classic" | "simplified";

export class RibbonModel {
  static readonly contextKey = "lookout-ribbon";
  readonly tabs: Writable<RibbonTabModel[]> = writable([]);
  readonly selectedTab: Writable<RibbonTabModel> = writable(null);
  readonly layout = getLocalStorage<RibbonLayout>("lookout.ribbon.layout", "classic");
  readonly collapsed = getLocalStorage<boolean>("lookout.ribbon.collapsed", false);

  addTab(tab: RibbonTabModel) {
    this.tabs.update(tabs => [...tabs, tab]);
    if (!get(this.selectedTab)) {
      this.selectedTab.set(tab);
    }
  }

  removeTab(tab: RibbonTabModel) {
    this.tabs.update(tabs => tabs.filter(existing => existing != tab));
    if (get(this.selectedTab) == tab) {
      this.selectedTab.set(get(this.tabs)[0] ?? null);
    }
  }

  setTabLabel(tab: RibbonTabModel, label: string) {
    if (tab.label == label) {
      return;
    }
    tab.label = label;
    this.tabs.update(tabs => tabs);
  }

  selectTab(tab: RibbonTabModel) {
    this.selectedTab.set(tab);
  }

  selectTabByLabel(label: string) {
    let tab = get(this.tabs).find(candidate => candidate.label == label);
    if (tab) {
      this.selectTab(tab);
    }
  }

  setLayout(layout: RibbonLayout) {
    this.layout.value = layout;
  }

  get currentLayout(): RibbonLayout {
    return this.layout.value == "simplified" ? "simplified" : "classic";
  }

  setCollapsed(collapsed: boolean) {
    this.collapsed.value = collapsed;
  }
}

export class RibbonTabModel {
  static readonly contextKey = "lookout-ribbon-tab";
  label: string;
  readonly groups: RibbonGroupModel[] = [];
  protected availableWidth = 0;

  constructor(label: string) {
    this.label = label;
  }

  addGroup(group: RibbonGroupModel) {
    this.groups.push(group);
    this.fitGroups();
  }

  removeGroup(group: RibbonGroupModel) {
    let pos = this.groups.indexOf(group);
    if (pos >= 0) {
      this.groups.splice(pos, 1);
    }
    this.fitGroups();
  }

  setAvailableWidth(width: number) {
    this.availableWidth = width;
    this.fitGroups();
  }

  fitGroups() {
    if (!this.availableWidth) {
      return;
    }
    let widths = this.groups.map(group => group.expandedWidth);
    let totalWidth = widths.reduce((sum, width) => sum + width, 0);
    let compact = this.groups.map(() => false);
    let collapse = this.groups.map(() => false);
    for (let i = this.groups.length - 1; i >= 0 && totalWidth > this.availableWidth; i--) {
      let saving = widths[i] - this.groups[i].compactWidth;
      if (saving <= 0) {
        continue;
      }
      totalWidth -= saving;
      widths[i] = this.groups[i].compactWidth;
      compact[i] = true;
    }
    for (let i = this.groups.length - 1; i >= 0 && totalWidth > this.availableWidth; i--) {
      let saving = widths[i] - this.groups[i].collapsedWidth;
      if (saving <= 0) {
        continue;
      }
      totalWidth -= saving;
      compact[i] = false;
      collapse[i] = true;
    }
    this.groups.forEach((group, i) => group.setFit(compact[i], collapse[i]));
  }
}

export class RibbonGroupModel {
  static readonly contextKey = "lookout-ribbon-group";
  label: string;
  expandedWidth = 0;
  compactWidth = 0;
  collapsedWidth = 0;
  firstIcon: ConstructorOfATypedSvelteComponent = null;
  readonly compact: Writable<boolean> = writable(false);
  readonly collapsed: Writable<boolean> = writable(false);

  constructor(label: string) {
    this.label = label;
  }

  offerIcon(icon: ConstructorOfATypedSvelteComponent) {
    if (!this.firstIcon && icon) {
      this.firstIcon = icon;
    }
  }

  setWidths(expandedWidth: number, collapsedWidth: number, compactWidth = expandedWidth) {
    this.expandedWidth = expandedWidth;
    this.collapsedWidth = collapsedWidth;
    this.compactWidth = compactWidth;
  }

  setFit(compact: boolean, collapsed: boolean) {
    if (get(this.compact) != compact) {
      this.compact.set(compact);
    }
    if (get(this.collapsed) != collapsed) {
      this.collapsed.set(collapsed);
    }
  }
}
