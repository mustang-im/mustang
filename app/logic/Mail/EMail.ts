import { Message } from "../Abstract/Message";
import type { Attachment } from "./Attachment";
import type { Folder } from "./Folder";
import type { Person } from "../Abstract/Person";
import { appGlobal } from "../app";
import { backgroundError } from "../../frontend/Util/error";
import { assert } from "../util/util";
import { notifyChangedProperty } from "../util/Observable";
import { ArrayColl, MapColl } from "svelte-collections";

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
  /** This message has been downloaded completely,
   * with header, body, and all attachments. */
  downloadComplete = false;
  /** Was just downloaded, but wasn't saved to local disk yet.
   * Set only temporarily. */
  needSave = false;
  @notifyChangedProperty
  writeBelowQuote: boolean = true;

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
    let account = this.folder.account;
    let folder = account.drafts ?? account.sent ?? this.folder;
    let reply = folder.newEMail();
    reply.from.emailAddress = account.emailAddress;
    reply.from.name = account.userRealname;
    reply.subject = "Re: " + this.baseSubject; // Do *not* localize "Re: "

    let blockquote = `<p class="quote-header">${this.quotePrefixLine()}</p>
    <blockquote cite="mid:${this.id}">
      ${this.html}
    </blockquote>`;

    if (this.writeBelowQuote) {
      reply.html = blockquote + '<p></p>';
    } else {
      reply.html = '<p></p><p></p><p></p>' + blockquote;
    }

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
