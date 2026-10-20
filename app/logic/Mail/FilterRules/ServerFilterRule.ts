import { FilterRuleAction } from "./FilterRuleAction";
import { FilterMoment } from "./FilterMoments";
import type { MailAccount } from "../MailAccount";
import { AbstractFunction, booleanHasValue, NotSupported } from "../../util/util";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { gt } from "../../../l10n/l10n";

/** A filter rule that the server runs, in the format of the protocol.
 * It keeps the parts that we don't understand, so that saving the rule doesn't remove them. */
export class ServerFilterRule {
  /** As the server sent it */
  readonly json: any;
  protected readonly canCheckDates: boolean = true;
  protected readonly canCheckCategories: boolean = true;
  protected readonly canDeleteImmediately: boolean = true;

  constructor(json: any) {
    this.json = json ?? {};
  }

  get id(): string | null {
    throw new AbstractFunction();
  }

  /** The server runs the rules in the order of this number, lowest first */
  get priority(): number {
    throw new AbstractFunction();
  }

  /** The server doesn't allow to change the rule */
  get isReadOnly(): boolean {
    return false;
  }

  /** Our rule, with the parts of the server rule that we understand */
  toFilterRule(account: MailAccount): FilterRuleAction {
    let rule = new FilterRuleAction(account);
    rule.server = true;
    rule.serverID = this.id;
    rule.serverJSON = this.json;
    this.fillFilterRule(rule);
    return rule;
  }

  protected fillFilterRule(rule: FilterRuleAction) {
    throw new AbstractFunction();
  }

  /** The server rule, changed as the user changed `rule`.
   * Leaves the parts of the server rule as they are that the user did not change. */
  withChangesFrom(rule: FilterRuleAction, priority: number): ServerFilterRule {
    throw new AbstractFunction();
  }

  /** The server rule as the user wants it, compared to what we got from the server */
  isChangedFrom(original: ServerFilterRule): boolean {
    return JSON.stringify(this.json) != JSON.stringify(original.json);
  }

  /** Throws, if the server cannot run the rule as the user defined it */
  protected checkSupported(rule: FilterRuleAction) {
    let criteria = rule.criteria;
    if (rule.when == FilterMoment.Outgoing ||
        booleanHasValue(criteria.isOutgoing) || booleanHasValue(criteria.isRead) || booleanHasValue(criteria.isReplied) ||
        criteria.isStarred === false || criteria.hasAttachment === false ||
        criteria.messageID || criteria.threadID || criteria.folderID || criteria.hasAttachmentMIMETypes.hasItems ||
        !this.canCheckDates && (criteria.sentDateMin || criteria.sentDateMax) ||
        !this.canCheckCategories && criteria.tags.hasItems) {
      throw new NotSupported(gt`The mail server cannot check all criteria of the rule ${rule.name}`);
    }
    if (rule.markAsRead === false || booleanHasValue(rule.markAsStarred) || rule.markAsSpam ||
        !this.canDeleteImmediately && rule.deleteImmediately) {
      throw new NotSupported(gt`The mail server cannot do all actions of the rule ${rule.name}`);
    }
  }

  protected strings(json: any): string[] {
    return (Array.isArray(json) ? json : []).map(value => sanitize.nonemptystring(value, null)).filter(value => value);
  }

  /** Writes the properties that the user changed into the server properties.
   * @param server The properties of the server rule. Will be changed.
   * @param ours Our rule, in the format of the server
   * @param original The server rule as we understood it, in the format of the server
   * @returns The properties that the user changed. `undefined` for removed properties. */
  protected merge(server: Record<string, any>, ours: Record<string, any>, original: Record<string, any>): Record<string, any> {
    let changes: Record<string, any> = {};
    for (let key of new Set([...Object.keys(ours), ...Object.keys(original)])) {
      if (JSON.stringify(ours[key]) == JSON.stringify(original[key])) {
        continue;
      }
      changes[key] = ours[key];
      if (ours[key] === undefined) {
        delete server[key];
      } else {
        server[key] = ours[key];
      }
    }
    return changes;
  }
}
