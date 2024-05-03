import { Message } from "../Abstract/Message";
import { type Folder, SpecialFolder } from "./Folder";
import { Attachment, ContentDisposition } from "./Attachment";
import { RawFilesAttachment } from "./Store/RawFilesAttachment";
import { SQLEMail } from "./SQL/SQLEMail";
import { MailZIP } from "./Store/MailZIP";
import { MailDir } from "./Store/MailDir";
import { PersonUID, findOrCreatePersonUID } from "../Abstract/PersonUID";
import { appGlobal } from "../app";
import { fileExtensionForMIMEType, assert, AbstractFunction } from "../util/util";
import { sanitize } from "../../../lib/util/sanitizeDatatypes";
import { notifyChangedProperty } from "../util/Observable";
import { ArrayColl, Collection, MapColl } from "svelte-collections";
import PostalMIME from "postal-mime";

export class EMail extends Message {
  @notifyChangedProperty
  subject: string;
  @notifyChangedProperty
  from = new PersonUID();
  @notifyChangedProperty
  replyTo = new PersonUID();
  readonly to = new ArrayColl<PersonUID>();
  readonly cc = new ArrayColl<PersonUID>();
  readonly bcc = new ArrayColl<PersonUID>();
  readonly attachments = new ArrayColl<Attachment>();
  readonly headers = new MapColl<string, string>();
  /** Size of full RFC822 MIME message, in bytes */
  @notifyChangedProperty
  size: number;
  /** List of parent message IDs, starting with top level and ending with direct parent.
   * The last entry should theoretically match `inReplyTo`. */
  @notifyChangedProperty
  references: string[] | null = null;

  /** This is a Junk message */
  @notifyChangedProperty
  isSpam = false;
  /** The user has answered this message, by clicking "Reply" */
  @notifyChangedProperty
  isReplied = false;
  /** The user started writing this message, but didn't send it yet */
  @notifyChangedProperty
  isDraft = false;
  /** Complete MIME source of the email */
  mime: Uint8Array | undefined;
  folder: Folder;
  /** msg ID of the thread starter message */
  threadID: string | null = null;
  /** Protocol-specific ID for this email.
   * E.g. UID or seq for IMAP, or EWS ID string.
   * The type string or number depends on the protocol.
   * Each protocol defines a get/set function with the protocol-specific name,
   * E.g. `IMAPEMail.uid: number` and `EWSEMail.itemID: string` are getters for pID. */
  pID: string | number | null = null;
  /** This message has been downloaded completely,
   * with header, body, and all attachments. */
  downloadComplete = false;
  /** Was just downloaded, but wasn't saved to local disk yet.
   * Set only temporarily. */
  needSave = false;
  /** Body hasn't been loaded yet */
  needToLoadBody = true;

  constructor(folder: Folder) {
    super();
    this.folder = folder;
  }

  get messageID(): string {
    return this.id;
  }
  set messageID(val: string) {
    this.id = val;
  }

  get baseSubject(): string {
    return this.subject.replace(/^([Re|RE|AW|Aw]: ?)+/, "");
  }

  async markSpam(spam = true) {
    this.isSpam = spam;
  }

  async markReplied() {
    this.isReplied = true;
  }

  async markDraft() {
    this.isDraft = true;
  }

  async deleteMessage() {
    this.folder.messages.remove(this);
    await SQLEMail.deleteIt(this);
  }

  async parseMIME() {
    assert(this.mime?.length, "MIME source not yet downloaded");
    assert(this.mime instanceof Uint8Array, "MIME source should be a byte array");
    //console.log("MIME source", this.mime, new TextDecoder("utf-8").decode(this.mime));
    let mail = await new PostalMIME().parse(this.mime);

    // Headers
    /** TODO header.key returns Uint8Array
    for (let header of mail.headers) {
      try {
        this.headers.set(sanitize.nonemptystring(header.key), sanitize.nonemptystring(header.value));
      } catch (ex) {
        this.folder.account.errorCallback(ex);
      }
    }*/

    if (!this.id || !this.subject || !this.from || !this.sent) {
      this.id = sanitize.string(mail.messageId, this.id ?? "");
      this.subject = sanitize.string(mail.subject, this.subject ?? "");
      this.sent = sanitize.date(mail.date, this.sent ?? new Date());
      if (mail.from?.address) {
        this.from = findOrCreatePersonUID(sanitize.nonemptystring(mail.from.address), sanitize.label(mail.from.name, null));
      } else {
        this.from = findOrCreatePersonUID("unknown@invalid", "Unknown");
      }
    }
    if (this.to.isEmpty) {
      setPersons(this.to, mail.to);
      setPersons(this.cc, mail.cc);
      setPersons(this.bcc, mail.bcc);
    }
    this.outgoing = appGlobal.me.emailAddresses.some(e => e.value == this.from.emailAddress);
    this.contact = this.outgoing ? this.to.first : this.from;
    if (!this.replyTo && mail.replyTo?.length) {
      let p = mail.replyTo[0];
      this.replyTo = findOrCreatePersonUID(sanitize.nonemptystring(p.address, "unknown@invalid"), sanitize.label(p.name, null));
    }
    if (!this.inReplyTo) {
      this.inReplyTo = sanitize.string(mail.inReplyTo, null);
    }
    this.references = sanitize.string(mail.references, null)?.split(" ");

    // Body
    this.text = mail.text;
    let html = sanitize.string(mail.html, null);
    if (html) {
      this.html = html;
    }
    this.needToLoadBody = false;

    // Attachments
    let fallbackID = 0;
    this.attachments.addAll(mail.attachments.map(a => {
      try {
        let attachment = new Attachment();
        attachment.contentID = sanitize.nonemptystring(a.contentId, "" + ++fallbackID);
        attachment.mimeType = sanitize.nonemptystring(a.mimeType, "application/octet-stream");
        attachment.filename = sanitize.nonemptystring(a.filename, "attachment-" + fallbackID + "." + fileExtensionForMIMEType(attachment.mimeType));
        attachment.disposition = sanitize.translate(a.disposition, {
          attachment: ContentDisposition.attachment,
          inline: ContentDisposition.inline,
        }, ContentDisposition.unknown);
        attachment.related = sanitize.boolean(a.related, false);
        attachment.content = new File([a.content], attachment.filename, { type: attachment.mimeType });
        attachment.size = sanitize.integer(attachment.content.size, -1);
        return attachment;
      } catch (ex) {
        this.folder.account.errorCallback(ex);
      }
    }).filter(attachment => !!attachment));
  }

  /**
   * Saves the email
   * 1. in the database (meta-data, body text)
   * 2. attachments as raw files
   * 3. the MIME source as mail.zip
   *
   * Do this only exactly once per email `dbID`.
   * This typically happens immediately after`parseMIME()`. */
  async save() {
    if (await this.isDownloadCompleteDoublecheck()) {
      return;
    }
    await SQLEMail.save(this);
    await MailZIP.save(this);
    //await MailDir.save(this);
    try {
      await RawFilesAttachment.saveEMail(this);
    } catch (ex) {
      console.log(ex);
    }
    this.downloadComplete = true;
    await SQLEMail.saveWritableProps(this);
  }

  protected async isDownloadCompleteDoublecheck(): Promise<boolean> {
    if (this.downloadComplete) {
      return true;
    }
    // Double-check for concurrent downloads
    let check = this.folder.newEMail();
    check.dbID = this.dbID;
    await SQLEMail.readWritableProps(this);
    return check.downloadComplete;
  }

  get html(): string {
    if (!this.needToLoadBody) {
      return super.html;
    }

    (async () => { // observers will trigger reload
      try {
        if (this.dbID) {
          await SQLEMail.readBody(this);
        }
      } catch (ex) {
        this.folder.account.errorCallback(ex);
      }
      try {
        if (this.needToLoadBody) {
          await this.download();
        }
      } catch (ex) {
        this.folder.account.errorCallback(ex);
        // this.text = ex?.message ?? ex + "";
      }
    })();
    return this.dbID
      ? "Message content not downloaded yet"
      : "Message not loaded yet";
  }
  set html(val: string) {
    super.html = val;
  }

  async download() {
    throw new AbstractFunction();
  }

  async findThread(messages: Collection<EMail>): Promise<string | null>{
    if (this.threadID) {
      return this.threadID;
    }
    if (!this.dbID) {
      return null;
    }
    let inReplyTo = null;
    while (inReplyTo) {
      let parent = messages.find(msg => msg.id == inReplyTo);
      inReplyTo = parent?.inReplyTo;
    }
    this.threadID = inReplyTo ?? null;
    await SQLEMail.saveWritableProps(this);
    return this.threadID;
  }

  quotePrefixLine(): string {
    function getDate(date: Date) {
      return date.toLocaleString(navigator.language, { year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric" });
    }
    return `${this.contact.name} wrote on ${getDate(this.sent)}:`;
  }

  _reply(): EMail {
    this.markReplied().catch(this.folder.account.errorCallback);
    let account = this.folder.account;
    let folder = account.getSpecialFolder(SpecialFolder.Drafts);
    let reply = folder.newEMail();
    reply.from.emailAddress = account.emailAddress;
    reply.from.name = account.userRealname;
    reply.subject = "Re: " + this.baseSubject; // Do *not* localize "Re: "
    reply.html = `<p></p>
    <p></p>
    <p></p>
    <p class="quote-header">${this.quotePrefixLine()}</p>
    <blockquote cite="mid:${this.id}">
      ${this.html}
    </blockquote>`;
    return reply;
  }

  replyToAuthor(): EMail {
    let reply = this._reply();
    reply.to.add(this.from);
    return reply;
  }

  replyAll(): EMail {
    let reply = this.replyToAuthor();
    reply.to.addAll(this.to.contents.filter(pe => !appGlobal.me.emailAddresses.some(em => em.value == pe.emailAddress)));
    reply.cc.addAll(this.cc.contents.filter(pe => !appGlobal.me.emailAddresses.some(em => em.value == pe.emailAddress)));
    return reply;
  }

  async send(): Promise<void> {
    this.isDraft = false;
    let server = this.folder?.account;
    assert(server, "Cannot send: Server for draft email is not configured");
    await server.send(this);
    console.log("Sent email", this.subject, "to", this.to.first.emailAddress, this);
    // TODO move to Sent or target folder?
  }

  /**
   * @param up
   * true: older message
   * false: newer message
   * null: Same list position, after deleting this message
   */
  nextMessage(up?: boolean): EMail {
    let i = this.folder.messages.getKeyForValue(this);
    if (typeof (up) == "boolean") {
      up ? --i : ++i;
    }
    return this.folder.messages.getIndex(i);
  }
}

export function setPersons(targetList: ArrayColl<PersonUID>, personList: { address: string, name: string }[]): void {
  targetList.clear();
  if (!personList?.length) {
    return;
  }
  targetList.addAll(personList.map(p =>
    findOrCreatePersonUID(sanitize.nonemptystring(p.address, "unknown@invalid"), sanitize.label(p.name, null))));
}
