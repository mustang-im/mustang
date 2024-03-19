import { Message } from "../Abstract/Message";
import type { Attachment } from "./Attachment";
import type { Folder } from "./Folder";
import type { Person } from "../Abstract/Person";
import { appGlobal } from "../app";
import { backgroundError } from "../../frontend/Util/error";
import { notifyChangedProperty, Observable } from "../util/Observable";
import { ArrayColl, MapColl } from "svelte-collections";

export class EMail extends Message {
  @notifyChangedProperty
  authorEmailAddress: string;
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
  dbID: number;

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
  }

  quotePrefixLine(): string {
    function getDate(date: Date) {
      return date.toLocaleString(navigator.language, { year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric" });
    }
    return `${this.contact.name} wrote on ${getDate(this.sent)}:`;
  }

  _reply(): EMail {
    this.markReplied().catch(backgroundError);
    let folder = this.folder.account.drafts ?? this.folder.account.sent ?? this.folder;
    let reply = folder.newEMail();
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
    alert("Sending email\n(not really yet)\n\n" + this.html?.substring(0, 200));
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
