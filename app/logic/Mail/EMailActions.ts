import type { EMail } from "./EMail";
import { SpecialFolder } from "./Folder";
import { Attachment, ContentDisposition } from "./Attachment";
import { PersonUID } from "../Abstract/PersonUID";
import { MailIdentity } from "./MailIdentity";
import { CreateMIME } from "./SMTP/CreateMIME";
import { appGlobal } from "../app";
import { appName, appVersion } from "../build";
import { getLocalStorage } from "../../frontend/Util/LocalStorage";
import { UserError, assert } from "../util/util";
import { getUILocale, gt } from "../../l10n/l10n";
import { faker } from "@faker-js/faker";

/** Functions based on the email, which are either
 * not changing the email itself, but are based on the email,
 * or are higher-level functions not inherently about the email object. */
export class EMailActions {
  readonly email: EMail;

  constructor(email: EMail) {
    this.email = email;
  }

  /**
   * @param up
   * true: older message
   * false: newer message
   * null: Same list position, after deleting this message
   */
  nextMessage(up?: boolean): EMail {
    let i = this.email.folder.messages.getKeyForValue(this.email);
    if (typeof (up) == "boolean") {
      up ? --i : ++i;
    }
    return this.email.folder.messages.getIndex(i);
  }

  quotePrefixLine(): string {
    function getDate(date: Date) {
      return date.toLocaleString(getUILocale(), { year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric" });
    }
    return `${this.email.contact.name} wrote on ${getDate(this.email.sent)}:`;
  }

  generateMessageID(): void {
    /* let hostname = appGlobal.remoteApp.hostname();
    if (hostname == "localhost") { */
    let hostname = /* faker.hacker.adjective() + "." +*/ faker.internet.domainName();
    this.email.messageID = crypto.randomUUID() + "@" + hostname;
  }

  protected _reply(): EMail {
    this.email.markReplied()
      .catch(this.email.folder.account.errorCallback);

    let account = this.email.folder.account;
    let reply = account.newEMailFrom();
    let mail = this.email;
    mail.action.generateMessageID();

    let recipients = mail.from?.emailAddress
      ? [mail.from, ...mail.to.contents, ...mail.cc.contents, ...mail.bcc.contents]
      : [];
    let from = MailIdentity.findIdentity(recipients, account);
    if (from) {
      reply.identity = from.identity;
      reply.from = from.personUID;
    }
    reply.folder = this.email.folder?.specialFolder == SpecialFolder.Inbox
      ? account.getSpecialFolder(SpecialFolder.Sent)
      : this.email.folder;

    reply.subject = "Re: " + this.email.baseSubject; // Do *not* localize "Re: "
    reply.inReplyTo = this.email.messageID;
    reply.references = this.email.references?.slice() ?? [];
    reply.references.push(this.email.messageID);

    let quoteSetting = getLocalStorage("mail.send.quote", "below").value;
    let quote = `<p class="quote-header">${this.quotePrefixLine()}</p>
    <blockquote cite="mid:${this.email.id}">
      ${this.email.html}
    </blockquote>`;
    reply.html = quoteSetting == "none" ? `<p></p>` :
      quoteSetting == "below" ? `<p></p>
    <p></p>
    ${quote}`
        : `${quote}
    <p></p>
    <p></p>`;
    return reply;
  }

  replyToAuthor(): EMail {
    let reply = this._reply();
    reply.to.add(this.email.replyTo ?? this.email.from);
    return reply;
  }

  replyAll(): EMail {
    let reply = this.replyToAuthor();
    reply.to.addAll(this.email.to.contents.filter(pe => !appGlobal.me.emailAddresses.some(em => em.value == pe.emailAddress)));
    reply.cc.addAll(this.email.cc.contents.filter(pe => !appGlobal.me.emailAddresses.some(em => em.value == pe.emailAddress)));
    return reply;
  }

  async forward(): Promise<EMail> {
    let setting = getLocalStorage("mail.send.forward", "inline").value;
    if (setting == "attachment") {
      return await this.forwardAsAttachment();
    } else {
      return await this.forwardInline();
    }
  }

  async forwardInline(): Promise<EMail> {
    await this.email.loadAttachments();
    let forward = this.email.folder.account.newEMailFrom();
    forward.subject = "Fwd: " + this.email.subject;
    forward.html = `<p></p>
    <p></p>
    <p></p>
    <hr />
    <p class="forward-header">
      <div>
        <span class="field">From:</span> <span class="value">
          ${this.email.from?.name ?? this.email.from.emailAddress}${this.email.from?.name != this.email.from?.emailAddress ? ' <' + this.email.from.emailAddress + '>' : ''}
        </span>
      </div>
      <div>
        <span class="field">Date:</span> <span class="value">
          ${this.email.sent.toLocaleString(getUILocale(), { year: "numeric", month: "2-digit", day: "2-digit", hour: "numeric", minute: "numeric" })}
        </span>
      </div>
      <div>
        <span class="field">Subject:</span> <span class="value">
          ${this.email.subject}
        </span>
      </div>
    </p>
    <p></p>
    ${ this.email.html}`;
    forward.attachments.addAll(this.email.attachments.map(a => a.clone()));
    return forward;
  }

  async forwardAsAttachment(): Promise<EMail> {
    await this.email.loadAttachments();
    let forward = this.email.folder.account.newEMailFrom();
    forward.subject = "Fwd: " + this.email.subject;
    let a = new Attachment();
    a.mimeType = "message/rfc822";
    a.disposition = ContentDisposition.inline;
    a.filename = this.email.subject + ".eml";
    a.content = new File([this.email.mime], a.filename);
    a.size = this.email.size;
    forward.attachments.add(a);
    return forward;
  }

  async redirect(): Promise<EMail> {
    await this.email.loadAttachments();
    let redirect = this.email.folder.account.newEMailFrom();
    redirect.replyTo = this.email.from;
    redirect.subject = this.email.subject;
    redirect.html = this.email.html;
    redirect.attachments.addAll(this.email.attachments.map(a => a.clone()));
    return redirect;
  }

  /**
   * Sets up the email for sending, with all the headers, signature etc.
   * Called by composer.
   * The actual send on the protocol level is done by `EMail.send()`
   */
  async send(): Promise<void> {
    let fromIdentity = this.email.identity;
    assert(fromIdentity, "Need identity set on mail");
    if (fromIdentity.replyTo) {
      this.email.replyTo = new PersonUID(fromIdentity.replyTo, fromIdentity.userRealname);
    }
    let sig = fromIdentity.signatureHTML;
    if (sig) {
      this.email.html += `<footer class="signature">${sig}</footer>`;
    }
    this.email.headers.set("User-Agent", (appName == "Mustang" ? "" : `Mustang/${appVersion} `) + `${appName}/${appVersion}`);

    if (fromIdentity.isCatchAll) {
      if (this.email.from.emailAddress.includes("*")) {
        throw new UserError(gt`Please fill out * in catch-all From address ${this.email.from.emailAddress}`);
      }
      if (!fromIdentity.isEMailAddress(this.email.from.emailAddress)) {
        throw new UserError(gt`From address ${this.email.from.emailAddress} does not match the catch-all identity ${fromIdentity.emailAddress}`);
      }
    }
    let previousDraft = await this.getDraftOnServer();

    await this.email.send();

    await previousDraft?.deleteMessage(); // TODO doesn't work, leaves draft on server
  }

  async saveAsDraft(): Promise<void> {
    let account = this.email.folder?.account ?? this.email.identity?.account;
    assert(account, "Need mail account to save draft");
    let draftFolder = account.getSpecialFolder(SpecialFolder.Drafts);
    if (!draftFolder) {
      draftFolder = await account.createToplevelFolder("Drafts");
      draftFolder.specialFolder = SpecialFolder.Drafts;
      await draftFolder.storage.saveFolderProperties(draftFolder);
    }
    let previousDraft = await this.getDraftOnServer();

    this.email.mime = await CreateMIME.getMIME(this.email);
    console.log("saving draft", this.email.messageID);
    await draftFolder.addMessage(this.email);
    // await draftFolder.listMessages();
    await previousDraft?.deleteMessage();
  }

  async deleteDraftOnServer(): Promise<void> {
    let previousDraft = await this.getDraftOnServer();
    await previousDraft?.deleteMessage();
  }

  async getDraftOnServer(): Promise<EMail | null> {
    let account = this.email.folder?.account ?? this.email.identity?.account;
    let draftFolder = account.getSpecialFolder(SpecialFolder.Drafts);
    await draftFolder.listMessages();
    let msg = draftFolder.messages.find(mail => mail.messageID == mail.messageID);
    console.log("found draft", msg?.messageID);
    return msg;
  }
}
