import { RibbonCustomization } from "../../../Shared/Ribbon/RibbonCustomization";
import { expect, test } from "vitest";

test("Hidden tabs and groups are stored per ribbon", () => {
  let all = RibbonCustomization.withHiddenParts({}, "mail", { tabs: ["Folder"], groups: ["Home/Respond"] });
  expect(all).toEqual({ mail: { tabs: ["Folder"], groups: ["Home/Respond"] } });
});

test("Showing everything again removes the ribbon's entry, other ribbons stay", () => {
  let all = RibbonCustomization.withHiddenParts({}, "mail", { tabs: ["View"], groups: [] });
  all = RibbonCustomization.withHiddenParts(all, "calendar", { tabs: [], groups: ["Home/Share"] });
  all = RibbonCustomization.withHiddenParts(all, "mail", { tabs: [], groups: [] });
  expect(Object.keys(all)).toEqual(["calendar"]);
});

test("Missing settings start empty", () => {
  expect(RibbonCustomization.withHiddenParts(null, "mail", { tabs: ["View"], groups: [] })).toEqual({ mail: { tabs: ["View"], groups: [] } });
});
