import type { TopicAccount } from "./TopicAccount";
import { Paragraph, type PageContent } from "./PageContent";
import type { Person } from "../Abstract/Person";
import type { Group } from "../Abstract/Group";
import type { Message } from "../Abstract/Message";
import type { Event } from "../Calendar/Event";
import type { File } from "../Files/File";
import { Observable, notifyChangedProperty } from "../util/Observable";
import { assert } from "../util/util";
import { ArrayColl, MapColl } from "svelte-collections";

export class Topic extends Observable {
  id: string = crypto.randomUUID();
  account: TopicAccount;
  /** Title of the topic.
   * Shown in graph as node title, in page as page title, and
   * in linked data as tag name.
   * Also `#<name>` in text. */
  @notifyChangedProperty
  name: string;
  dbID: number;

  parent: Topic | null = null;
  /** Sub-topics */
  readonly children = new ArrayColl<Topic>();
  /** Connections to other objects (other than child/parent).
   * In LinkedData, these are the object properties.
   * Has to be lazy-loaded.
   *
   * map key: The link target
   * map value: the nature of the link, e.g. a schema.org property name
   */
  readonly links = new MapColl<LinkTarget, LinkType>();

  /**
   * Structured information about the topic.
   * In LinkedData, these are the non-object properties.
   */
  readonly properties = new ArrayColl<ValueProperty>();

  /** Paragraphs and data elements in the page.
   * In the order that they appear on the page. */
  readonly content = new ArrayColl<PageContent>();

  trimEnd() {
    let p = this.content.last;
    while (p instanceof Paragraph && !p.hasContent) {
      this.content.remove(p);
      p = this.content.last;
    }
  }

  async newChild(name: string): Promise<Topic> {
    assert(this.account, "Need account");
    let topic = new Topic();
    topic.account = this.account;
    topic.parent = this;
    this.children.add(topic);
    topic.name = name;
    await topic.save();
    return topic;
  }

  async save() {
    await this.account.storage.saveTopic(this);
  }

  async deleteIt() {
    this.parent.children.remove(this);
    await this.account.storage.deleteTopic(this);
  }
}

export type LinkTarget = Topic | Person | Group | Message | Event | File;

export type LinkType = string;

export interface ValueProperty {
  name: string;
  value: string | number | boolean;
}
