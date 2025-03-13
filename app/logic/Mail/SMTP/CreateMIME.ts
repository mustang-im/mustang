import type { EMail } from "../EMail";
import type { PersonUID } from "../../Abstract/PersonUID";
import { Attachment , ContentDisposition } from "../../Abstract/Attachment";
import { getICal } from "../../Calendar/ICal/ICalGenerator";
import { appGlobal } from "../../app";
import { getLocalStorage } from "../../../frontend/Util/LocalStorage";
import { blobToBase64 } from "../../util/util";
import type { ArrayColl } from "svelte-collections";
import type { default as Mail, Attachment as NMAttachment, Address as NMAddress } from "nodemailer/lib/mailer";
type NMMail = Mail.Options;

export class CreateMIME {
  static async getMIME(email: EMail): Promise<Uint8Array> {
    let mail = await CreateMIME.getNMMail(email);
    return await appGlobal.remoteApp.getMIMENodemailer(mail);
  }

  static async getNMMail(email: EMail): Promise<NMMail> {
    let doHTML = getLocalStorage("mail.send.format", "html").value == "html";
    // <https://nodemailer.com/message/>
    return {
      subject: email.subject,
      inReplyTo: email.inReplyTo,
      from: CreateMIME.getRecipient(email.from),
      replyTo: email.replyTo ? CreateMIME.getRecipient(email.replyTo) : null,
      references: email.references,
      to: CreateMIME.getRecipients(email.to),
      cc: CreateMIME.getRecipients(email.cc),
      bcc: CreateMIME.getRecipients(email.bcc),
      text: email.text,
      html: doHTML ? email.html : null,
      icalEvent: getICal(email.event, email.iCalMethod),
      attachDataUrls: true,
      attachments: await CreateMIME.getAttachments(email),
      headers: email.headers.contentKeyValues(),
      disableFileAccess: true,
      disableUrlAccess: true,
    };
  }

  protected static getRecipients(recipients: ArrayColl<PersonUID>): NMAddress[] {
    return recipients.contents.map(to => CreateMIME.getRecipient(to));
  }
  protected static getRecipient(to: PersonUID): NMAddress {
    // `${to.name} <${to.emailAddress}>` created by nodemailer, with quotes
    return {
      name: to.name,
      address: to.emailAddress,
    };
  }
  protected static async getAttachments(email: EMail): Promise<NMAttachment[]> {
    return await Promise.all(email.attachments.contents.map((a) => CreateMIME.getAttachment(a)));
  }
  protected static async getAttachment(a: Attachment): Promise<NMAttachment> {
    return {
      filename: a.filename,
      content: await blobToBase64(a.content),
      encoding: "base64",
      contentType: a.mimeType,
      contentDisposition: a.disposition == ContentDisposition.inline ? 'inline' : 'attachment',
      cid: a.contentID,
    };
  }
}
