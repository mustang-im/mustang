import { RibbonCustomization } from "../../Shared/Ribbon/RibbonCustomization";
import { expect, test } from "vitest";

test("Hidden tabs and groups are per ribbon", () => {
  let all = RibbonCustomization.withHiddenParts({}, "mail", { tabs: ["Folder"], groups: [RibbonCustomization.groupKey("Home", "Respond")] });
  expect(RibbonCustomization.isTabHidden("mail", "Folder", all)).toBe(true);
  expect(RibbonCustomization.isTabHidden("calendar", "Folder", all)).toBe(false);
  expect(RibbonCustomization.isGroupHidden("mail", "Home", "Respond", all)).toBe(true);
  expect(RibbonCustomization.isGroupHidden("mail", "Home", "Delete", all)).toBe(false);
  expect(RibbonCustomization.isGroupHidden("calendar", "Home", "Respond", all)).toBe(false);
});

test("Showing everything again removes the ribbon's entry, other ribbons stay", () => {
  let all = RibbonCustomization.withHiddenParts({}, "mail", { tabs: ["View"], groups: [] });
  all = RibbonCustomization.withHiddenParts(all, "calendar", { tabs: [], groups: ["Home/Share"] });
  all = RibbonCustomization.withHiddenParts(all, "mail", { tabs: [], groups: [] });
  expect(Object.keys(all)).toEqual(["calendar"]);
  expect(RibbonCustomization.hiddenParts("mail", all)).toEqual({ tabs: [], groups: [] });
});

test("Missing or broken settings mean nothing is hidden", () => {
  expect(RibbonCustomization.hiddenParts("mail", null)).toEqual({ tabs: [], groups: [] });
  expect(RibbonCustomization.isTabHidden("mail", "Home", { mail: {} as any })).toBe(false);
});
