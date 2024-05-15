import { MailAccount, TLSSocketType } from "../MailAccount";
import type { EMail } from "../EMail";
import type { PersonUID } from "../../Abstract/PersonUID";
import { Attachment , ContentDisposition } from "../Attachment";
import { appGlobal } from "../../app";
import { blobToBase64 } from "../../util/util";
import type { ArrayColl } from "svelte-collections";
import type { Attachment as NMAttachment, Address as NMAddress } from "@types/nodemailer/lib/mailer";

export class SMTPAccount extends MailAccount {
  readonly protocol: string = "smtp";

  protected getTransportOptions() {
    return {
      host: this.hostname,
      port: this.port,
      secure: this.tls == TLSSocketType.TLS,
      tls: {
        requireTLS: this.tls == TLSSocketType.STARTTLS,
      },
      auth: {
        user: this.username,
        pass: this.password,
        // TODO type: 'oauth2',
      },
      dnsTimeout: 5000,
      connectionTimeout: 5000,
      greetingTimeout: 20000,
      logger: true,
    };
  }

  async send(email: EMail): Promise<void> {
    try {
      let result = await appGlobal.remoteApp.sendMailNodemailer(this.getTransportOptions(), {
        subject: email.subject,
        inReplyTo: email.inReplyTo,
        from: SMTPAccount.getRecipient(email.from),
        replyTo: email.replyTo ? SMTPAccount.getRecipient(email.replyTo) : null,
        to: SMTPAccount.getRecipients(email.to),
        cc: SMTPAccount.getRecipients(email.cc),
        bcc: SMTPAccount.getRecipients(email.bcc),
        text: email.text,
        html: email.html,
        attachDataUrls: true,
        attachments: await SMTPAccount.getAttachments(email),
      });
      email.sent = new Date();
      email.received = email.sent;
    } catch (ex) {
      if (ex.code == "EAUTH") {
        ex.message = "Check your login, username, and password:\n" + ex.message;
        ex.authFail = true;
      }
      throw ex;
    }
  }

  async verifyLogin(): Promise<void> {
    try {
      await appGlobal.remoteApp.verifyServerNodemailer(this.getTransportOptions());
    } catch (ex) {
      if (ex.code == "EAUTH") {
        ex.message = "Check your login, username, and password:\n" + ex.message;
        ex.authFail = true;
      }
      throw ex;
    }
  }

  protected static getRecipients(recipients: ArrayColl<PersonUID>): NMAddress[] {
    return recipients.contents.map(to => SMTPAccount.getRecipient(to));
  }
  protected static getRecipient(to: PersonUID): NMAddress {
    // `${to.name} <${to.emailAddress}>` created by nodemailer, with quotes
    return {
      name: to.name,
      address: to.emailAddress,
    };
  }
  protected static async getAttachments(email: EMail): Promise<NMAttachment[]> {
    return await Promise.all(email.attachments.contents.map((a) => SMTPAccount.getAttachment(a)));
  }
  protected static async getAttachment(a: Attachment): Promise<NMAttachment> {
    return {
      filename: a.filename,
      content: await blobToBase64(a.content),
      encoding: "base64",
      contentType: a.mimeType,
      contentDisposition: a.disposition == ContentDisposition.inline ? 'inline' : 'attachment',
    };
  }
}
