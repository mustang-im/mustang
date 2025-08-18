import type { ChatMessage } from "./Message";
import type { Person } from "../Abstract/Person";
import type { ChatAccount } from "./ChatAccount";
import { getTagByName, type Tag } from "../Abstract/Tag";
import { findPerson, PersonUID } from "../Abstract/PersonUID";
import { appGlobal } from "../app";
import { sanitize } from "../../../lib/util/sanitizeDatatypes";
import { notifyChangedProperty, Observable } from "../util/Observable";
import { AbstractFunction } from "../util/util";
import { SetColl, type ArrayColl } from "svelte-collections";

/** Contains the search criteria for emails.
 * Subclasses then implement the concrete search algo.
 * Criteria which are null are ignored in the search.
 * You fill out only the criteria fields that you want to search for. */
export class SearchChat extends Observable {
  @notifyChangedProperty
  account: ChatAccount | null = null;

  @notifyChangedProperty
  isOutgoing: boolean | null = null;
  @notifyChangedProperty
  includesPerson: Person | null = null;

  @notifyChangedProperty
  messageID: string | null = null;
  /** TODO not in SQL */
  @notifyChangedProperty
  threadID: string | null = null;
  @notifyChangedProperty
  sentDateMin: Date | null = null;
  @notifyChangedProperty
  sentDateMax: Date | null = null;

  /** TODO not in SQL */
  @notifyChangedProperty
  isRead: boolean | null = null;
  /** TODO not in SQL */
  @notifyChangedProperty
  isStarred: boolean | null = null;
  /** TODO not in SQL */
  @notifyChangedProperty
  isReplied: boolean | null = null;
  /** TODO not in SQL */
  readonly tags = new SetColl<Tag>();

  @notifyChangedProperty
  hasAttachment: boolean | null = null;
  /** Has an attachment of one of these types.
   * Implicitly sets hasAttachment = true. */
  readonly hasAttachmentMIMETypes = new SetColl<string>;

  /** Searches the plaintext body and the subject.
   * Obviously, this is slow. */
  @notifyChangedProperty
  bodyText: string | null = null;

  async startSearch(limit?: number): Promise<ArrayColl<ChatMessage>> {
    throw new AbstractFunction();
  }

  fromJSON(json: any) {
    function boolean(value: boolean | null): boolean | null {
      return typeof (value) == "boolean" ? value : null;
    }
    this.bodyText = sanitize.string(json.bodyText, null) ?? null;
    this.isOutgoing = boolean(json.isOutgoing);
    this.hasAttachment = boolean(json.hasAttachment);
    this.hasAttachmentMIMETypes.replaceAll(sanitize.array(
      json.hasAttachmentMIMETypes?.map(mimetype => sanitize.string(mimetype)), []) as string[]);
    this.messageID = sanitize.string(json.messageID, null) ?? null;
    this.threadID = sanitize.string(json.threadID, null) ?? null;
    this.sentDateMin = sanitize.date(json.sentDateMin, null) ?? null;
    this.sentDateMax = sanitize.date(json.sentDateMax, null) ?? null;

    this.includesPerson = findPerson(json.includesPersonEMail) ?? null;
    this.account = appGlobal.chatAccounts.find(acc => acc.id == json.accountID);
    this.tags.replaceAll(sanitize.array(json.tags, [])?.map(name => getTagByName(name)) as Tag[]);
  }

  toJSON() {
    return {
      bodyText: this.bodyText,
      isOutgoing: this.isOutgoing,
      isRead: this.isRead,
      isReplied: this.isReplied,
      isStarred: this.isStarred,
      hasAttachment: this.hasAttachment,
      hasAttachmentMIMETypes: this.hasAttachmentMIMETypes.contents,
      messageID: this.messageID,
      threadID: this.threadID,
      sentDateMin: this.sentDateMin?.toISOString(),
      sentDateMax: this.sentDateMax?.toISOString(),
      includesPersonEMail: this.includesPerson?.emailAddresses.first?.value ?? null,
      accountID: this.account?.id,
      tags: this.tags?.contents.map(tag => tag.name),
    };
  }

  clone(): SearchChat {
    let clone = new (this as any).constructor();
    clone.fromJSON(this.toJSON());
    return clone;
  }

  matches(msg: ChatMessage): boolean {
    if (this.messageID && this.messageID != msg.id) {
      return false;
    }
    if (this.account) {
      return false;
    }
    if (!matchesBoolean(this.isOutgoing, msg.outgoing)) {
      return false;
    }
    if (!matchesBoolean(this.isRead, msg.isRead)) {
      return false;
    }
    if (!matchesBoolean(this.isStarred, msg.isStarred)) {
      return false;
    }
    if (!matchesBoolean(this.hasAttachment, msg.attachments.hasItems)) {
      return false;
    }
    if (this.sentDateMin && !(this.sentDateMin.getTime() <= msg.sent.getTime())) {
      return false;
    }
    if (this.sentDateMax && !(this.sentDateMax.getTime() >= msg.sent.getTime())) {
      return false;
    }
    if (this.bodyText && !msg.rawText?.includes(this.bodyText) && // TODO `.text`? Avoid triggering a full load
        !msg.subject.includes(this.bodyText)) {
      return false;
    }
    /*if (this.tags.hasItems) {
      if (!msg.tags?.hasItems) {
        return false;
      }
      for (let tag of this.tags) {
        if (!msg.tags.has(tag)) {
          return false;
        }
      }
    }*/
    if (this.includesPerson) {
      let person = this.includesPerson;
      if (msg.contact == person ||
          msg.contact instanceof PersonUID && msg.contact.matchesPerson(person)) {
        return false;
      }
    }
    return true;
  }
}

function matchesBoolean(search: boolean | undefined | null, value: boolean) {
  return search === null || search === undefined || search === value;
}
