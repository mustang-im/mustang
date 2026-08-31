import { SearchEMail } from "../Store/SearchEMail";
import type { ExchangeMailAccount } from "./ExchangeMailAccount";
import { FlagStatusPidTag } from "./ExchangeEMail";

/**
 * Lets the Exchange server search, using a `Restriction` in `FindItem`.
 * <https://learn.microsoft.com/en-us/exchange/client-developer/exchange-web-services/how-to-use-search-filters-with-ews-in-exchange>
 *
 * The alternative would be a `QueryString` with Advanced Query Syntax, which
 * uses the content index and knows `from:` and `participants:`. But it can
 * search only 1 folder per request, whereas a restriction searches all folders
 * of the mailbox at once, and that is what we need: The emails that the user
 * cannot find locally are exactly those in the folders that were never opened.
 *
 * EWS and OWA send the same conditions in different notations,
 * @see `EWSSearchEMail` and `OWASearchEMail`.
 */
export class ExchangeSearchEMail extends SearchEMail {
  declare account: ExchangeMailAccount;

  /** Translates our search criteria into Exchange restriction conditions, to be ANDed.
   * @returns null, if Exchange has no property for one of the criteria */
  protected conditions(): ExchangeCondition[] | null {
    if (this.isOutgoing !== null || this.isReplied !== null || this.threadID ||
        this.includesPerson || this.hasAttachmentMIMETypes.hasItems) {
      return null;
    }
    let conditions: ExchangeCondition[] = [];
    if (this.bodyText) {
      conditions.push(new ExchangeCondition("Or", null, null, [
        new ExchangeCondition("Contains", "item:Subject", this.bodyText),
        new ExchangeCondition("Contains", "item:Body", this.bodyText),
      ]));
    }
    for (let tag of this.tags) {
      conditions.push(new ExchangeCondition("Contains", "item:Categories", tag.name));
    }
    if (this.messageID) {
      conditions.push(new ExchangeCondition("IsEqualTo", "message:InternetMessageId", this.messageID));
    }
    if (this.isRead !== null) {
      conditions.push(new ExchangeCondition("IsEqualTo", "message:IsRead", this.isRead));
    }
    if (this.hasAttachment !== null) {
      conditions.push(new ExchangeCondition("IsEqualTo", "item:HasAttachments", this.hasAttachment));
    }
    if (this.isStarred !== null) {
      let flagged = new ExchangeCondition("IsEqualTo", null, 2);
      flagged.propertyTag = FlagStatusPidTag;
      conditions.push(this.isStarred
        ? flagged
        : new ExchangeCondition("Not", null, null, [flagged]));
    }
    if (this.sizeMin) {
      conditions.push(new ExchangeCondition("IsGreaterThanOrEqualTo", "item:Size", this.sizeMin));
    }
    if (this.sizeMax) {
      conditions.push(new ExchangeCondition("IsLessThanOrEqualTo", "item:Size", this.sizeMax));
    }
    if (this.sentDateMin) {
      conditions.push(new ExchangeCondition("IsGreaterThanOrEqualTo", "item:DateTimeSent", this.sentDateMin.toISOString()));
    }
    if (this.sentDateMax) {
      conditions.push(new ExchangeCondition("IsLessThanOrEqualTo", "item:DateTimeSent", this.sentDateMax.toISOString()));
    }
    // Listing the newest emails is not a search
    return conditions.length ? conditions : null;
  }
}

/** One condition of an Exchange `Restriction` */
export class ExchangeCondition {
  constructor(
    /** `Contains`, `IsEqualTo`, `IsGreaterThanOrEqualTo`, `IsLessThanOrEqualTo`, `Or` or `Not` */
    readonly operator: string,
    /** The property to compare, e.g. `item:Subject`. Null for `Or` and `Not`. */
    readonly fieldURI: string | null = null,
    readonly value: string | number | boolean | null = null,
    /** Only for `Or` and `Not` */
    readonly conditions: ExchangeCondition[] = [],
  ) {
  }

  /** MAPI property tag, for the properties that have no `fieldURI` */
  propertyTag: string | null = null;
}
