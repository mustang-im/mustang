import { SearchEMail, msgHasSearchTerm } from "../Store/SearchEMail";
import type { EMail } from "../EMail";
import { assert } from "../../util/util";
import { ArrayColl } from "svelte-collections";

/** Searches messages only in `this.folder.messages` */
export class QuickSearchEMail extends SearchEMail {
  /** Start a local search based on the critera set on this object */
  async startSearch(): Promise<ArrayColl<EMail>> {
    if (!this.hasSearch()) {
      return null;
    }
    assert(this.folder, "Quick search needs a folder");
    let searchTerms = this.bodyText ? this.bodyText.split(" ").filter(Boolean) : [];
    return this.folder.messages.filterOnce(msg =>
      (this.isStarred === null || msg.isStarred === this.isStarred) &&
      (this.isRead === null || msg.isRead === this.isRead) &&
      (this.hasAttachment === null || msg.hasVisibleAttachments === this.hasAttachment) &&
      (!searchTerms.length || searchTerms.every(term => msgHasSearchTerm(msg, term)))
    ) as ArrayColl<EMail>;
  }

  hasSearch(): boolean {
    return this.isStarred !== null ||
      this.isRead !== null ||
      this.hasAttachment !== null ||
      !!this.bodyText;
  }

  reset() {
    this.isStarred = null;
    this.isRead = null;
    this.hasAttachment = null;
    this.bodyText = null;
  }
}
