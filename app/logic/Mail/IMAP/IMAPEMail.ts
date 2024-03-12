import { EMail } from "../EMail";
import { Attachment, ContentDisposition } from "../Attachment";
import type { IMAPFolder } from "./IMAPFolder";
import type { Person } from "../../Abstract/Person";
import { findOrCreatePerson } from "../Person";
import { assert } from "../../util/util";
import type { MapColl } from "svelte-collections";
import PostalMIME from "postal-mime";

export class IMAPEMail extends EMail {
  _folder: IMAPFolder;
  /** From IMAP server */
  uid: number;
  /** This message has been downloaded completely,
   * with header, body, and all attachments. */
  downloadComplete = false;

  constructor(folder: IMAPFolder) {
    super();
    this._folder = folder;
  }

  async download() {
    let lock;
    try {
      console.log("fetch msg", this.subject);
      let conn = this._folder._account._connection;
      lock = await conn.getMailboxLock(this._folder.path);
      let msgInfo = await conn.fetchOne(this.id);
      this.fromFlow(msgInfo);
    } finally {
      lock?.release();
    }
  }

  fromFlow(msgInfo: any) {
    this.uid = msgInfo.uid;
    let env = msgInfo.envelope;
    this.id = env.messageId;
    this.subject = env.subject;
    this.sent = env.date ?? new Date(); // TODO
    this.received = env.date ?? new Date();
    this.inReplyTo = env.inReplyTo;
    let firstFrom = env.from[0];
    if (firstFrom) {
      this.authorEmailAddress = firstFrom.address;
      this.contact = findOrCreatePerson(firstFrom.address, firstFrom.name);
    }
    addPersons(this.to, env.to);
    addPersons(this.cc, env.cc);
    addPersons(this.bcc, env.bcc);
    this.mime = msgInfo.source;
  }

  async parseMIME() {
    //console.log("MIME source", this.mime, new TextDecoder("utf-8").decode(this.mime));
    assert(this.mime?.length, "MIME source not yet downloaded");
    //console.log("MIME source", new TextDecoder("utf-8").decode(this.mime));
    let mail = await new PostalMIME().parse(this.mime);
    console.log("mail", mail);
    for (let header of mail.headers) {
      this.headers.set(header.key, header.value);
    }
    this.text = mail.text;
    this.html = mail.html;
    this.attachments.addAll(mail.attachments.map(a => {
      let attachment = new Attachment();
      attachment.filename = a.filename;
      attachment.mimeType = a.mimeType;
      attachment.disposition = a.disposition as ContentDisposition;
      attachment.related = a.related;
      attachment.contentID = a.contentId;
      attachment.content = new File([ a.content ], a.filename, { type: a.mimeType });
      return attachment;
    }));
    console.log("IMAPEMail", this);
  }
}

function addPersons(targetList: MapColl<string, Person>, personList: any[]): void {
  if (!personList?.length) {
    return;
  }
  for (let personInfo of personList) {
    targetList.set(personInfo.address, findOrCreatePerson(personInfo.address, personInfo.name));
  }
}
