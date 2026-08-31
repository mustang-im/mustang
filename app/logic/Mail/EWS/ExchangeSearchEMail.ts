import { SearchEMail } from "../Store/SearchEMail";
import type { ExchangeMailAccount } from "./ExchangeMailAccount";

/** Lets the Exchange server search, using Advanced Query Syntax (AQS).
 * <https://learn.microsoft.com/en-us/exchange/client-developer/exchange-web-services/how-to-perform-an-aqs-search-by-using-ews-in-exchange>
 * Exchange restrictions cannot match the message body, so AQS is the only way
 * to search the mail contents. EWS, OWA and Graph all send this query. */
export class ExchangeSearchEMail extends SearchEMail {
  declare account: ExchangeMailAccount;

  /** Translates our search criteria into an AQS query.
   * @returns null, if AQS has no property for one of the criteria */
  protected queryString(): string | null {
    if (this.isOutgoing !== null || this.isRead !== null ||
        this.isStarred !== null || this.isReplied !== null ||
        this.threadID || this.messageID || this.hasAttachmentMIMETypes.hasItems) {
      return null;
    }
    let terms: string[] = [];
    if (this.bodyText) {
      terms.push(`(subject:${quote(this.bodyText)} OR body:${quote(this.bodyText)})`);
    }
    if (this.includesPerson) {
      let addresses = this.includesPerson.emailAddresses.contents;
      if (!addresses.length) {
        return null; // Without an email address, the person has no emails
      }
      terms.push("(" + addresses
        .map(address => `participants:${quote(address.value)}`)
        .join(" OR ") + ")");
    }
    for (let tag of this.tags) {
      terms.push(`category:${quote(tag.name)}`);
    }
    if (this.hasAttachment !== null) {
      terms.push(`hasattachment:${this.hasAttachment}`);
    }
    if (this.sizeMin) {
      terms.push(`size>=${this.sizeMin}`);
    }
    if (this.sizeMax) {
      terms.push(`size<=${this.sizeMax}`);
    }
    if (this.sentDateMin) {
      terms.push(`sent>=${aqsDate(this.sentDateMin)}`);
    }
    if (this.sentDateMax) {
      terms.push(`sent<=${aqsDate(this.sentDateMax)}`);
    }
    return terms.length
      ? terms.join(" AND ")
      : null; // Listing the newest emails is not a search
  }
}

/** AQS has no escape character, so the value becomes a phrase without quotes in it */
function quote(value: string): string {
  return `"${value.replace(/["\\]/g, " ")}"`;
}

/** AQS compares dates without the time of day */
function aqsDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
