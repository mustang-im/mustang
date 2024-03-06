import { Message } from "../Abstract/Message";
import type { Person } from "../Abstract/Person";
import { appGlobal } from "../app";
import { notifyChangedProperty } from "../util/Observable";
import { ArrayColl, MapColl } from "svelte-collections";

export class EMail extends Message {
  @notifyChangedProperty
  authorEmailAddress: string;
  @notifyChangedProperty
  subject: string;
  readonly to = new MapColl<string, Person>(); /** email address -> Person (not necessarily in address book) */
  readonly cc = new MapColl<string, Person>(); /** format like `to` */
  readonly bcc = new MapColl<string, Person>(); /** format like `to` */
  readonly replyTo: { emailAddress: string, name: string };
  readonly attachments = new ArrayColl<File>();
  @notifyChangedProperty
  contentType: string;
  @notifyChangedProperty
  _bodyPlaintext: string;

  get baseSubject(): string {
    return this.subject.replace(/^([Re|RE|AW|Aw]: ?)+/, "");
  }

  async deleteMessage() {
    console.log("Delete Email", this.subject);
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
    let reply = this._reply();
    let toPerson = null; // appGlobal.persons.find(person => person.emailAddresses.some(em => em.value == this.authorEmailAddress)) ?? new Person();
    reply.to.set(this.authorEmailAddress, toPerson);
    return reply;
  }

  replyAll(): EMail {
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
