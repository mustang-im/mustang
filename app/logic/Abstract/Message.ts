import type { Contact } from "./Contact";
import type { Person } from "./Person";
import { convertHTMLToText, convertTextToHTML, sanitizeHTML } from "../util/convertHTML";
import { Observable, notifyChangedProperty } from "../util/Observable";
import { MapColl } from "svelte-collections";

export class Message extends Observable {
  /** protocol-specific ID for this message.
   * Allows for reactions, corrections etc. */
  id: string;
  outgoing = false;
  /**
   * Who this message was exchanged with.
   * if outgoing = true, this is the recipient, otherwise the sender
   */
  @notifyChangedProperty
  contact: Contact;
  /** When the message was sent */
  @notifyChangedProperty
  sent: Date;
  /** When the message was received */
  @notifyChangedProperty
  received: Date;
  /** This message just arrived in the inbox and this is the first
   * session to see this message */
  @notifyChangedProperty
  isNewArrived = false;
  /** User has read the contents of the message */
  @notifyChangedProperty
  isRead = false;
  /** User marked this message as special to remember */
  @notifyChangedProperty
  isStarred = false;
  /** Msg ID of another message that this one is a reply of */
  inReplyTo: string | undefined;

  /** Plaintext version of the message */
  @notifyChangedProperty
  _text: string;
  get text(): string {
    if (this._text) {
      return this._text;
    }
    if (this._html) {
      return convertHTMLToText(this._html);
    }
    return null;
  }
  set text(val: string) {
    this._text = val;
  }

  /** HTML version of the message */
  @notifyChangedProperty
  _html: string;
  get html(): string {
    if (this._html) {
      return this._html;
    }
    if (this._text) {
      return convertTextToHTML(this._text);
    }
    return null;
  }
  set html(val: string) {
    this._html = sanitizeHTML(val);
  }

  readonly reactions = new MapColl<Person, string>();

  async markRead(read = true) {
    this.isRead = read;
  }
  async markStarred(starred = true) {
    this.isStarred = starred;
  }

  async deleteMessage() {
    console.log("Delete message");
  }
}
