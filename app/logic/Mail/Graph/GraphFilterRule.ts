import { ServerFilterRule } from "../FilterRules/ServerFilterRule";
import type { FilterRuleAction } from "../FilterRules/FilterRuleAction";
import { getTagByName } from "../../Abstract/Tag";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { NotSupported } from "../../util/util";
import { gt } from "../../../l10n/l10n";

/** A rule that the Exchange server runs on incoming mail, as `messageRule` of MS Graph.
 * <https://learn.microsoft.com/en-us/graph/api/resources/messagerule> */
export class GraphFilterRule extends ServerFilterRule {
  protected readonly canCheckDates = false;

  get id(): string | null {
    return sanitize.nonemptystring(this.json.id, null);
  }

  get priority(): number {
    return sanitize.integer(this.json.sequence, 0);
  }

  get isReadOnly(): boolean {
    return this.json.isReadOnly === true;
  }

  protected fillFilterRule(rule: FilterRuleAction) {
    rule.name = sanitize.nonemptylabel(this.json.displayName, "-");
    let conditions = this.json.conditions ?? {};
    let criteria = rule.criteria;
    criteria.bodyText = this.strings(conditions.bodyOrSubjectContains)[0] ?? null;
    criteria.includesPersonEMail = sanitize.emailAddress(conditions.fromAddresses?.[0]?.emailAddress?.address, null);
    criteria.tags.replaceAll(this.strings(conditions.categories).map(name => getTagByName(name)));
    criteria.hasAttachment = conditions.hasAttachments === true ? true : null;
    criteria.isStarred = conditions.messageActionFlag ? true : null;
    let sizeMin = sanitize.integer(conditions.withinSizeRange?.minimumSize, null);
    let sizeMax = sanitize.integer(conditions.withinSizeRange?.maximumSize, null);
    criteria.sizeMin = sizeMin ? sizeMin * 1024 : null;
    criteria.sizeMax = sizeMax ? sizeMax * 1024 : null;

    let actions = this.json.actions ?? {};
    rule.markAsRead = actions.markAsRead === true ? true : null;
    rule.deleteTrash = actions.delete === true ? true : null;
    rule.deleteImmediately = actions.permanentDelete === true ? true : null;
    rule.toFolderID = sanitize.nonemptystring(actions.moveToFolder ?? actions.copyToFolder, null);
    rule.copy = !actions.moveToFolder && actions.copyToFolder ? true : null;
    rule.addTags.replaceAll(this.strings(actions.assignCategories).map(name => getTagByName(name)));
  }

  withChangesFrom(rule: FilterRuleAction, priority: number): GraphFilterRule {
    this.checkSupported(rule);
    let original = this.toFilterRule(rule.account);
    let json = structuredClone(this.json);
    if (rule.name != original.name) {
      json.displayName = rule.name;
    }
    json.isEnabled ??= true;
    let conditions = structuredClone(json.conditions ?? {});
    if (Object.keys(this.merge(conditions, this.conditionsOf(rule), this.conditionsOf(original))).length) {
      json.conditions = conditions;
    }
    let actions = structuredClone(json.actions ?? {});
    if (Object.keys(this.merge(actions, this.actionsOf(rule), this.actionsOf(original))).length) {
      json.actions = actions;
    }
    if (this.isReadOnly && new GraphFilterRule(json).isChangedFrom(this)) {
      throw new NotSupported(gt`The mail server does not allow changes to the rule ${rule.name}`);
    }
    json.sequence = priority;
    return new GraphFilterRule(json);
  }

  protected conditionsOf(rule: FilterRuleAction): Record<string, any> {
    let criteria = rule.criteria;
    let conditions: Record<string, any> = {};
    if (criteria.bodyText) {
      conditions.bodyOrSubjectContains = [criteria.bodyText];
    }
    if (criteria.includesPersonEMail) {
      conditions.fromAddresses = [{ emailAddress: { address: criteria.includesPersonEMail } }];
    }
    if (criteria.tags.hasItems) {
      conditions.categories = criteria.tags.contents.map(tag => tag.name);
    }
    if (criteria.hasAttachment) {
      conditions.hasAttachments = true;
    }
    if (criteria.isStarred) {
      conditions.messageActionFlag = "any";
    }
    if (criteria.sizeMin || criteria.sizeMax) {
      conditions.withinSizeRange = {};
      if (criteria.sizeMin) {
        conditions.withinSizeRange.minimumSize = Math.floor(criteria.sizeMin / 1024);
      }
      if (criteria.sizeMax) {
        conditions.withinSizeRange.maximumSize = Math.ceil(criteria.sizeMax / 1024);
      }
    }
    return conditions;
  }

  protected actionsOf(rule: FilterRuleAction): Record<string, any> {
    let actions: Record<string, any> = {};
    if (rule.addTags.hasItems) {
      actions.assignCategories = rule.addTags.contents.map(tag => tag.name);
    }
    if (rule.toFolderID) {
      actions[rule.copy ? "copyToFolder" : "moveToFolder"] = rule.toFolderID;
    }
    if (rule.deleteTrash) {
      actions.delete = true;
    }
    if (rule.markAsRead) {
      actions.markAsRead = true;
    }
    if (rule.deleteImmediately) {
      actions.permanentDelete = true;
    }
    return actions;
  }

  /** For creating the rule */
  get newProperties(): Record<string, any> {
    let { displayName, sequence, isEnabled, conditions, actions } = this.json;
    return { displayName, sequence, isEnabled, conditions, actions };
  }

  /** For changing the rule. The server replaces the conditions and actions as a whole. */
  changedProperties(original: GraphFilterRule): Record<string, any> {
    let changes: Record<string, any> = {};
    for (let key of ["displayName", "sequence", "conditions", "actions"]) {
      if (JSON.stringify(this.json[key]) != JSON.stringify(original.json[key])) {
        changes[key] = this.json[key] ?? null;
      }
    }
    return changes;
  }
}
