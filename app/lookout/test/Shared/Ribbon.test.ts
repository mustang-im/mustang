// @vitest-environment happy-dom
import { RibbonGroupModel, RibbonModel, RibbonTabModel } from "../../Shared/Ribbon/Ribbon";
import { expect, test } from "vitest";
import { get } from "svelte/store";

function makeGroup(label: string, expandedWidth: number, collapsedWidth = 82): RibbonGroupModel {
  let group = new RibbonGroupModel(label);
  group.setWidths(expandedWidth, collapsedWidth);
  return group;
}

function collapsedStates(tab: RibbonTabModel): boolean[] {
  return tab.groups.map(group => get(group.collapsed));
}

test("All groups fit: nothing collapses", () => {
  let tab = new RibbonTabModel("Home");
  tab.addGroup(makeGroup("New", 154));
  tab.addGroup(makeGroup("Delete", 226));
  tab.setAvailableWidth(1000);
  expect(collapsedStates(tab)).toEqual([false, false]);
});

test("Groups collapse from the end until the rest fits", () => {
  let tab = new RibbonTabModel("Home");
  tab.addGroup(makeGroup("New", 154));
  tab.addGroup(makeGroup("Delete", 226));
  tab.addGroup(makeGroup("Respond", 226));
  tab.addGroup(makeGroup("Tags", 226));
  // total 832. Collapsing "Tags" saves 144 -> 688
  tab.setAvailableWidth(700);
  expect(collapsedStates(tab)).toEqual([false, false, false, true]);
  // Collapsing "Respond" too saves another 144 -> 544
  tab.setAvailableWidth(600);
  expect(collapsedStates(tab)).toEqual([false, false, true, true]);
  // Growing again expands them again
  tab.setAvailableWidth(900);
  expect(collapsedStates(tab)).toEqual([false, false, false, false]);
});

test("Groups with one button never collapse, because it saves no space", () => {
  let tab = new RibbonTabModel("Home");
  tab.addGroup(makeGroup("New", 154));
  tab.addGroup(makeGroup("Delete", 226));
  tab.addGroup(makeGroup("Find", 82));
  tab.setAvailableWidth(400);
  expect(collapsedStates(tab)).toEqual([false, true, false]);
});

test("No width known yet: nothing collapses", () => {
  let tab = new RibbonTabModel("Home");
  tab.addGroup(makeGroup("New", 5000));
  expect(collapsedStates(tab)).toEqual([false]);
});

test("Removing a group re-fits the others", () => {
  let tab = new RibbonTabModel("Home");
  let big = makeGroup("Big", 600);
  tab.addGroup(makeGroup("New", 154));
  tab.addGroup(makeGroup("Delete", 226));
  tab.addGroup(big);
  // total 980. Collapsing "Big" saves 518 -> 462
  tab.setAvailableWidth(500);
  expect(collapsedStates(tab)).toEqual([false, false, true]);
  // Collapsing "Delete" too saves 144 -> 318
  tab.setAvailableWidth(350);
  expect(collapsedStates(tab)).toEqual([false, true, true]);
  // Without "Big": 380, "Delete" stays collapsed until there are 380 pixels
  tab.removeGroup(big);
  expect(collapsedStates(tab)).toEqual([false, true]);
  tab.setAvailableWidth(400);
  expect(collapsedStates(tab)).toEqual([false, false]);
});

function stages(tab: RibbonTabModel): number[] {
  return tab.groups.map(group => get(group.stage));
}

function makeSimplifiedGroup(label: string, labelsWidth: number, iconsWidth: number): RibbonGroupModel {
  let group = new RibbonGroupModel(label);
  group.setStageWidths([labelsWidth, iconsWidth, 0], true);
  return group;
}

test("Simplified: groups first show only icons, from the end", () => {
  let tab = new RibbonTabModel("Home");
  tab.addGroup(makeSimplifiedGroup("New", 250, 86));
  tab.addGroup(makeSimplifiedGroup("Respond", 300, 110));
  tab.addGroup(makeSimplifiedGroup("Tags", 280, 120));
  // total 830
  tab.setAvailableWidth(900);
  expect(stages(tab)).toEqual([0, 0, 0]);
  // Icons only for "Tags" saves 160 -> 670
  tab.setAvailableWidth(700);
  expect(stages(tab)).toEqual([0, 0, 1]);
  expect(collapsedStates(tab)).toEqual([false, false, false]);
  // Icons only for "Respond" too saves 190 -> 480
  tab.setAvailableWidth(500);
  expect(stages(tab)).toEqual([0, 1, 1]);
});

test("Simplified: when a wide group on the left must show only icons, the groups on its right get their labels back", () => {
  let tab = new RibbonTabModel("Search");
  tab.addGroup(makeSimplifiedGroup("Refine", 920, 330));
  tab.addGroup(makeSimplifiedGroup("Scope", 340, 130));
  tab.addGroup(makeSimplifiedGroup("Options", 340, 130));
  tab.addGroup(makeSimplifiedGroup("Close", 115, 45));
  // total 1715. Icons only from the end: Close, Options, Scope -> 1225, still too wide, Refine -> 635.
  // Then Scope (845) and Options (1055) fit with labels again, Close (1125) doesn't.
  tab.setAvailableWidth(1100);
  expect(stages(tab)).toEqual([1, 0, 0, 1]);
});

test("Simplified: groups move into the More menu only when all of them show only icons", () => {
  let tab = new RibbonTabModel("Home");
  tab.setOverflowWidth(50);
  tab.addGroup(makeSimplifiedGroup("New", 250, 86));
  tab.addGroup(makeSimplifiedGroup("Respond", 300, 110));
  tab.addGroup(makeSimplifiedGroup("Tags", 280, 120));
  // All icons only: 316. "Tags" into the More menu saves 120, but the More button takes 50 -> 246
  tab.setAvailableWidth(300);
  expect(stages(tab)).toEqual([1, 1, 2]);
  expect(collapsedStates(tab)).toEqual([false, false, true]);
  expect(get(tab.overflowGroups).map(group => group.label)).toEqual(["Tags"]);
  // 250 still fits: 196 for the icons of "New" and "Respond", plus 50 for the More button
  tab.setAvailableWidth(250);
  expect(stages(tab)).toEqual([1, 1, 2]);
  // 240: also "Respond" into the More menu
  tab.setAvailableWidth(240);
  expect(stages(tab)).toEqual([1, 2, 2]);
  expect(get(tab.overflowGroups).map(group => group.label)).toEqual(["Respond", "Tags"]);
  // Growing again shows the labels again
  tab.setAvailableWidth(1000);
  expect(stages(tab)).toEqual([0, 0, 0]);
  expect(get(tab.overflowGroups)).toEqual([]);
});

test("Classic: large buttons become small, then icons only, before any group collapses", () => {
  let tab = new RibbonTabModel("Home");
  let metrics = { largeWidth: 80, smallWidth: 120, smallIconWidth: 36, simplifiedWidth: 110, simplifiedIconWidth: 40, gap: 2, groupChrome: 10 };
  let newGroup = new RibbonGroupModel("New");
  newGroup.setStageWidths(RibbonGroupModel.computeStageWidths("classic", [{ size: "large" }, { size: "large" }], metrics));
  let respond = new RibbonGroupModel("Respond");
  respond.setStageWidths(RibbonGroupModel.computeStageWidths("classic", [{ size: "small" }, { size: "small" }, { size: "small" }, { size: "small" }], metrics));
  tab.addGroup(newGroup);
  tab.addGroup(respond);
  expect(newGroup.stageWidths).toEqual([172, 130, 46, 90]);
  expect(respond.stageWidths).toEqual([252, 252, 84, 90]);
  // 424 fits
  tab.setAvailableWidth(424);
  expect(stages(tab)).toEqual([0, 0]);
  // "Respond" has no large buttons, so "New" gets small buttons first: 382
  tab.setAvailableWidth(400);
  expect(stages(tab)).toEqual([1, 0]);
  // Then icons only, from the end: 130 + 84 = 214
  tab.setAvailableWidth(300);
  expect(stages(tab)).toEqual([1, 2]);
  // Collapsing saves nothing here, icons only is narrower
  tab.setAvailableWidth(100);
  expect(stages(tab)).toEqual([2, 2]);
  expect(collapsedStates(tab)).toEqual([false, false]);
});

test("Classic: a group with a text box collapses after its buttons show only icons", () => {
  let metrics = { largeWidth: 80, smallWidth: 120, smallIconWidth: 36, simplifiedWidth: 110, simplifiedIconWidth: 40, gap: 2, groupChrome: 10 };
  let widths = RibbonGroupModel.computeStageWidths("classic", [{ size: "small", fixedWidth: 160 }, { size: "small" }, { size: "small" }], metrics);
  // One column of 3 rows, as wide as the text box
  expect(widths).toEqual([170, 170, 170, 90]);
  let tab = new RibbonTabModel("Home");
  let find = new RibbonGroupModel("Find");
  find.setStageWidths(widths);
  tab.addGroup(find);
  tab.setAvailableWidth(120);
  expect(stages(tab)).toEqual([3]);
  expect(collapsedStates(tab)).toEqual([true]);
});

test("Classic: small buttons fill columns of 3, a large button starts a new column", () => {
  // small, large, small, small, small, small
  let cells = [
    { rows: 1, width: 100 },
    { rows: 3, width: 80 },
    { rows: 1, width: 100 },
    { rows: 1, width: 120 },
    { rows: 1, width: 100 },
    { rows: 1, width: 100 },
  ];
  // Columns: [100] [80] [100, 120, 100] [100]
  expect(RibbonGroupModel.columnsWidth(cells, 2)).toBe(100 + 80 + 120 + 100 + 3 * 2);
  expect(RibbonGroupModel.columnsWidth([], 2)).toBe(0);
});

test("Simplified: one row, uniform widths", () => {
  let metrics = { largeWidth: 80, smallWidth: 120, smallIconWidth: 36, simplifiedWidth: 110, simplifiedIconWidth: 40, gap: 2, groupChrome: 10 };
  let widths = RibbonGroupModel.computeStageWidths("simplified", [{ size: "large" }, { size: "small" }, { size: "small", fixedWidth: 150 }], metrics);
  expect(widths).toEqual([110 + 110 + 150 + 4 + 10, 40 + 40 + 150 + 4 + 10, 0]);
});

test("Button look depends on layout, stage and size", () => {
  expect(RibbonGroupModel.itemLook("classic", 0, false, "large")).toBe("large");
  expect(RibbonGroupModel.itemLook("classic", 0, false, "small")).toBe("small");
  expect(RibbonGroupModel.itemLook("classic", 1, false, "large")).toBe("small");
  expect(RibbonGroupModel.itemLook("classic", 2, false, "large")).toBe("small-icon");
  // The popup of a collapsed group shows the buttons as designed
  expect(RibbonGroupModel.itemLook("classic", 3, true, "large")).toBe("large");
  expect(RibbonGroupModel.itemLook("simplified", 0, false, "large")).toBe("simplified");
  expect(RibbonGroupModel.itemLook("simplified", 1, false, "small")).toBe("simplified-icon");
  expect(RibbonGroupModel.itemLook("simplified", 2, true, "small")).toBe("list");
});

test("First button icon is the group icon", () => {
  let group = new RibbonGroupModel("New");
  let firstIcon = (() => null) as any;
  let secondIcon = (() => null) as any;
  group.offerIcon(null);
  group.offerIcon(firstIcon);
  group.offerIcon(secondIcon);
  expect(group.firstIcon).toBe(firstIcon);
});

test("Tabs: first added tab is selected, removing it selects the next", () => {
  let ribbon = new RibbonModel();
  let home = new RibbonTabModel("Home");
  let view = new RibbonTabModel("View");
  ribbon.addTab(home);
  ribbon.addTab(view);
  expect(get(ribbon.selectedTab)).toBe(home);
  expect(get(ribbon.tabs)).toEqual([home, view]);
  ribbon.removeTab(home);
  expect(get(ribbon.selectedTab)).toBe(view);
  ribbon.setTabLabel(view, "Ansicht");
  expect(get(ribbon.tabs)[0].label).toBe("Ansicht");
});

test("Layout setting", () => {
  let ribbon = new RibbonModel();
  ribbon.setLayout("simplified");
  expect(ribbon.currentLayout).toBe("simplified");
  ribbon.layout.value = "bogus" as any;
  expect(ribbon.currentLayout).toBe("classic");
  ribbon.setLayout("classic");
  ribbon.setCollapsed(true);
  expect(ribbon.collapsed.value).toBe(true);
  ribbon.setCollapsed(false);
});

test("Select a tab by its label", () => {
  let ribbon = new RibbonModel();
  let home = new RibbonTabModel("Home");
  let search = new RibbonTabModel("Search");
  ribbon.addTab(home);
  ribbon.addTab(search);
  ribbon.selectTabByLabel("Search");
  expect(get(ribbon.selectedTab)).toBe(search);
  // An unknown label keeps the selection
  ribbon.selectTabByLabel("Nonexistent");
  expect(get(ribbon.selectedTab)).toBe(search);
});

test("Buttons in a button row are icon-only, also in the simplified ribbon, and list items in the More menu", () => {
  expect(RibbonGroupModel.buttonRowLook("classic", false)).toBe("small-icon");
  expect(RibbonGroupModel.buttonRowLook("classic", true)).toBe("small-icon");
  expect(RibbonGroupModel.buttonRowLook("simplified", false)).toBe("simplified-icon");
  expect(RibbonGroupModel.buttonRowLook("simplified", true)).toBe("list");
});
