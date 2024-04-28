import type { EMail } from "../EMail";
import type { PersonUID } from "../../Abstract/PersonUID";
import type { MailAccount } from "../MailAccount";
import type { Folder } from "../Folder";
import { AbstractFunction } from "../../util/util";
import { Observable } from "../../util/Observable";
import type { Collection } from "svelte-collections";
import type { PersonOrGroup } from "../../../frontend/Shared/Person/PersonOrGroup";

/** Contains the search criteria for emails.
 * Subclasses then implement the concrete search algo.
 * Criteria which are null are ignored in the search.
 * You fill out only the criteria fields that you want to search for. */
export class SearchEMail extends Observable {
  account: MailAccount | null = null;
  folder: Folder | null = null;

  isOutgoing: boolean | null = null;
  contact: PersonOrGroup | PersonUID | null = null;
  from: PersonUID | null = null;
  recipientsIncludes: PersonUID | null = null;

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

  async startSearch(limit?: number): Promise<Collection<EMail>> {
    throw new AbstractFunction();
  }
}
