import { ServerFilterRule } from "../FilterRules/ServerFilterRule";
import type { FilterRuleAction } from "../FilterRules/FilterRuleAction";
import { getTagByName } from "../../Abstract/Tag";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { ensureArray, NotSupported } from "../../util/util";
import { gt } from "../../../l10n/l10n";

/** A rule that the Exchange server runs on incoming mail, as EWS `RuleType`,
 * in the notation of `XML2JSON()`.
 * <https://learn.microsoft.com/en-us/exchange/client-developer/exchange-web-services/inbox-rules-in-ews-for-exchange> */
export class EWSFilterRule extends ServerFilterRule {
  get id(): string | null {
    return sanitize.nonemptystring(this.json.RuleId, null);
  }

  get priority(): number {
    return sanitize.integer(this.json.Priority, 0);
  }

  /** Exchange allows to change only the name, priority and enabled state */
  get isReadOnly(): boolean {
    return this.json.IsNotSupported == "true";
  }

  protected fillFilterRule(rule: FilterRuleAction) {
    rule.name = sanitize.nonemptylabel(this.json.DisplayName, "-");
    let conditions = this.object(this.json.Conditions);
    let criteria = rule.criteria;
    criteria.bodyText = this.strings(conditions.ContainsSubjectOrBodyStrings)[0] ?? null;
    criteria.includesPersonEMail = sanitize.emailAddress(ensureArray(conditions.FromAddresses?.Address)[0]?.EmailAddress, null);
    criteria.tags.replaceAll(this.strings(conditions.Categories).map(name => getTagByName(name)));
    criteria.hasAttachment = conditions.HasAttachments == "true" ? true : null;
    criteria.isStarred = conditions.FlaggedForAction ? true : null;
    let sizeMin = sanitize.integer(conditions.WithinSizeRange?.MinimumSize, null);
    let sizeMax = sanitize.integer(conditions.WithinSizeRange?.MaximumSize, null);
    criteria.sizeMin = sizeMin == null ? null : sizeMin * 1024;
    criteria.sizeMax = sizeMax == null ? null : sizeMax * 1024;
    criteria.sentDateMin = sanitize.date(conditions.WithinDateRange?.StartDateTime, null) ?? null;
    criteria.sentDateMax = sanitize.date(conditions.WithinDateRange?.EndDateTime, null) ?? null;

    let actions = this.object(this.json.Actions);
    rule.markAsRead = actions.MarkAsRead == "true" ? true : null;
    rule.deleteTrash = actions.Delete == "true" ? true : null;
    rule.deleteImmediately = actions.PermanentDelete == "true" ? true : null;
    rule.toFolderID = sanitize.nonemptystring(actions.MoveToFolder?.FolderId?.Id ?? actions.CopyToFolder?.FolderId?.Id, null);
    rule.copy = !actions.MoveToFolder?.FolderId && actions.CopyToFolder?.FolderId ? true : null;
    rule.addTags.replaceAll(this.strings(actions.AssignCategories).map(name => getTagByName(name)));
  }

  withChangesFrom(rule: FilterRuleAction, priority: number): EWSFilterRule {
    this.checkSupported(rule);
    let original = this.toFilterRule(rule.account);
    let json = structuredClone(this.json);
    if (rule.name != original.name) {
      json.DisplayName = rule.name;
    }
    json.IsEnabled ??= "true";
    let conditions = structuredClone(this.object(json.Conditions));
    if (Object.keys(this.merge(conditions, this.conditionsOf(rule), this.conditionsOf(original))).length) {
      json.Conditions = conditions;
    }
    let actions = structuredClone(this.object(json.Actions));
    if (Object.keys(this.merge(actions, this.actionsOf(rule), this.actionsOf(original))).length) {
      json.Actions = actions;
    }
    if (this.isReadOnly && new EWSFilterRule(json).isChangedFrom(this)) {
      throw new NotSupported(gt`The mail server does not allow changes to the rule ${rule.name}`);
    }
    json.Priority = String(priority);
    return new EWSFilterRule(json);
  }

  protected conditionsOf(rule: FilterRuleAction): Record<string, any> {
    let criteria = rule.criteria;
    let conditions: Record<string, any> = {};
    if (criteria.bodyText) {
      conditions.ContainsSubjectOrBodyStrings = { String: [criteria.bodyText] };
    }
    if (criteria.includesPersonEMail) {
      conditions.FromAddresses = { Address: [{ EmailAddress: criteria.includesPersonEMail }] };
    }
    if (criteria.tags.hasItems) {
      conditions.Categories = { String: criteria.tags.contents.map(tag => tag.name) };
    }
    if (criteria.hasAttachment) {
      conditions.HasAttachments = "true";
    }
    if (criteria.isStarred) {
      conditions.FlaggedForAction = "Any";
    }
    if (criteria.sizeMin || criteria.sizeMax) {
      conditions.WithinSizeRange = {};
      if (criteria.sizeMin) {
        conditions.WithinSizeRange.MinimumSize = String(Math.floor(criteria.sizeMin / 1024));
      }
      if (criteria.sizeMax) {
        conditions.WithinSizeRange.MaximumSize = String(Math.ceil(criteria.sizeMax / 1024));
      }
    }
    if (criteria.sentDateMin || criteria.sentDateMax) {
      conditions.WithinDateRange = {};
      if (criteria.sentDateMin) {
        conditions.WithinDateRange.StartDateTime = criteria.sentDateMin.toISOString();
      }
      if (criteria.sentDateMax) {
        conditions.WithinDateRange.EndDateTime = criteria.sentDateMax.toISOString();
      }
    }
    return conditions;
  }

  protected actionsOf(rule: FilterRuleAction): Record<string, any> {
    let actions: Record<string, any> = {};
    if (rule.addTags.hasItems) {
      actions.AssignCategories = { String: rule.addTags.contents.map(tag => tag.name) };
    }
    if (rule.toFolderID) {
      actions[rule.copy ? "CopyToFolder" : "MoveToFolder"] = { FolderId: { Id: rule.toFolderID } };
    }
    if (rule.deleteTrash) {
      actions.Delete = "true";
    }
    if (rule.markAsRead) {
      actions.MarkAsRead = "true";
    }
    if (rule.deleteImmediately) {
      actions.PermanentDelete = "true";
    }
    return actions;
  }

  /** For `UpdateInboxRules`: With namespace prefixes, and in the element order of the schema.
   * The server does not accept `IsNotSupported`, and of rules that it does not support,
   * it accepts only the priority. */
  toRequest(): any {
    const kRuleOrder = ["RuleId", "DisplayName", "Priority", "IsEnabled", "IsInError", "Conditions", "Exceptions", "Actions"];
    const kPredicatesOrder = ["Categories", "ContainsBodyStrings", "ContainsHeaderStrings", "ContainsRecipientStrings",
      "ContainsSenderStrings", "ContainsSubjectOrBodyStrings", "ContainsSubjectStrings", "FlaggedForAction", "FromAddresses",
      "FromConnectedAccounts", "HasAttachments", "Importance", "IsApprovalRequest", "IsAutomaticForward", "IsAutomaticReply",
      "IsEncrypted", "IsMeetingRequest", "IsMeetingResponse", "IsNDR", "IsPermissionControlled", "IsReadReceipt", "IsSigned",
      "IsVoicemail", "ItemClasses", "MessageClassifications", "NotSentToMe", "SentCcMe", "SentOnlyToMe", "SentToAddresses",
      "SentToMe", "SentToOrCcMe", "Sensitivity", "WithinDateRange", "WithinSizeRange"];
    const kActionsOrder = ["AssignCategories", "CopyToFolder", "Delete", "ForwardAsAttachmentToRecipients",
      "ForwardToRecipients", "MarkImportance", "MarkAsRead", "MoveToFolder", "PermanentDelete", "RedirectToRecipients",
      "SendSMSAlertToRecipients", "ServerReplyWithMessage", "StopProcessingRules"];
    if (this.isReadOnly) {
      return this.withNamespaces(this.ordered(this.json, kRuleOrder.slice(0, 4), false));
    }
    let rule = this.ordered(this.json, kRuleOrder, false);
    for (let predicates of ["Conditions", "Exceptions"]) {
      if (typeof rule[predicates] == "object") {
        rule[predicates] = this.ordered(rule[predicates], kPredicatesOrder);
      }
    }
    if (typeof rule.Actions == "object") {
      rule.Actions = this.ordered(rule.Actions, kActionsOrder);
    }
    return this.withNamespaces(rule);
  }

  /** @param order The known elements
   * @param withUnknown Adds the unknown elements after the known ones */
  protected ordered(json: Record<string, any>, order: string[], withUnknown = true): Record<string, any> {
    let result: Record<string, any> = {};
    for (let key of order) {
      if (key in json) {
        result[key] = json[key];
      }
    }
    if (!withUnknown) {
      return result;
    }
    for (let key in json) {
      if (!(key in result)) {
        result[key] = json[key];
      }
    }
    return result;
  }

  /** `XML2JSON()` doesn't say which values were XML attributes.
   * In rules, these are only the IDs of folders and items. */
  protected withNamespaces(json: any): any {
    const kAttributes = ["Id", "ChangeKey"];
    if (Array.isArray(json)) {
      return json.map(value => this.withNamespaces(value));
    }
    if (!json || typeof json != "object") {
      return json;
    }
    let result: Record<string, any> = {};
    for (let key in json) {
      result[kAttributes.includes(key) ? key : "t$" + key] = this.withNamespaces(json[key]);
    }
    return result;
  }

  /** An empty element is an empty string in `XML2JSON()` */
  protected object(json: any): Record<string, any> {
    return json && typeof json == "object" ? json : {};
  }

  /** A list of strings is a `<String>` element for each string */
  protected strings(json: any): string[] {
    return super.strings(ensureArray(json?.String));
  }
}
