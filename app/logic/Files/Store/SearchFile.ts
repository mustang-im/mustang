import type { File } from "../File";
import type { Directory } from "../Directory";
import type { FileSharingAccount } from "../FileSharingAccount";
import { getTagByName, type Tag } from "../../Abstract/Tag";
import { appGlobal } from "../../app";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { notifyChangedProperty, Observable } from "../../util/Observable";
import { AbstractFunction } from "../../util/util";
import { SetColl, type ArrayColl } from "svelte-collections";

/** Contains the search criteria for emails.
 * Subclasses then implement the concrete search algo.
 * Criteria which are null are ignored in the search.
 * You fill out only the criteria fields that you want to search for. */
export class SearchFile extends Observable {
  @notifyChangedProperty
  account: FileSharingAccount | null = null;
  @notifyChangedProperty
  directory: Directory | null = null;

  @notifyChangedProperty
  sentDateMin: Date | null = null;
  @notifyChangedProperty
  sentDateMax: Date | null = null;
  @notifyChangedProperty
  sizeMin: number | null = null;
  @notifyChangedProperty
  sizeMax: number | null = null;

  @notifyChangedProperty
  isStarred: boolean | null = null;
  @notifyChangedProperty
  isReplied: boolean | null = null;
  readonly tags = new SetColl<Tag>();

  @notifyChangedProperty
  hasMIMETypesOn: boolean | null = null;
  /** Has an attachment of one of these types.
   * Implicitly sets hasAttachment = true. */
  readonly hasMIMETypes = new SetColl<string>;

  /** Searches the plaintext body and the subject.
   * Obviously, this is slow. */
  @notifyChangedProperty
  contentText: string | null = null;

  async startSearch(limit?: number): Promise<ArrayColl<File>> {
    throw new AbstractFunction();
  }

  fromJSON(json: any) {
    function boolean(value: boolean | null): boolean | null {
      return typeof (value) == "boolean" ? value : null;
    }
    this.contentText = sanitize.string(json.bodyText, null) ?? null;
    this.isReplied = boolean(json.isReplied);
    this.isStarred = boolean(json.isStarred);
    this.hasMIMETypesOn = boolean(json.hasAttachment);
    this.hasMIMETypes.replaceAll(sanitize.array(
      json.hasMIMETypes?.map(mimetype => sanitize.string(mimetype)), []));
    this.sizeMin = sanitize.integer(json.sizeMin, null) ?? null;
    this.sizeMax = sanitize.integer(json.sizeMax, null) ?? null;
    this.sentDateMin = sanitize.date(json.sentDateMin, null) ?? null;
    this.sentDateMax = sanitize.date(json.sentDateMax, null) ?? null;

    this.account = appGlobal.fileSharingAccounts.find(acc => acc.id == json.accountID);
    this.directory = this.account?.findFolder(folder => folder.id == json.folderID) ?? null;
    this.tags.replaceAll(sanitize.array(json.tags, [])?.map(name => getTagByName(name)));
  }

  toJSON() {
    return {
      bodyText: this.contentText,
      isReplied: this.isReplied,
      isStarred: this.isStarred,
      hasAttachment: this.hasMIMETypesOn,
      hasAttachmentMIMETypes: this.hasMIMETypes.contents,
      sizeMin: this.sizeMin,
      sizeMax: this.sizeMax,
      sentDateMin: this.sentDateMin?.toISOString(),
      sentDateMax: this.sentDateMax?.toISOString(),
      accountID: this.account?.id ?? this.directory?.account?.id,
      folderID: this.directory?.id,
      tags: this.tags?.contents.map(tag => tag.name),
    };
  }

  clone(): SearchFile {
    let clone = new (this as any).constructor();
    clone.fromJSON(this.toJSON());
    return clone;
  }

  matches(file: File): boolean {
    if (this.directory && this.directory != file.parent) {
      return false;
    }
    if (this.account && this.account != file.parent?.account) {
      return false;
    }
    if (!matchesBoolean(this.isStarred, file.isStarred)) {
      return false;
    }
    // TODO file type
    if (this.sizeMin && !(this.sizeMin <= file.size)) {
      return false;
    }
    if (this.sizeMax && !(this.sizeMax >= file.size)) {
      return false;
    }
    if (this.contentText && !file.rawText?.includes(this.contentText) && // TODO `.text`? Avoid triggering a full load
        !file.name.includes(this.contentText)) {
      return false;
    }
    if (this.tags.hasItems) {
      if (!file.tags?.hasItems) {
        return false;
      }
      for (let tag of this.tags) {
        if (!file.tags.has(tag)) {
          return false;
        }
      }
    }
    return true;
  }
}

function matchesBoolean(search: boolean | undefined, value: boolean) {
  return search === null || search === undefined || search === value;
}
