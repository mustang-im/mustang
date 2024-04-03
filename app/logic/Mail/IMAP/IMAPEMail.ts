import { EMail, PersonEmailAddress } from "../EMail";
import type { IMAPFolder } from "./IMAPFolder";
import { findOrCreatePerson, findOrCreatePersonEmailAddress } from "../Person";
import { Attachment, ContentDisposition } from "../Attachment";
import { RawFilesAttachment } from "../RawFiles/RawFilesAttachment";
import { SQLEMail } from "../SQL/SQLEMail";
import { sanitizeHTML } from "../../util/convertHTML";
import { assert } from "../../util/util";
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
    this.folder.runCommand(async (conn) => {
      let msgInfo = await conn.fetchOne(this.id);
      this.fromFlow(msgInfo);
    });
    await this.parseMIME();
  }

  fromFlow(msgInfo: any) {
    // <https://imapflow.com/global.html#FetchMessageObject>
    this.uid = msgInfo.uid;
    this.seq = msgInfo.seq;
    // <https://imapflow.com/global.html#MessageEnvelopeObject>
    let env = msgInfo.envelope;
    this.id = env?.messageId ?? this.uid;
    this.subject = env.subject;
    this.sent = env.date ?? new Date();
    this.received = new Date();
    this.setFlagsLocal(msgInfo.flags);
    this.inReplyTo = env.inReplyTo;
    let firstFrom = env.from && env.from[0];
    if (firstFrom) {
      this.contact = findOrCreatePerson(firstFrom.address, firstFrom.name);
      this.from = findOrCreatePersonEmailAddress(firstFrom.address, firstFrom.name);
    } else {
      this.contact = findOrCreatePerson("unknown@example.com", "Unknown");
      this.from = findOrCreatePersonEmailAddress("unknown@example.com", "Unknown");
    }
    addPersons(this.to, env.to);
    addPersons(this.cc, env.cc);
    addPersons(this.bcc, env.bcc);
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
    let mail = await new PostalMIME().parse(this.mime);
    for (let header of mail.headers) {
      this.headers.set(header.key, header.value);
    }
    this.text = mail.text;
    this.html = sanitizeHTML(mail.html);
    this.attachments.addAll(mail.attachments.map(a => {
      let attachment = new Attachment();
      attachment.filename = a.filename;
      attachment.mimeType = a.mimeType;
      attachment.disposition = a.disposition as ContentDisposition;
      attachment.related = a.related;
      attachment.contentID = a.contentId;
      attachment.content = new File([a.content], a.filename, { type: a.mimeType });
      attachment.size = attachment.content.size;
      return attachment;
    }));
    for (let a of this.attachments) {
      await RawFilesAttachment.save(a, this);
    }
    //console.log("imapflow mail", mail, "text", mail.text, "html", mail.html);
    //console.log("IMAPEMail", this, "text", this.text, "html", this.html);
    this.downloadComplete = true;
  }

  async markRead(read = true) {
    super.markRead(read);
    this.setFlagServer("\\Seen", read);
  }

  async markStarred(starred = true) {
    super.markStarred(starred);
    this.setFlagServer("\\Flagged", starred);
  }

  async markSpam(spam = true) {
    super.markSpam(spam);
    this.setFlagServer("\\Junk", spam);
  }

  async markReplied() {
    super.markReplied();
    this.setFlagServer("\\Answered", true);
  }

  async markDraft() {
    super.markDraft();
    this.setFlagServer("\\Draft", true);
  }

  /**
   * Set read/starred etc. flag on the message
   *
   * @param name -- the flag, e.g. "\Seen", "\Recent", "\Junk" etc.
   * @param set -- true = add the flag, false = remove the flag
   */
  async setFlagServer(name: string, set = true) {
    this.folder.runCommand(async (conn) => {
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
    this.folder.runCommand(async (conn) => {
      conn.messageDelete(this.uid, { uid: true });
    });
  }
}

function addPersons(targetList: ArrayColl<PersonEmailAddress>, personList: any[]): void {
  if (!personList?.length) {
    return;
  }
  targetList.addAll(personList.map(p =>
      findOrCreatePersonEmailAddress(p.address, p.name)));
}
