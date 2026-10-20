import { ServerFilterRule } from "../FilterRules/ServerFilterRule";
import type { FilterRuleAction } from "../FilterRules/FilterRuleAction";
import { getTagByName } from "../../Abstract/Tag";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { NotSupported } from "../../util/util";
import { gt } from "../../../l10n/l10n";

/** A rule that the Exchange server runs on incoming mail, as `InboxRule` of the OWA options.
 * These are the parameters of the PowerShell command `Set-InboxRule`.
 * The server changes only the parameters that we send. */
export class OWAFilterRule extends ServerFilterRule {
  protected readonly canCheckCategories = false;
  protected readonly canDeleteImmediately = false;
  /** The parameters that the user changed */
  readonly changes: Record<string, any>;

  constructor(json: any, changes: Record<string, any> = {}) {
    super(json);
    this.changes = changes;
  }

  get id(): string | null {
    return sanitize.nonemptystring(this.json.Identity?.RawIdentity, null);
  }

  get priority(): number {
    return sanitize.integer(this.json.Priority, 0);
  }

  get isReadOnly(): boolean {
    return this.json.SupportedByTask === false;
  }

  protected fillFilterRule(rule: FilterRuleAction) {
    let json = this.json;
    rule.name = sanitize.nonemptylabel(json.Name, "-");
    let criteria = rule.criteria;
    criteria.bodyText = this.strings(json.SubjectOrBodyContainsWords)[0] ?? null;
    criteria.includesPersonEMail = sanitize.emailAddress(json.From?.[0]?.SmtpAddress, null);
    criteria.hasAttachment = json.HasAttachment === true ? true : null;
    criteria.isStarred = json.FlaggedForAction ? true : null;
    criteria.sizeMin = sanitize.integer(json.WithinSizeRangeMinimum, null) ?? null;
    criteria.sizeMax = sanitize.integer(json.WithinSizeRangeMaximum, null) ?? null;
    criteria.sentDateMin = sanitize.date(json.ReceivedAfterDate, null) ?? null;
    criteria.sentDateMax = sanitize.date(json.ReceivedBeforeDate, null) ?? null;

    rule.markAsRead = json.MarkAsRead === true ? true : null;
    rule.deleteTrash = json.DeleteMessage === true ? true : null;
    // The server identifies the folder in its own way, but tells its name
    let folderName = sanitize.nonemptylabel((json.MoveToFolder ?? json.CopyToFolder)?.DisplayName, null);
    let folders = folderName ? rule.account.getAllFolders().filterOnce(folder => folder.name == folderName) : null;
    rule.toFolderID = folders?.length == 1 ? folders.first.id : null;
    rule.copy = !json.MoveToFolder && json.CopyToFolder ? true : null;
    rule.addTags.replaceAll(this.strings(json.ApplyCategory).map(name => getTagByName(name)));
  }

  withChangesFrom(rule: FilterRuleAction, priority: number): OWAFilterRule {
    this.checkSupported(rule);
    let original = this.toFilterRule(rule.account);
    let json = structuredClone(this.json);
    let changes = this.merge(json, this.parametersOf(rule), this.parametersOf(original));
    if (this.isReadOnly && Object.keys(changes).length) {
      throw new NotSupported(gt`The mail server does not allow changes to the rule ${rule.name}`);
    }
    if (this.priority != priority) {
      changes.Priority = json.Priority = priority;
    }
    return new OWAFilterRule(json, changes);
  }

  /** All parameters that we understand. For a missing criterion, its empty value. */
  protected parametersOf(rule: FilterRuleAction): Record<string, any> {
    let criteria = rule.criteria;
    let folder = rule.toFolderID ? { RawIdentity: rule.toFolderID, DisplayName: rule.toFolder?.name ?? "" } : null;
    return {
      Name: rule.name,
      SubjectOrBodyContainsWords: criteria.bodyText ? [criteria.bodyText] : null,
      From: criteria.includesPersonEMail
        ? [{ SmtpAddress: criteria.includesPersonEMail, DisplayName: criteria.includesPersonEMail, RoutingType: "SMTP" }]
        : null,
      HasAttachment: !!criteria.hasAttachment,
      FlaggedForAction: criteria.isStarred ? "Any" : null,
      WithinSizeRangeMinimum: criteria.sizeMin || null,
      WithinSizeRangeMaximum: criteria.sizeMax || null,
      ReceivedAfterDate: criteria.sentDateMin?.toISOString() ?? null,
      ReceivedBeforeDate: criteria.sentDateMax?.toISOString() ?? null,
      MarkAsRead: !!rule.markAsRead,
      DeleteMessage: !!rule.deleteTrash,
      MoveToFolder: rule.copy ? null : folder,
      CopyToFolder: rule.copy ? folder : null,
      ApplyCategory: rule.addTags.hasItems ? rule.addTags.contents.map(tag => tag.name) : null,
    };
  }

  /** For `NewInboxRule` */
  get newParameters(): Record<string, any> {
    let parameters: Record<string, any> = {};
    for (let [key, value] of Object.entries(this.json)) {
      if (value != null && value !== false) {
        parameters[key] = value;
      }
    }
    return parameters;
  }

  /** For `SetInboxRule` */
  get setParameters(): Record<string, any> {
    return { Identity: this.json.Identity, ...this.changes };
  }
}
