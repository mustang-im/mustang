import type { LinkTarget, Topic } from "./Topic";
import { Paragraph } from "./PageContent";
import type { TopicAccount } from "./TopicAccount";
import { appGlobal } from "../app";
import { sanitize } from "../../../lib/util/sanitizeDatatypes";
import { notifyChangedProperty, Observable } from "../util/Observable";
import { AbstractFunction } from "../util/util";
import type { ArrayColl } from "svelte-collections";

/** Contains the search criteria for notes.
 * Subclasses then implement the concrete search algo.
 * Criteria which are null are ignored in the search.
 * You fill out only the criteria fields that you want to search for. */
export class SearchTopic extends Observable {
  @notifyChangedProperty
  account: TopicAccount | null = null;

  /** Searches the page paragraphs
   * Obviously, this is slow. */
  @notifyChangedProperty
  topic: string | null = null;

  /** Searches the page paragraphs
   * Obviously, this is slow. */
  @notifyChangedProperty
  bodyText: string | null = null;

  @notifyChangedProperty
  linkTarget: LinkTarget | null = null;

  async startSearch(limit?: number): Promise<ArrayColl<Topic>> {
    throw new AbstractFunction();
  }

  fromJSON(json: any) {
    this.topic = sanitize.string(json.topic, null) ?? null;
    this.bodyText = sanitize.string(json.bodyText, null) ?? null;
    this.account = appGlobal.topicAccounts.find(acc => acc.id == json.accountID);
  }

  toJSON() {
    return {
      topic: this.topic,
      bodyText: this.bodyText,
      accountID: this.account?.id,
    };
  }

  clone(): SearchTopic {
    let clone = new (this as any).constructor();
    clone.fromJSON(this.toJSON());
    return clone;
  }

  matches(topic: Topic): boolean {
    if (this.topic && !topic.name?.includes(this.topic)) {
      return false;
    }
    if (this.bodyText && !topic.content?.find(content =>
          content instanceof Paragraph && content.rawHTMLDangerous.includes(this.bodyText as string))) {
      return false;
    }
    return true;
  }
}
