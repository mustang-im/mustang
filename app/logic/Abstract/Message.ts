import type { Contact } from "./Contact";
import type { Person } from "./Person";
import type { PersonUID } from "../Abstract/PersonUID";
import { convertHTMLToText, convertTextToHTML, sanitizeHTML } from "../util/convertHTML";
import { Observable, notifyChangedProperty } from "../util/Observable";
import { MapColl } from "svelte-collections";

export class Message extends Observable {
  /** protocol-specific ID for this message.
   * Allows for reactions, corrections etc. */
  id: string;
  dbID: number;
  outgoing = false;
  /**
   * Who this message was exchanged with.
   * if outgoing = true, this is the recipient, otherwise the sender
   */
  @notifyChangedProperty
  contact: Contact | PersonUID;
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
  inReplyTo: string | null = null;

  @notifyChangedProperty
  protected _text: string = null;
  /** Plaintext version of the message */
  get text(): string {
    if (this._text) {
      return this._text;
    }
    if (this._rawHTML) {
      return this._text = convertHTMLToText(this._rawHTML);
    }
    return null;
  }
  /** Must also set `.html` (or at least get `.html` to auto-generate it),
   * to keep them in sync. */
  set text(val: string) {
    this._text = val;
  }

  /** HTML version of the message.
   * Directly from the network.
   * Attention: Untrusted. MUST be sanitized before using it.
   * @see _sanitizedHTML */
  @notifyChangedProperty
  protected _rawHTML: string = null;
  /** HTML version of the message.
   * Sanitized. */
  protected _sanitizedHTML: string = null;
  /** HTML version of the message.
   * Sanitized. */
  get html(): string {
    if (this._sanitizedHTML) {
      return this._sanitizedHTML;
    }
    if (this._rawHTML) {
      return this._sanitizedHTML = sanitizeHTML(this._rawHTML);
    }
    if (this._text) {
      return this._sanitizedHTML = convertTextToHTML(this._text);
    }
    return null;
  }
  /** Must also set `.text` (or at least get `.text` to auto-generate it),
   * to keep them in sync. */
  set html(val: string) {
    this._rawHTML = val;
    this._sanitizedHTML = null;
  }
  /** Get the raw HTML, as we received it from the network.
   * ATTENTION: DANGEROUS: You MUST NOT render this,
   * neither directly nor indirectly.  If you save this, make sure that
   * all reading paths sanitize the HTML before rendering it. */
  get rawHTMLDangerous(): string {
    return this._rawHTML;
  }
  set rawHTMLDangerous(val: string) {
    this.html = val;
  }
  get rawText(): string {
    return this._text;
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
