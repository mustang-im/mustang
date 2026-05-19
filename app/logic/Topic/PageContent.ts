import type { Topic } from "./Topic";
import type { EMail } from "../Mail/EMail";
import type { ChatMessage } from "../Chat/Message";
import type { SearchEMail } from "../Mail/Store/SearchEMail";
import type { SearchChat } from "../Chat/SearchChat";
import { Observable } from "../util/Observable";
import type { URLString } from "../util/util";
import { ArrayColl } from "svelte-collections";
import { sanitizeHTML } from "../util/convertHTML";

/** A section that appears on a page for a Topic */
export class PageContent extends Observable {
  topic: Topic;

  constructor(topic: Topic) {
    super();
    this.topic = topic;
    topic.content.add(this);
  }
}

export class Paragraph extends PageContent {
  /** not sanitized */
  rawHTMLDangerous: string = "";

  get html(): string {
    return sanitizeHTML(this.rawHTMLDangerous);
  }

  get hasContent(): boolean {
    return this.rawHTMLDangerous && this.rawHTMLDangerous != "<p></p>";
  }
}

export class Image extends PageContent {
  /** sanitized */
  src: URLString;
  description: string | null = null;
}

export class PersonsList extends PageContent {
  /** If the list of people is the result of a dynamic query. */
  // TODO need people search object
}

export class EMails extends PageContent {
  /** If the emails were manually added by the user */
  readonly emails = new ArrayColl<EMail>;
  /** If the list of emails is the result of a dynamic query.
   * Similar to a smart folder. */
  search: SearchEMail | null = null;
}

export class ChatMessages extends PageContent {
  /** If the emails were manually added by the user */
  readonly messages = new ArrayColl<ChatMessage>;
  /** If the list of messages is the result of a dynamic query. */
  search: SearchChat | null = null;
}

export class Spreadsheet extends PageContent {
}
