import { EMail, PersonEmailAddress } from "../EMail";
import type { IMAPFolder } from "./IMAPFolder";
import { findOrCreatePerson, findOrCreatePersonEmailAddress } from "../Person";
import { SQLEMail } from "../SQL/SQLEMail";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assert } from "../../util/util";
import type { ArrayColl } from "svelte-collections";

export class IMAPEMail extends EMail {
  folder: IMAPFolder;
  /** From IMAP server */
  uid: number | null = null;
  seq: number | null = null;

  constructor(folder: IMAPFolder) {
    super(folder);
  }

  async download() {
    await this.folder.runCommand(async (conn) => {
      let msgInfo = await conn.fetchOne(this.id);
      this.fromFlow(msgInfo);
    });
    await this.parseMIME();
  }

  fromFlow(msgInfo: any) {
    // <https://imapflow.com/global.html#FetchMessageObject>
    this.uid = sanitize.integer(msgInfo.uid, null);
    this.seq = sanitize.integer(msgInfo.seq, null);
    // <https://imapflow.com/global.html#MessageEnvelopeObject>
    let env = msgInfo.envelope;
    this.id = sanitize.nonemptystring(env.messageId, this.uid + "");
    this.subject = sanitize.string(env.subject, null);
    this.sent = sanitize.date(env.date, new Date());
    this.received = new Date();
    this.setFlagsLocal(msgInfo.flags);
    this.inReplyTo = sanitize.string(env.inReplyTo, null);
    let firstFrom = env.from && env.from[0];
    if (firstFrom && firstFrom.address) {
      this.contact = findOrCreatePerson(sanitize.nonemptystring(firstFrom.address), sanitize.string(firstFrom.name, null));
      this.from = findOrCreatePersonEmailAddress(firstFrom.address, firstFrom.name);
    } else {
      this.contact = findOrCreatePerson("unknown@invalid", "Unknown");
      this.from = findOrCreatePersonEmailAddress("unknown@invalid", "Unknown");
    }
    addPersons(this.to, env.to);
    addPersons(this.cc, env.cc);
    addPersons(this.bcc, env.bcc);
    assert(!msgInfo.source || msgInfo.source instanceof Uint8Array, "MIME source needs to be a buffer");
    this.mime = msgInfo.source;
  }

  setFlagsLocal(flags: Set<string>) {
    if (!(flags && flags instanceof Set)) {
      return;
    }
    this.isRead = flags.has("\\Seen");
    this.isNewArrived = flags.has("\\Recent");
    this.isStarred = flags.has("\\Flagged");
    this.isReplied = flags.has("\\Answered");
    this.isSpam = flags.has("\\Junk");
    this.isDraft = flags.has("\\Draft");
  }

  async markRead(read = true) {
    await super.markRead(read);
    await this.setFlagServer("\\Seen", read);
  }

  async markStarred(starred = true) {
    await super.markStarred(starred);
    await this.setFlagServer("\\Flagged", starred);
  }

  async markSpam(spam = true) {
    await super.markSpam(spam);
    await this.setFlagServer("\\Junk", spam);
  }

  async markReplied() {
    await super.markReplied();
    await this.setFlagServer("\\Answered", true);
  }

  async markDraft() {
    await super.markDraft();
    await this.setFlagServer("\\Draft", true);
  }

  /**
   * Set read/starred etc. flag on the message
   *
   * @param name -- the flag, e.g. "\Seen", "\Recent", "\Junk" etc.
   * @param set -- true = add the flag, false = remove the flag
   */
  async setFlagServer(name: string, set = true) {
    await this.folder.runCommand(async (conn) => {
      if (set) {
        await conn.messageFlagsAdd(this.uid, [name], { uid: true });
      } else {
        await conn.messageFlagsRemove(this.uid, [name], { uid: true });
      }
    });
  }

  async deleteMessage() {
    await super.deleteMessage();
    await SQLEMail.deleteIt(this);
    await this.folder.runCommand(async (conn) => {
      await conn.messageDelete(this.uid, { uid: true });
    });
  }
}

function addPersons(targetList: ArrayColl<PersonEmailAddress>, personList: any[]): void {
  if (!personList?.length) {
    return;
  }
  targetList.addAll(personList.map(p =>
    findOrCreatePersonEmailAddress(sanitize.nonemptystring(p.address, "unknown@invalid"), sanitize.string(p.name, null))));
}
