import { writable, get, type Writable } from "svelte/store";

export type RibbonLayout = "classic" | "simplified";
export type RibbonItemSize = "large" | "small";
export type RibbonItemLook = "large" | "small" | "small-icon" | "simplified" | "simplified-icon" | "list";

export enum ClassicStage { Designed, SmallButtons, IconsOnly, Collapsed }
export enum SimplifiedStage { Labels, IconsOnly, InMoreMenu }

export interface RibbonMetrics {
  largeWidth: number;
  smallWidth: number;
  smallIconWidth: number;
  simplifiedWidth: number;
  simplifiedIconWidth: number;
  gap: number;
  groupChrome: number;
}

export interface RibbonItemInfo {
  size: RibbonItemSize;
  fixedWidth?: number;
}

export class RibbonModel {
  static readonly contextKey = "lookout-ribbon";
  id = "main";
  readonly tabs: Writable<RibbonTabModel[]> = writable([]);
  readonly selectedTab: Writable<RibbonTabModel> = writable(null);
  readonly metrics: Writable<RibbonMetrics> = writable(null);
  readonly isSurveying: Writable<boolean> = writable(false);
  readonly isCustomizing: Writable<boolean> = writable(false);
  protected surveys = 0;

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

  startSurvey() {
    this.surveys++;
    this.isSurveying.set(true);
  }

  endSurvey() {
    this.surveys = Math.max(0, this.surveys - 1);
    if (!this.surveys) {
      this.isSurveying.set(false);
    }
  }

  setMetrics(metrics: RibbonMetrics) {
    let old = get(this.metrics);
    if (old && Object.keys(metrics).every(key => old[key] == metrics[key])) {
      return;
    }
    this.metrics.set(metrics);
  }
}

export class RibbonTabModel {
  static readonly contextKey = "lookout-ribbon-tab";
  label: string;
  isContextual = false;
  readonly groups: RibbonGroupModel[] = [];
  readonly overflowGroups: Writable<RibbonGroupModel[]> = writable([]);
  readonly isMoreMenuOpen: Writable<boolean> = writable(false);
  overflowWidth = 0;
  protected availableWidth = 0;

  constructor(label: string) {
    this.label = label;
  }

  addGroup(group: RibbonGroupModel) {
    let pos = this.groups.findIndex(existing => existing.el && group.el &&
      group.el.compareDocumentPosition(existing.el) & Node.DOCUMENT_POSITION_FOLLOWING);
    this.groups.splice(pos < 0 ? this.groups.length : pos, 0, group);
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

  closeMoreMenu() {
    this.isMoreMenuOpen.set(false);
  }

  setOverflowWidth(width: number) {
    if (this.overflowWidth == width) {
      return;
    }
    this.overflowWidth = width;
    this.fitGroups();
  }

  fitGroups() {
    if (!this.availableWidth) {
      return;
    }
    let stages = this.stagesFor(this.availableWidth);
    if (this.overflowWidth && this.groups.some((group, i) => group.isOverflowStage(stages[i]))) {
      stages = this.stagesFor(this.availableWidth - this.overflowWidth);
    }
    this.groups.forEach((group, i) => group.setStage(stages[i]));
    let overflowGroups = this.groups.filter(group => group.isOverflowStage(get(group.stage)));
    let old = get(this.overflowGroups);
    if (old.length != overflowGroups.length || old.some((group, i) => group != overflowGroups[i])) {
      this.overflowGroups.set(overflowGroups);
    }
  }

  protected stagesFor(availableWidth: number): number[] {
    let stages = this.groups.map(() => 0);
    let widths = this.groups.map(group => group.widthAt(0));
    let totalWidth = widths.reduce((sum, width) => sum + width, 0);
    let maxStage = Math.max(0, ...this.groups.map(group => group.lastStage));
    let reducedInLastPass: { index: number, previousStage: number, previousWidth: number }[] = [];
    for (let stage = 1; stage <= maxStage && totalWidth > availableWidth; stage++) {
      reducedInLastPass = [];
      for (let i = this.groups.length - 1; i >= 0 && totalWidth > availableWidth; i--) {
        let group = this.groups[i];
        if (stage > group.lastStage) {
          continue;
        }
        let width = group.widthAt(stage);
        if (width >= widths[i]) {
          continue;
        }
        reducedInLastPass.push({ index: i, previousStage: stages[i], previousWidth: widths[i] });
        totalWidth -= widths[i] - width;
        widths[i] = width;
        stages[i] = stage;
      }
    }
    for (let reduced of reducedInLastPass.reverse()) {
      let i = reduced.index;
      let restoredTotal = totalWidth - widths[i] + reduced.previousWidth;
      if (restoredTotal <= availableWidth) {
        totalWidth = restoredTotal;
        widths[i] = reduced.previousWidth;
        stages[i] = reduced.previousStage;
      }
    }
    return stages;
  }
}

export class RibbonGroupModel {
  static readonly contextKey = "lookout-ribbon-group";
  static readonly buttonRowKey = "lookout-ribbon-button-row";
  label: string;
  firstIcon: ConstructorOfATypedSvelteComponent = null;
  stageWidths: number[] = [0];
  protected renderedWidths: number[] = [];
  protected itemsKey = "";
  readonly stage: Writable<number> = writable(0);
  readonly collapsed: Writable<boolean> = writable(false);
  readonly layout: Writable<RibbonLayout> = writable("classic");
  hasOverflowStage = false;
  el: HTMLElement = null;
  bodyEl: HTMLElement = null;

  constructor(label: string) {
    this.label = label;
  }

  offerIcon(icon: ConstructorOfATypedSvelteComponent) {
    if (!this.firstIcon && icon) {
      this.firstIcon = icon;
    }
  }

  get lastStage(): number {
    return this.stageWidths.length - 1;
  }

  widthAt(stage: number): number {
    return this.stageWidths[Math.min(stage, this.lastStage)] ?? 0;
  }

  isOverflowStage(stage: number): boolean {
    return this.hasOverflowStage && stage > 0 && stage == this.lastStage;
  }

  setStageWidths(widths: number[], hasOverflowStage = false, itemsKey = this.itemsKey) {
    this.forgetRenderedWidths(itemsKey);
    widths = widths.map((width, stage) => Math.max(width, this.renderedWidths[stage] ?? 0));
    this.stageWidths = widths.length ? widths : [0];
    this.hasOverflowStage = hasOverflowStage;
  }

  setRenderedWidth(stage: number, width: number, itemsKey = this.itemsKey) {
    this.forgetRenderedWidths(itemsKey);
    this.renderedWidths[stage] = width;
  }

  protected forgetRenderedWidths(itemsKey: string) {
    if (itemsKey != this.itemsKey) {
      this.itemsKey = itemsKey;
      this.renderedWidths = [];
    }
  }

  setWidths(expandedWidth: number, collapsedWidth: number) {
    this.setStageWidths([expandedWidth, collapsedWidth]);
  }

  setStage(stage: number) {
    let collapsed = stage > 0 && stage == this.lastStage;
    if (get(this.stage) != stage) {
      this.stage.set(stage);
    }
    if (get(this.collapsed) != collapsed) {
      this.collapsed.set(collapsed);
    }
  }

  static computeStageWidths(layout: RibbonLayout, items: RibbonItemInfo[], metrics: RibbonMetrics, labelWidth = 0): number[] {
    let chrome = metrics.groupChrome;
    if (layout == "simplified") {
      let row = (width: (item: RibbonItemInfo) => number) =>
        items.reduce((sum, item) => sum + width(item), 0) + metrics.gap * Math.max(0, items.length - 1) + chrome;
      let simplifiedWidths: number[] = [];
      simplifiedWidths[SimplifiedStage.Labels] = row(item => item.fixedWidth || metrics.simplifiedWidth);
      simplifiedWidths[SimplifiedStage.IconsOnly] = row(item => item.fixedWidth || metrics.simplifiedIconWidth);
      simplifiedWidths[SimplifiedStage.InMoreMenu] = 0;
      return simplifiedWidths;
    }
    let designed = RibbonGroupModel.columnsWidth(items.map(item => ({
      rows: item.size == "large" && !item.fixedWidth ? 3 : 1,
      width: item.fixedWidth || (item.size == "large" ? metrics.largeWidth : metrics.smallWidth),
    })), metrics.gap);
    let small = RibbonGroupModel.columnsWidth(items.map(item => ({
      rows: 1,
      width: item.fixedWidth || metrics.smallWidth,
    })), metrics.gap);
    let icons = RibbonGroupModel.columnsWidth(items.map(item => ({
      rows: 1,
      width: item.fixedWidth || metrics.smallIconWidth,
    })), metrics.gap);
    let classicWidths: number[] = [];
    classicWidths[ClassicStage.Designed] = Math.max(designed, labelWidth) + chrome;
    classicWidths[ClassicStage.SmallButtons] = Math.max(small, labelWidth) + chrome;
    classicWidths[ClassicStage.IconsOnly] = Math.max(icons, labelWidth) + chrome;
    classicWidths[ClassicStage.Collapsed] = metrics.largeWidth + chrome;
    return classicWidths;
  }

  static columnsWidth(cells: { rows: number, width: number }[], gap: number): number {
    const kRows = 3;
    let columns: number[] = [];
    let row = kRows;
    for (let cell of cells) {
      if (row + cell.rows > kRows) {
        columns.push(0);
        row = 0;
      }
      columns[columns.length - 1] = Math.max(columns[columns.length - 1], cell.width);
      row += cell.rows;
    }
    return columns.reduce((sum, width) => sum + width, 0) + gap * Math.max(0, columns.length - 1);
  }

  static buttonRowLook(layout: RibbonLayout, collapsed: boolean): RibbonItemLook {
    if (layout == "simplified") {
      return collapsed ? "list" : "simplified-icon";
    }
    return "small-icon";
  }

  static itemLook(layout: RibbonLayout, stage: number, collapsed: boolean, size: RibbonItemSize): RibbonItemLook {
    if (layout == "simplified") {
      return collapsed ? "list" : stage >= SimplifiedStage.IconsOnly ? "simplified-icon" : "simplified";
    }
    if (collapsed || stage == ClassicStage.Designed) {
      return size;
    }
    return stage >= ClassicStage.IconsOnly ? "small-icon" : "small";
  }
}

export class RibbonLabel {
  static largeLines(label: string, hasMenu: boolean): [string, string] {
    const kChevronChars = 2;
    let words: string[] = [];
    for (let word of label.split(" ").filter(word => word)) {
      if (words.length && !/[\p{L}\p{N}]/u.test(word)) {
        words[words.length - 1] += " " + word;
      } else {
        words.push(word);
      }
    }
    if (words.length < 2) {
      return [label, ""];
    }
    let split = 1;
    let splitLength = Infinity;
    for (let i = 1; i < words.length; i++) {
      let first = words.slice(0, i).join(" ").length;
      let second = words.slice(i).join(" ").length + (hasMenu ? kChevronChars : 0);
      if (Math.max(first, second) <= splitLength) {
        split = i;
        splitLength = Math.max(first, second);
      }
    }
    return [words.slice(0, split).join(" "), words.slice(split).join(" ")];
  }
}
