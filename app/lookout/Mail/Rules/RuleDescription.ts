import type { FilterRuleAction } from "../../../logic/Mail/FilterRules/FilterRuleAction";
import type { MailAccount } from "../../../logic/Mail/MailAccount";
import { FilterMoment } from "../../../logic/Mail/FilterRules/FilterMoments";
import { RuleItems, type RuleItem, type RulePhrasePart } from "./RuleItems";
import { gt } from "../../../l10n/l10n";

export interface RuleDescriptionLine {
  item: RuleItem | null;
  parts: RulePhrasePart[];
}

export class RuleDescription {
  static lines(rule: FilterRuleAction, checkedIDs?: Set<string>): RuleDescriptionLine[] {
    let items = checkedIDs
      ? RuleItems.all().filter(item => checkedIDs.has(item.id))
      : RuleDescription.activeItems(rule);
    return [
      { item: null, parts: [{ text: RuleDescription.whenText(rule.when), isValue: false }] },
      ...items.map(item => ({ item, parts: item.descriptionParts(rule) })),
    ];
  }

  static texts(rule: FilterRuleAction, checkedIDs?: Set<string>): string[] {
    return RuleDescription.lines(rule, checkedIDs).map(line => RuleDescription.text(line));
  }

  static text(line: RuleDescriptionLine): string {
    return line.parts.map(part => part.text).join("");
  }

  static whenText(when: FilterMoment): string {
    switch (when) {
      case FilterMoment.IncomingAfterSpam:
        return gt`Apply this rule after the message arrives and after the junk check`;
      case FilterMoment.Outgoing:
        return gt`Apply this rule after I send the message`;
      default:
        return gt`Apply this rule after the message arrives`;
    }
  }

  static activeItems(rule: FilterRuleAction): RuleItem[] {
    return RuleItems.all().filter(item => item.isActive(rule));
  }

  static hasAction(rule: FilterRuleAction): boolean {
    return RuleItems.actions().some(item => item.isActive(rule));
  }

  static isBroken(rule: FilterRuleAction): boolean {
    return (!!rule.toFolderID && !rule.toFolder) ||
      (!!rule.criteria.folderID && !rule.criteria.folder);
  }

  static inboxLabel(account: MailAccount): string {
    let inbox = account.inbox?.name || gt`Inbox`;
    return `${inbox} [${account.emailAddress || account.name}]`;
  }
}
