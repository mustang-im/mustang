import { Message } from "../Abstract/Message";
import type { Attachment } from "./Attachment";
import type { Person } from "../Abstract/Person";
import { appGlobal } from "../app";
import { backgroundError } from "../../frontend/Util/error";
import { notifyChangedProperty } from "../util/Observable";
import { ArrayColl, MapColl } from "svelte-collections";
import type { Folder } from "./Folder";

export class EMail extends Message {
  @notifyChangedProperty
  authorEmailAddress: string;
  @notifyChangedProperty
  subject: string;
  /** This is a Junk message */
  @notifyChangedProperty
  spam = false;
  /** The user has answered this message, by clicking "Reply" */
  @notifyChangedProperty
  replied = false;
  /** The user started writing this message, but didn't send it yet */
  @notifyChangedProperty
  draft = false;
  readonly to = new MapColl<string, Person>(); /** email address -> Person (not necessarily in address book) */
  readonly cc = new MapColl<string, Person>(); /** format like `to` */
  readonly bcc = new MapColl<string, Person>(); /** format like `to` */
  readonly replyTo: { emailAddress: string, name: string };
  readonly attachments = new ArrayColl<Attachment>();
  readonly headers = new MapColl<string, string>();
  /** Complete MIME source of the email */
  mime: Uint8Array | undefined;
  @notifyChangedProperty
  contentType: string;
  @notifyChangedProperty
  _bodyPlaintext: string;
  _folder: Folder;

  get baseSubject(): string {
    return this.subject.replace(/^([Re|RE|AW|Aw]: ?)+/, "");
  }

  async markSpam(spam = true) {
    this.spam = spam;
  }

  async markReplied() {
    this.replied = true;
  }

  async markDraft() {
    this.draft = true;
  }

  async deleteMessage() {
    this._folder.messages.remove(this);
  }

  quotePrefixLine(): string {
    function getDate(date: Date) {
      return date.toLocaleString(navigator.language, { year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric" });
    }
    return `${this.contact.name} wrote on ${getDate(this.sent)}:`;
  }

  _reply(): EMail {
    let reply = new EMail();
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
    this.markReplied().catch(backgroundError);
    let reply = this._reply();
    let toPerson = null; // appGlobal.persons.find(person => person.emailAddresses.some(em => em.value == this.authorEmailAddress)) ?? new Person();
    reply.to.set(this.authorEmailAddress, toPerson);
    return reply;
  }

  replyAll(): EMail {
    this.markReplied().catch(backgroundError);
    let reply = this.replyToAuthor();
    for (let [emailAddress, person] of this.to.entries()) {
      if (appGlobal.me.emailAddresses.some(em => em.value == emailAddress)) {
        continue;
      }
      reply.to.set(emailAddress, person);
    }
    for (let [emailAddress, person] of this.cc.entries()) {
      if (appGlobal.me.emailAddresses.some(em => em.value == emailAddress)) {
        continue;
      }
      reply.cc.set(emailAddress, person);
    }
    return reply;
  }

  async send(): Promise<void> {
    alert("Sending email\n(not really yet)\n\n" + this.html?.substring(0, 200));
  }
}
