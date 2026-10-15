import type { FilterRuleAction } from "../../../logic/Mail/FilterRules/FilterRuleAction";
import { FilterMoment } from "../../../logic/Mail/FilterRules/FilterMoments";
import type { Tag } from "../../../logic/Abstract/Tag";
import { getFormattedDateString } from "../../../frontend/Util/date";
import { gt } from "../../../l10n/l10n";
import type { Collection } from "svelte-collections";

export interface RuleDescriptionLine {
  text: string;
  values: string[];
}

export interface RuleDescriptionPart {
  text: string;
  isValue: boolean;
}

export class RuleDescription {
  static lines(rule: FilterRuleAction): RuleDescriptionLine[] {
    return [
      RuleDescription.whenLine(rule),
      ...RuleDescription.conditionLines(rule),
      ...RuleDescription.actionLines(rule),
    ];
  }

  static whenLine(rule: FilterRuleAction): RuleDescriptionLine {
    switch (rule.when) {
      case FilterMoment.IncomingAfterSpam:
        return RuleDescription.line(gt`Apply this rule after the message arrives and after the junk check`);
      case FilterMoment.Outgoing:
        return RuleDescription.line(gt`Apply this rule after I send the message`);
      default:
        return RuleDescription.line(gt`Apply this rule after the message arrives`);
    }
  }

  static conditionLines(rule: FilterRuleAction): RuleDescriptionLine[] {
    let criteria = rule.criteria;
    let lines: RuleDescriptionLine[] = [];
    if (criteria.includesPerson) {
      let name = criteria.includesPerson.name || criteria.includesPerson.emailAddresses.first?.value || "";
      lines.push(RuleDescription.line(gt`from or to ${name}`, name));
    }
    if (criteria.bodyText) {
      lines.push(RuleDescription.line(gt`with ${criteria.bodyText} in the subject or body`, criteria.bodyText));
    }
    if (criteria.hasAttachmentMIMETypes.hasItems) {
      let types = criteria.hasAttachmentMIMETypes.contents.join(", ");
      lines.push(RuleDescription.line(gt`which has an attachment of type ${types}`, types));
    } else if (criteria.hasAttachment === true) {
      lines.push(RuleDescription.line(gt`which has an attachment`));
    } else if (criteria.hasAttachment === false) {
      lines.push(RuleDescription.line(gt`which has no attachment`));
    }
    let sizeMin = RuleDescription.kilobytes(criteria.sizeMin);
    let sizeMax = RuleDescription.kilobytes(criteria.sizeMax);
    if (sizeMin && sizeMax) {
      lines.push(RuleDescription.line(gt`with a size between ${sizeMin} and ${sizeMax} KB`, sizeMin, sizeMax));
    } else if (sizeMin) {
      lines.push(RuleDescription.line(gt`with a size of at least ${sizeMin} KB`, sizeMin));
    } else if (sizeMax) {
      lines.push(RuleDescription.line(gt`with a size of at most ${sizeMax} KB`, sizeMax));
    }
    let dateMin = RuleDescription.date(criteria.sentDateMin);
    let dateMax = RuleDescription.date(criteria.sentDateMax);
    if (dateMin && dateMax) {
      lines.push(RuleDescription.line(gt`sent between ${dateMin} and ${dateMax}`, dateMin, dateMax));
    } else if (dateMin) {
      lines.push(RuleDescription.line(gt`sent after ${dateMin}`, dateMin));
    } else if (dateMax) {
      lines.push(RuleDescription.line(gt`sent before ${dateMax}`, dateMax));
    }
    if (criteria.tags.hasItems) {
      let names = RuleDescription.tagNames(criteria.tags);
      lines.push(RuleDescription.line(gt`assigned to ${names} category`, names));
    }
    if (criteria.isRead === false) {
      lines.push(RuleDescription.line(gt`which is unread`));
    } else if (criteria.isRead === true) {
      lines.push(RuleDescription.line(gt`which is read`));
    }
    if (criteria.isStarred === true) {
      lines.push(RuleDescription.line(gt`which is flagged`));
    } else if (criteria.isStarred === false) {
      lines.push(RuleDescription.line(gt`which is not flagged`));
    }
    if (criteria.isReplied === true) {
      lines.push(RuleDescription.line(gt`which I replied to`));
    } else if (criteria.isReplied === false) {
      lines.push(RuleDescription.line(gt`which I have not replied to`));
    }
    if (criteria.isOutgoing === true) {
      lines.push(RuleDescription.line(gt`which I sent`));
    } else if (criteria.isOutgoing === false) {
      lines.push(RuleDescription.line(gt`which I received`));
    }
    if (criteria.folder) {
      let name = criteria.folder.name;
      lines.push(RuleDescription.line(gt`in the ${name} folder`, name));
    }
    return lines;
  }

  static actionLines(rule: FilterRuleAction): RuleDescriptionLine[] {
    let lines: RuleDescriptionLine[] = [];
    if (rule.markAsRead === true) {
      lines.push(RuleDescription.line(gt`mark it as read`));
    } else if (rule.markAsRead === false) {
      lines.push(RuleDescription.line(gt`mark it as unread`));
    }
    if (rule.markAsStarred === true) {
      lines.push(RuleDescription.line(gt`flag it`));
    } else if (rule.markAsStarred === false) {
      lines.push(RuleDescription.line(gt`clear the flag`));
    }
    if (rule.addTags.hasItems) {
      let names = RuleDescription.tagNames(rule.addTags);
      lines.push(RuleDescription.line(gt`assign it to the ${names} category`, names));
    }
    if (rule.markAsSpam === true) {
      lines.push(RuleDescription.line(gt`mark it as junk`));
    } else if (rule.markAsSpam === false) {
      lines.push(RuleDescription.line(gt`mark it as not junk`));
    }
    if (rule.deleteImmediately) {
      lines.push(RuleDescription.line(gt`permanently delete it`));
    } else if (rule.deleteTrash) {
      lines.push(RuleDescription.line(gt`delete it`));
    } else if (rule.toFolderID) {
      let name = rule.toFolder?.name ?? gt`missing`;
      lines.push(rule.copy
        ? RuleDescription.line(gt`move a copy to the ${name} folder`, name)
        : RuleDescription.line(gt`move it to the ${name} folder`, name));
    }
    return lines;
  }

  static hasAction(rule: FilterRuleAction): boolean {
    return RuleDescription.actionLines(rule).length > 0;
  }

  static isBroken(rule: FilterRuleAction): boolean {
    return !!rule.toFolderID && !rule.toFolder;
  }

  static parts(descriptionLine: RuleDescriptionLine): RuleDescriptionPart[] {
    let parts: RuleDescriptionPart[] = [];
    let rest = descriptionLine.text;
    for (let value of descriptionLine.values) {
      let pos = value ? rest.indexOf(value) : -1;
      if (pos < 0) {
        continue;
      }
      if (pos > 0) {
        parts.push({ text: rest.substring(0, pos), isValue: false });
      }
      parts.push({ text: value, isValue: true });
      rest = rest.substring(pos + value.length);
    }
    if (rest) {
      parts.push({ text: rest, isValue: false });
    }
    return parts;
  }

  protected static line(text: string, ...values: string[]): RuleDescriptionLine {
    return { text, values };
  }

  protected static tagNames(tags: Collection<Tag>): string {
    return tags.contents.map(tag => tag.name).join(", ");
  }

  protected static kilobytes(bytes: number | null): string | null {
    if (!bytes) {
      return null;
    }
    return String(Math.round(bytes / 1024));
  }

  protected static date(date: Date | null): string | null {
    if (!date) {
      return null;
    }
    return getFormattedDateString(date, { year: "numeric", month: "2-digit", day: "2-digit" });
  }
}
