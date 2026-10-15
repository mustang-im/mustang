// @vitest-environment happy-dom
import { RulesTestAccount } from "./RulesTestAccount";
import { FilterRuleAction } from "../../../../logic/Mail/FilterRules/FilterRuleAction";
import { FilterMoment } from "../../../../logic/Mail/FilterRules/FilterMoments";
import { Person, ContactEntry } from "../../../../logic/Abstract/Person";
import { getTagByName } from "../../../../logic/Abstract/Tag";
import { RuleDescription } from "../../../Mail/Rules/RuleDescription";
import { expect, test } from "vitest";

function texts(rule: FilterRuleAction): string[] {
  return RuleDescription.lines(rule).map(line => line.text);
}

test("When line by moment", () => {
  let rule = new FilterRuleAction(RulesTestAccount.create("a", ["Inbox"]));
  expect(texts(rule)[0]).toBe("Apply this rule after the message arrives");
  rule.when = FilterMoment.IncomingAfterSpam;
  expect(texts(rule)[0]).toBe("Apply this rule after the message arrives and after the junk check");
  rule.when = FilterMoment.Outgoing;
  expect(texts(rule)[0]).toBe("Apply this rule after I send the message");
});

test("Move from a person", () => {
  let account = RulesTestAccount.create("a", ["Inbox", "Music"]);
  let person = new Person();
  person.name = "Music Discussion";
  person.emailAddresses.add(new ContactEntry("music@example.com", "work"));
  let rule = new FilterRuleAction(account);
  rule.criteria.includesPerson = person;
  rule.toFolder = RulesTestAccount.folder(account, "Music");
  expect(texts(rule)).toEqual([
    "Apply this rule after the message arrives",
    "from or to Music Discussion",
    "move it to the Music folder",
  ]);
  expect(RuleDescription.hasAction(rule)).toBe(true);
  expect(RuleDescription.isBroken(rule)).toBe(false);
});

test("Conditions and actions in Outlook order", () => {
  let account = RulesTestAccount.create("a", ["Inbox", "Archive"]);
  let rule = new FilterRuleAction(account);
  rule.criteria.bodyText = "invoice";
  rule.criteria.hasAttachment = true;
  rule.criteria.isRead = false;
  rule.criteria.isStarred = true;
  rule.criteria.tags.add(getTagByName("Work"));
  rule.markAsRead = true;
  rule.markAsStarred = true;
  rule.addTags.add(getTagByName("Finance"));
  rule.toFolder = RulesTestAccount.folder(account, "Archive");
  rule.copy = true;
  expect(texts(rule)).toEqual([
    "Apply this rule after the message arrives",
    "with invoice in the subject or body",
    "which has an attachment",
    "assigned to Work category",
    "which is unread",
    "which is flagged",
    "mark it as read",
    "flag it",
    "assign it to the Finance category",
    "move a copy to the Archive folder",
  ]);
});

test("Size in KB", () => {
  let rule = new FilterRuleAction(RulesTestAccount.create("a", ["Inbox"]));
  rule.criteria.sizeMin = 100 * 1024;
  rule.criteria.sizeMax = 2048 * 1024;
  expect(texts(rule)).toContain("with a size between 100 and 2048 KB");
  rule.criteria.sizeMax = null;
  expect(texts(rule)).toContain("with a size of at least 100 KB");
});

test("Delete wins over move, permanent delete wins over delete", () => {
  let account = RulesTestAccount.create("a", ["Inbox", "Archive"]);
  let rule = new FilterRuleAction(account);
  rule.toFolder = RulesTestAccount.folder(account, "Archive");
  rule.deleteTrash = true;
  expect(RuleDescription.actionLines(rule).map(line => line.text)).toEqual(["delete it"]);
  rule.deleteImmediately = true;
  expect(RuleDescription.actionLines(rule).map(line => line.text)).toEqual(["permanently delete it"]);
});

test("No action", () => {
  let rule = new FilterRuleAction(RulesTestAccount.create("a", ["Inbox"]));
  rule.criteria.bodyText = "x";
  expect(RuleDescription.hasAction(rule)).toBe(false);
});

test("Missing target folder is broken", () => {
  let rule = new FilterRuleAction(RulesTestAccount.create("a", ["Inbox"]));
  rule.toFolderID = "gone";
  expect(RuleDescription.isBroken(rule)).toBe(true);
  expect(texts(rule)).toContain("move it to the missing folder");
});

test("Parts mark the values", () => {
  let parts = RuleDescription.parts({ text: "with a size between 10 and 20 KB", values: ["10", "20"] });
  expect(parts).toEqual([
    { text: "with a size between ", isValue: false },
    { text: "10", isValue: true },
    { text: " and ", isValue: false },
    { text: "20", isValue: true },
    { text: " KB", isValue: false },
  ]);
});

test("Parts without values", () => {
  expect(RuleDescription.parts({ text: "flag it", values: [] })).toEqual([{ text: "flag it", isValue: false }]);
});
