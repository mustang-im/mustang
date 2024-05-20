import type { EMail } from "../EMail";
import type { Person } from "../../Abstract/Person";
import type { MailAccount } from "../MailAccount";
import type { Folder } from "../Folder";
import { findPerson } from "../../Abstract/PersonUID";
import { appGlobal } from "../../app";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { Observable } from "../../util/Observable";
import { AbstractFunction } from "../../util/util";
import type { ArrayColl } from "svelte-collections";

/** Contains the search criteria for emails.
 * Subclasses then implement the concrete search algo.
 * Criteria which are null are ignored in the search.
 * You fill out only the criteria fields that you want to search for. */
export class SearchEMail extends Observable {
  account: MailAccount | null = null;
  folder: Folder | null = null;

  isOutgoing: boolean | null = null;
  includesPerson: Person | null = null;

  messageID: string | null = null;
  threadID: string | null = null;
  dateSentFrom: Date | null = null;
  dateSentTo: Date | null = null;
  sizeMin: number | null = null;
  sizeMax: number | null = null;

  isRead: boolean | null = null;
  isStarred: boolean | null = null;
  isReplied: boolean | null = null;

  hasAttachment: boolean | null = null;
  /** Has an attachment of one of these types.
   * Implicitly sets hasAttachment = true. */
  hasAttachmentMIMETypes: string[] | null = null;

  /** Searches the plaintext body and the subject.
   * Obviously, this is slow. */
  bodyText: string | null = null;

  async startSearch(limit?: number): Promise<ArrayColl<EMail>> {
    throw new AbstractFunction();
  }

  fromJSON(json: any) {
    function boolean(value: boolean | undefined): boolean | undefined {
      return value != null ? sanitize.boolean(value, null) ?? undefined : undefined
    }
    this.bodyText = sanitize.string(json.bodyText, null) ?? undefined;
    this.isOutgoing = boolean(json.isOutgoing);
    this.isRead = boolean(json.isRead);
    this.isReplied = boolean(json.isReplied);
    this.isStarred = boolean(json.isStarred);
    this.hasAttachment = boolean(json.hasAttachment);
    this.hasAttachmentMIMETypes = Array.isArray(json.hasAttachmentMIMETypes)
      ? json.hasAttachmentMIMETypes.map(mimetype => sanitize.string(mimetype))
      : undefined;
    this.sizeMin = sanitize.integer(json.sizeMin, null) ?? undefined;
    this.sizeMax = sanitize.integer(json.sizeMax, null) ?? undefined;
    this.messageID = sanitize.string(json.messageID, null) ?? undefined;
    this.threadID = sanitize.string(json.threadID, null) ?? undefined;
    this.dateSentFrom = sanitize.date(json.dateSentFrom, null) ?? undefined;
    this.dateSentTo = sanitize.date(json.dateSentTo, null) ?? undefined;

    this.includesPerson = findPerson(json.includesPersonEMail, "");
    this.account = appGlobal.emailAccounts.find(acc => acc.id == json.accountID);
    this.folder = this.account
      ? this.account.findFolder(folder => folder.path == json.folderPath) ?? undefined
      : undefined;
  }

  toJSON() {
    return {
      bodyText: this.bodyText,
      isOutgoing: this.isOutgoing,
      isRead: this.isRead,
      isReplied: this.isReplied,
      isStarred: this.isStarred,
      hasAttachment: this.hasAttachment,
      hasAttachmentMIMETypes: this.hasAttachmentMIMETypes,
      sizeMin: this.sizeMin,
      sizeMax: this.sizeMax,
      messageID: this.messageID,
      threadID: this.threadID,
      dateSentFrom: this.dateSentFrom?.toISOString(),
      dateSentTo: this.dateSentTo?.toISOString(),
      includesPersonEMail: this.includesPerson?.emailAddresses.first?.value ?? null,
      accountID: this.account?.id ?? this.folder?.account?.id,
      folderPath: this.folder?.path,
    };
  }

  clone(): SearchEMail {
    let clone = new (this as any).constructor();
    clone.fromJSON(this.toJSON);
    return clone;
  }
}
