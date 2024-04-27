import { Message } from "../Abstract/Message";
import { type Folder, SpecialFolder } from "./Folder";
import type { Person } from "../Abstract/Person";
import { Attachment, ContentDisposition } from "./Attachment";
import { RawFilesAttachment } from "./Store/RawFilesAttachment";
import { SQLEMail } from "./SQL/SQLEMail";
import { MailZIP } from "./Store/MailZIP";
import { MailDir } from "./Store/MailDir";
import { findOrCreatePerson, findOrCreatePersonEmailAddress } from "./Person";
import { sanitizeHTML } from "../util/convertHTML";
import { appGlobal } from "../app";
import { fileExtensionForMIMEType, assert } from "../util/util";
import { sanitize } from "../../../lib/util/sanitizeDatatypes";
import { notifyChangedProperty } from "../util/Observable";
import { ArrayColl, MapColl } from "svelte-collections";
import PostalMIME from "postal-mime";

export class EMail extends Message {
  @notifyChangedProperty
  subject: string;
  @notifyChangedProperty
  from = new PersonEmailAddress();
  @notifyChangedProperty
  replyTo = new PersonEmailAddress();
  readonly to = new ArrayColl<PersonEmailAddress>();
  readonly cc = new ArrayColl<PersonEmailAddress>();
  readonly bcc = new ArrayColl<PersonEmailAddress>();
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
  /** This message has been downloaded completely,
   * with header, body, and all attachments. */
  downloadComplete = false;
  /** Was just downloaded, but wasn't saved to local disk yet.
   * Set only temporarily. */
  needSave = false;

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
        this.contact = findOrCreatePerson(sanitize.nonemptystring(mail.from.address), sanitize.label(mail.from.name, null));
        this.from = findOrCreatePersonEmailAddress(sanitize.nonemptystring(mail.from.address), sanitize.label(mail.from.name, null));
      } else {
        this.contact = findOrCreatePerson("unknown@invalid", "Unknown");
        this.from = findOrCreatePersonEmailAddress("unknown@invalid", "Unknown");
      }
    }
    if (this.to.isEmpty) {
      setPersons(this.to, mail.to);
      setPersons(this.cc, mail.cc);
      setPersons(this.bcc, mail.bcc);
    }
    if (!this.replyTo && mail.replyTo?.length) {
      let p = mail.replyTo[0];
      this.replyTo = findOrCreatePersonEmailAddress(sanitize.nonemptystring(p.address, "unknown@invalid"), sanitize.label(p.name, null));
    }
    if (!this.inReplyTo) {
      this.inReplyTo = sanitize.string(mail.inReplyTo, null);
    }
    this.references = sanitize.string(mail.references, null)?.split(" ");

    // Body
    this.text = mail.text;
    let html = sanitize.string(mail.html, null);
    if (html) {
      this.html = sanitizeHTML(html);
    }

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
    if (this.downloadComplete) {
      return;
    }
    assert(!this.downloadComplete, `Already saved this email (dbID ${this.dbID})`);
    await SQLEMail.save(this);
    await MailZIP.save(this);
    await MailDir.save(this);
    //await RawFilesAttachment.saveEMail(this);
    this.downloadComplete = true;
    await SQLEMail.saveWritableProps(this);
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
    assert(this.folder?.account?.outgoing, "Outgoing server not set up for account " + this.folder?.account?.name);
    await this.folder.account.outgoing.send(this);
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

export class PersonEmailAddress {
  name: string;
  emailAddress: string;
  person?: Person;

  static fromPerson(person: Person) {
    let pe = new PersonEmailAddress();
    pe.name = person.name;
    pe.emailAddress = person.emailAddresses.first?.value;
    pe.person = person;
    return pe;
  }
}

export function setPersons(targetList: ArrayColl<PersonEmailAddress>, personList: { address: string, name: string }[]): void {
  targetList.clear();
  if (!personList?.length) {
    return;
  }
  targetList.addAll(personList.map(p =>
    findOrCreatePersonEmailAddress(sanitize.nonemptystring(p.address, "unknown@invalid"), sanitize.label(p.name, null))));
}
