import { EMail, PersonEmailAddress } from "../EMail";
import type { IMAPFolder } from "./IMAPFolder";
import { findOrCreatePerson, findOrCreatePersonEmailAddress } from "../Person";
import { Attachment, ContentDisposition } from "../Attachment";
import { RawFilesAttachment } from "../RawFiles/RawFilesAttachment";
import { SQLEMail } from "../SQL/SQLEMail";
import { sanitizeHTML } from "../../util/convertHTML";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assert, fileExtensionForMIMEType } from "../../util/util";
import type { ArrayColl } from "svelte-collections";
import PostalMIME from "postal-mime";

export class IMAPEMail extends EMail {
  folder: IMAPFolder;
  /** From IMAP server */
  uid: number | null = null;
  seq: number | null = null;

  constructor(folder: IMAPFolder) {
    super(folder);
  }

  async download() {
    await this.folder.runCommand(async (conn) => {
      let msgInfo = await conn.fetchOne(this.id);
      this.fromFlow(msgInfo);
    });
    await this.parseMIME();
  }

  fromFlow(msgInfo: any) {
    // <https://imapflow.com/global.html#FetchMessageObject>
    this.uid = sanitize.integer(msgInfo.uid, null);
    this.seq = sanitize.integer(msgInfo.seq, null);
    // <https://imapflow.com/global.html#MessageEnvelopeObject>
    let env = msgInfo.envelope;
    this.id = sanitize.nonemptystring(env.messageId, this.uid + "");
    this.subject = sanitize.string(env.subject, null);
    this.sent = sanitize.date(env.date, new Date());
    this.received = new Date();
    this.setFlagsLocal(msgInfo.flags);
    this.inReplyTo = sanitize.string(env.inReplyTo, null);
    let firstFrom = env.from && env.from[0];
    if (firstFrom) {
      this.contact = findOrCreatePerson(sanitize.nonemptystring(firstFrom.address), sanitize.string(firstFrom.name, null));
      this.from = findOrCreatePersonEmailAddress(firstFrom.address, firstFrom.name);
    } else {
      this.contact = findOrCreatePerson("unknown@example.com", "Unknown");
      this.from = findOrCreatePersonEmailAddress("unknown@example.com", "Unknown");
    }
    addPersons(this.to, env.to);
    addPersons(this.cc, env.cc);
    addPersons(this.bcc, env.bcc);
    assert(!msgInfo.source || msgInfo.source instanceof Uint8Array, "MIME source needs to be a buffer");
    this.mime = msgInfo.source;
  }

  setFlagsLocal(flags: Set<string>) {
    if (!(flags && flags instanceof Set)) {
      return;
    }
    this.isRead = flags.has("\\Seen");
    this.isNewArrived = flags.has("\\Recent");
    this.isStarred = flags.has("\\Flagged");
    this.isReplied = flags.has("\\Answered");
    this.isSpam = flags.has("\\Junk");
    this.isDraft = flags.has("\\Draft");
  }

  async parseMIME() {
    //console.log("MIME source", this.mime, new TextDecoder("utf-8").decode(this.mime));
    assert(this.mime?.length, "MIME source not yet downloaded");
    assert(this.mime instanceof Uint8Array, "MIME source should be a byte array");
    let mail = await new PostalMIME().parse(this.mime);
    /** TODO header.key returns Uint8Array
    for (let header of mail.headers) {
      this.headers.set(sanitize.nonemptystring(header.key), sanitize.nonemptystring(header.value));
    }*/
    this.text = mail.text;
    this.html = sanitizeHTML(sanitize.string(mail.html, null));
    let fallbackID = 0;
    this.attachments.addAll(mail.attachments.map(a => {
      try {
        let attachment = new Attachment();
        attachment.contentID = sanitize.nonemptystring(a.contentId, ++fallbackID);
        attachment.mimeType = sanitize.string(a.mimeType, "application/octet-stream");
        attachment.filename = sanitize.string(a.filename, "attachment" + fallbackID + "." + fileExtensionForMIMEType(attachment.mimeType));
        attachment.disposition = sanitize.translate(a.disposition, {
          attachment: ContentDisposition.attachment,
          inline: ContentDisposition.inline,
        }, ContentDisposition.unknown);
        attachment.related = a.related ? sanitize.boolean(a.related) : false;
        attachment.content = new File([a.content], a.filename, { type: a.mimeType });
        attachment.size = sanitize.integer(attachment.content.size, -1);
        return attachment;
      } catch (ex) {
        this.folder.account.errorCallback(ex);
      }
    }).filter(attachment => !!attachment));
    if (this.attachments.hasItems) {
      await Promise.all(this.attachments.contents.map(a =>
        RawFilesAttachment.save(a, this)));
      await RawFilesAttachment.emailFinished(this);
    }
    //console.log("imapflow mail", mail, "text", mail.text, "html", mail.html);
    //console.log("IMAPEMail", this, "text", this.text, "html", this.html);
    this.downloadComplete = true;
  }

  async markRead(read = true) {
    await super.markRead(read);
    await this.setFlagServer("\\Seen", read);
  }

  async markStarred(starred = true) {
    await super.markStarred(starred);
    await this.setFlagServer("\\Flagged", starred);
  }

  async markSpam(spam = true) {
    await super.markSpam(spam);
    await this.setFlagServer("\\Junk", spam);
  }

  async markReplied() {
    await super.markReplied();
    await this.setFlagServer("\\Answered", true);
  }

  async markDraft() {
    await super.markDraft();
    await this.setFlagServer("\\Draft", true);
  }

  /**
   * Set read/starred etc. flag on the message
   *
   * @param name -- the flag, e.g. "\Seen", "\Recent", "\Junk" etc.
   * @param set -- true = add the flag, false = remove the flag
   */
  async setFlagServer(name: string, set = true) {
    await this.folder.runCommand(async (conn) => {
      if (set) {
        await conn.messageFlagsAdd(this.uid, [name], { uid: true });
      } else {
        await conn.messageFlagsRemove(this.uid, [name], { uid: true });
      }
    });
  }

  async deleteMessage() {
    await super.deleteMessage();
    await SQLEMail.deleteIt(this);
    await this.folder.runCommand(async (conn) => {
      await conn.messageDelete(this.uid, { uid: true });
    });
  }
}

function addPersons(targetList: ArrayColl<PersonEmailAddress>, personList: any[]): void {
  if (!personList?.length) {
    return;
  }
  targetList.addAll(personList.map(p =>
    findOrCreatePersonEmailAddress(sanitize.nonemptystring(p.address), sanitize.string(p.name, null))));
}
