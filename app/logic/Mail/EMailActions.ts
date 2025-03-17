import type { EMail } from "./EMail";
import { SpecialFolder } from "./Folder";
import { Attachment, ContentDisposition } from "../Abstract/Attachment";
import { PersonUID } from "../Abstract/PersonUID";
import { MailIdentity } from "./MailIdentity";
import { appName, appVersion } from "../build";
import { getLocalStorage } from "../../frontend/Util/LocalStorage";
import { backgroundError } from "../../frontend/Util/error";
import { UserError, assert, type URLString, dataURLToBlob } from "../util/util";
import { getUILocale, gt } from "../../l10n/l10n";
import type { Collection } from "svelte-collections";
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
    let original = this.email;
    original.markReplied()
      .catch(original.folder.account.errorCallback);

    let account = original.folder.account;
    let reply = account.newEMailFrom();
    original.action.generateMessageID();

    let recipients = original.from?.emailAddress
      ? [original.from, ...original.to.contents, ...original.cc.contents, ...original.bcc.contents]
      : [];
    let from = MailIdentity.findIdentity(recipients, account);
    reply.identity = from.identity;
    reply.from = from.personUID;

    reply.folder = original.folder?.specialFolder == SpecialFolder.Normal
      ? original.folder
      : account.getSpecialFolder(SpecialFolder.Sent);

    reply.subject = "Re: " + original.baseSubject; // Do *not* localize "Re: "
    reply.inReplyTo = original.messageID;
    reply.references = original.references?.slice() ?? [];
    reply.references.push(original.messageID);

    let quoteSetting = getLocalStorage("mail.send.quote", "below").value;
    let quote = `<p class="quote-header">${this.quotePrefixLine()}</p>
    <blockquote cite="mid:${original.id}">
      ${original.html}
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
    reply.to.addAll(this.email.to.contents.filter(pe => !this.email.folder?.account.identities.some(id => id.isEMailAddress(pe.emailAddress))));
    reply.cc.addAll(this.email.cc.contents.filter(pe => !this.email.folder?.account.identities.some(id => id.isEMailAddress(pe.emailAddress))));
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

  convertInlineAttachmentsURLs() {
    let html = new DOMParser().parseFromString(this.email.rawHTMLDangerous, "text/html");
    console.log("in HTML", html, this.email.rawHTMLDangerous);
    for (let node of html.querySelectorAll("img[src]")) {
      let img = node as HTMLImageElement;
      // img.src = this.convertBlobURLToCIDURL(img.src);
      img.src = this.convertDataURLToCIDURL(img.src);
    }
    this.email.rawHTMLDangerous = html.documentElement.outerHTML;
    console.log("out HTML", html, this.email.rawHTMLDangerous);
  }

  protected convertDataURLToCIDURL(url: URLString): URLString {
    if (!url?.startsWith("data:")) {
      return url;
    }
    let attachment = this.email.attachments.find(a => a.dataURL == url);
    if (!attachment) {
      /*let blob = await dataURLToBlob(url);
      attachment = Attachment.fromFile(new File([blob], "image"));*/
      console.warn(attachment, "Attachment for data URL not found", url.substring(0, 20));
      return url;
    }

    attachment.contentID ??= crypto.randomUUID();
    return "cid:" + attachment.contentID;
  }

  protected convertBlobURLToCIDURL(url: URLString): URLString {
    if (!url?.startsWith("blob:")) {
      return url;
    }
    let attachment = this.email.attachments.find(a => a.blobURL == url);
    if (!attachment) {
      console.warn(attachment, "Attachment for blob URL not found", url, this.email.attachments.contents);
      return url;
    }

    URL.revokeObjectURL(url);
    attachment.blobURL = null;

    attachment.contentID ??= crypto.randomUUID();
    return "cid:" + attachment.contentID;
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
    let account = fromIdentity.account;
    let sig = fromIdentity.signatureHTML;
    this.email.html += `<p></p><footer class="signature" style="color: #777777">Sent by © <a href="https://parula.app" style="color: #20AE9E; text-decoration: none"><strong><em>Parula</em></strong></a></footer>`;
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

    let previousDrafts = this.getDrafts();
    let previousFolder = this.email.folder;
    if (this.email.folder?.specialFolder != SpecialFolder.Normal) {
      this.email.folder = account.getSpecialFolder(SpecialFolder.Sent);
    }
    this.email.isDraft = false;

    this.convertInlineAttachmentsURLs();
    await account.send(this.email);

    this.email.folder = previousFolder;
    this.deleteDrafts(previousDrafts)
      .catch(backgroundError);
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
    let previousDrafts = this.getDrafts();

    this.email.isDraft = true;
    await draftFolder.addMessage(this.email);

    await this.deleteDrafts(previousDrafts);
  }

  getDrafts(): Collection<EMail> {
    let account = this.email.folder?.account ?? this.email.identity?.account;
    let draftFolder = account.getSpecialFolder(SpecialFolder.Drafts);
    return draftFolder.messages.filter(mail => mail.messageID == this.email.messageID);
  }

  async deleteDrafts(previousDrafts?: Collection<EMail>): Promise<void> {
    previousDrafts ??= this.getDrafts();
    for (let previousDraft of previousDrafts) {
      await previousDraft.deleteMessage();
    }
  }
}
