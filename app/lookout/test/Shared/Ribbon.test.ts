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

function compactStates(tab: RibbonTabModel): boolean[] {
  return tab.groups.map(group => get(group.compact));
}

function makeSimplifiedGroup(label: string, expandedWidth: number, compactWidth: number): RibbonGroupModel {
  let group = new RibbonGroupModel(label);
  group.setWidths(expandedWidth, 54, compactWidth);
  return group;
}

test("Simplified: groups first show only icons, from the end", () => {
  let tab = new RibbonTabModel("Home");
  tab.addGroup(makeSimplifiedGroup("New", 250, 86));
  tab.addGroup(makeSimplifiedGroup("Respond", 300, 110));
  tab.addGroup(makeSimplifiedGroup("Tags", 280, 120));
  // total 830
  tab.setAvailableWidth(900);
  expect(compactStates(tab)).toEqual([false, false, false]);
  expect(collapsedStates(tab)).toEqual([false, false, false]);
  // Icons only for "Tags" saves 160 -> 670
  tab.setAvailableWidth(700);
  expect(compactStates(tab)).toEqual([false, false, true]);
  expect(collapsedStates(tab)).toEqual([false, false, false]);
  // Icons only for "Respond" too saves 190 -> 480
  tab.setAvailableWidth(500);
  expect(compactStates(tab)).toEqual([false, true, true]);
  expect(collapsedStates(tab)).toEqual([false, false, false]);
});

test("Simplified: groups collapse only when all of them show only icons", () => {
  let tab = new RibbonTabModel("Home");
  tab.addGroup(makeSimplifiedGroup("New", 250, 86));
  tab.addGroup(makeSimplifiedGroup("Respond", 300, 110));
  tab.addGroup(makeSimplifiedGroup("Tags", 280, 120));
  // All icons only: 316. Collapsing "Tags" saves 66 -> 250
  tab.setAvailableWidth(300);
  expect(compactStates(tab)).toEqual([true, true, false]);
  expect(collapsedStates(tab)).toEqual([false, false, true]);
  // Growing again shows the labels again
  tab.setAvailableWidth(1000);
  expect(compactStates(tab)).toEqual([false, false, false]);
  expect(collapsedStates(tab)).toEqual([false, false, false]);
});

test("Classic: without an icon-only width, groups never become compact", () => {
  let tab = new RibbonTabModel("Home");
  tab.addGroup(makeGroup("New", 154));
  tab.addGroup(makeGroup("Delete", 226));
  tab.setAvailableWidth(300);
  expect(compactStates(tab)).toEqual([false, false]);
  expect(collapsedStates(tab)).toEqual([false, true]);
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
