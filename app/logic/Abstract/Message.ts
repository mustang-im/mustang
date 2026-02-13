import type { Group } from "./Group";
import type { Person } from "./Person";
import type { PersonUID } from "../Abstract/PersonUID";
import type { Attachment } from "./Attachment";
import { convertHTMLToText, convertTextToHTML, sanitizeHTML, sanitizeHTMLExternal } from "../util/convertHTML";
import { Observable, notifyChangedProperty } from "../util/Observable";
import { backgroundError } from "../../frontend/Util/error";
import { ArrayColl, MapColl } from "svelte-collections";

export class Message extends Observable {
  /** protocol-specific ID for this message.
   * Allows for reactions, corrections etc. */
  id: string;
  dbID: number | string;
  outgoing = false;
  /**
   * Who this message was exchanged with.
   * if outgoing = true, this is the recipient, otherwise the sender
   */
  @notifyChangedProperty
  contact: PersonUID | Person | Group;
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
  readonly attachments = new ArrayColl<Attachment>();

  @notifyChangedProperty
  subject: string = "";
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
   * This is the version that will be saved on disk.
   * @see _sanitizedHTML */
  @notifyChangedProperty
  protected _rawHTML: string = null;
  /** HTML version of the message.
   * Sanitized.
   * This is only cached here in RAM, but not saved on disk,
   * so that we can change the sanitization. */
  protected _sanitizedHTML: string = null;
  /** Allow HTTPS? */
  @notifyChangedProperty
  protected _loadExternalImages = false;

  /** HTML version of the message.
   * Sanitized. */
  get html(): string {
    if (this._sanitizedHTML) {
      return this._sanitizedHTML;
    }
    try {
      if (this._rawHTML) {
        return this._sanitizedHTML = this.loadExternalImages
          ? sanitizeHTMLExternal(this._rawHTML)
          : sanitizeHTML(this._rawHTML);
      }
      if (this._text) {
        return this._sanitizedHTML = convertTextToHTML(this._text);
      }
    } catch (ex) {
      backgroundError(ex);
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
  get hasHTML(): boolean {
    return !!this._rawHTML;
  }
  get hasVisibleAttachments(): boolean {
    return this.attachments.hasItems && this.attachments.some(att => !att.hidden);
  }

  /** Allow images and stylesheets to load from https: ? */
  get loadExternalImages(): boolean {
    return this._loadExternalImages;
  }
  set loadExternalImages(val: boolean) {
    if (this._loadExternalImages == val) {
      return;
    }
    this._sanitizedHTML = null; // forces re-rendering
    this._loadExternalImages = val; // notifyChangedProperty triggers update
  }

  readonly reactions = new MapColl<PersonUID, string>();

  async markRead(read = true) {
    this.isRead = read;
  }
  async markStarred(starred = true) {
    this.isStarred = starred;
  }

  async deleteMessage() {
    console.log("Delete message");
  }

  copyFrom(other: Message, withAttachments: boolean = false): void {
    other.outgoing = this.outgoing;
    other.contact = this.contact;
    other.sent.setTime(this.sent.getTime());
    other.received.setTime(this.received.getTime());
    other.isNewArrived = this.isNewArrived;
    other.isRead = this.isRead;
    other.isStarred = this.isStarred;
    other.inReplyTo = this.inReplyTo;
    other.subject = this.subject;
    other._text = this._text;
    other._rawHTML = this._rawHTML;
    // _sanitizedHTML and _loadExternalImages not copied
    if (withAttachments) {
      // TODO Clone `Attachment` objects
      other.attachments.replaceAll(this.attachments);
    }
  }
}
