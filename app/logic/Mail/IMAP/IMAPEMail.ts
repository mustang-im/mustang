import { EMail } from "../EMail";
import type { IMAPFolder } from "./IMAPFolder";
import type { Person } from "../../Abstract/Person";
import { findOrCreatePerson } from "../Person";
import type { MapColl } from "svelte-collections";

export class IMAPEMail extends EMail {
  _folder: IMAPFolder;
  /** From IMAP server */
  uid: number;
  /** This message has been downloaded completely,
   * with header, body, and all attachments. */
  downloadComplete: boolean;

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
    } finally {
      lock.release();
    }
  }

  fromFlow(msgInfo: any) {
    this.uid = msgInfo.uid;
    let env = msgInfo.envelope;
    this.id = env.messageId;
    this.subject = env.subject;
    this.sent = env.date;
    this.inReplyTo = env.inReplyTo;
    let firstFrom = env.from[0];
    if (firstFrom) {
      this.authorEmailAddress = firstFrom.address;
      this.contact = findOrCreatePerson(firstFrom.address, firstFrom.name);
    }
    addPersons(this.to, env.to);
    addPersons(this.cc, env.cc);
    addPersons(this.bcc, env.bcc);
    addPersons(this.replyTo, env.replyTo);
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
