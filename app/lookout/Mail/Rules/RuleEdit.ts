import type { FilterRuleAction } from "../../../logic/Mail/FilterRules/FilterRuleAction";
import { RuleDescription } from "./RuleDescription";
import { gt } from "../../../l10n/l10n";

export class RuleEdit {
  readonly rule: FilterRuleAction;
  readonly isNew: boolean;
  protected readonly savedJSON: any;

  constructor(rule: FilterRuleAction) {
    this.rule = rule;
    this.isNew = !rule.account.filterRuleActions.contains(rule);
    this.savedJSON = JSON.parse(JSON.stringify(rule.toJSON()));
  }

  get disabledReason(): string | null {
    if (!this.rule.name?.trim()) {
      return gt`Please enter a name for the rule`;
    }
    if (!RuleDescription.hasAction(this.rule)) {
      return gt`Please select at least one action`;
    }
    if (RuleDescription.isBroken(this.rule)) {
      return gt`The target folder does not exist anymore`;
    }
    return null;
  }

  async save() {
    // <copied from="../../../frontend/Settings/Mail/Rules.svelte" onSave()>
    if (!this.rule.account.filterRuleActions.contains(this.rule)) {
      this.rule.account.filterRuleActions.add(this.rule);
    }
    await this.rule.account.save();
    // </copied>
  }

  discard() {
    if (this.isNew) {
      return;
    }
    this.rule.fromJSON(this.savedJSON);
  }
}
