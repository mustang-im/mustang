// @vitest-environment happy-dom
import { RulesTestAccount } from "./RulesTestAccount";
import { FilterRuleAction } from "../../../../logic/Mail/FilterRules/FilterRuleAction";
import { getTagByName } from "../../../../logic/Abstract/Tag";
import { RuleEdit } from "../../../Mail/Rules/RuleEdit";
import { expect, test } from "vitest";

test("New rule: needs name and action, save adds it", async () => {
  let account = RulesTestAccount.create("a", ["Inbox"]);
  account.save = async () => {};
  let edit = new RuleEdit(new FilterRuleAction(account));
  expect(edit.isNew).toBe(true);
  expect(edit.disabledReason).toBe("Please enter a name for the rule");
  edit.rule.name = "Invoices";
  expect(edit.disabledReason).toBe("Please select at least one action");
  edit.rule.markAsRead = true;
  expect(edit.disabledReason).toBeNull();
  await edit.save();
  expect(account.filterRuleActions.contents).toEqual([edit.rule]);
});

test("Broken target folder can't be saved", () => {
  let account = RulesTestAccount.create("a", ["Inbox"]);
  let rule = new FilterRuleAction(account);
  rule.name = "Old";
  rule.toFolderID = "gone";
  expect(new RuleEdit(rule).disabledReason).toBe("The target folder does not exist anymore");
});

test("Discard restores an existing rule", () => {
  let account = RulesTestAccount.create("a", ["Inbox", "Archive"]);
  let rule = new FilterRuleAction(account);
  rule.name = "Archive invoices";
  rule.criteria.bodyText = "invoice";
  rule.toFolder = RulesTestAccount.folder(account, "Archive");
  rule.addTags.add(getTagByName("Finance"));
  account.filterRuleActions.add(rule);

  let edit = new RuleEdit(rule);
  expect(edit.isNew).toBe(false);
  rule.name = "Changed";
  rule.criteria.bodyText = "bill";
  rule.toFolder = null;
  rule.addTags.clear();
  rule.markAsStarred = true;
  edit.discard();

  expect(rule.name).toBe("Archive invoices");
  expect(rule.criteria.bodyText).toBe("invoice");
  expect(rule.toFolder?.name).toBe("Archive");
  expect(rule.addTags.contents.map(tag => tag.name)).toEqual(["Finance"]);
  expect(rule.markAsStarred).toBeFalsy();
  expect(rule.criteria.account).toBe(account);
});

test("Discard of a new rule leaves the list alone", () => {
  let account = RulesTestAccount.create("a", ["Inbox"]);
  let edit = new RuleEdit(new FilterRuleAction(account));
  edit.rule.name = "Draft";
  edit.discard();
  expect(account.filterRuleActions.isEmpty).toBe(true);
});
