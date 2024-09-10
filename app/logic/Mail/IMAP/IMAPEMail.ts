import { EMail, setPersons } from "../EMail";
import type { IMAPFolder } from "./IMAPFolder";
import { SpecialFolder } from "../Folder";
import { DeleteStrategy } from "../MailAccount";
import { getTagByName, type Tag } from "../Tag";
import { findOrCreatePersonUID } from "../../Abstract/PersonUID";
import { appGlobal } from "../../app";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assert, NotReached } from "../../util/util";
import { gt } from "../../../l10n/l10n";

export class IMAPEMail extends EMail {
  folder: IMAPFolder;
  /** From IMAP server */
  seq: number | null = null;
  flagsChanging = false;

  constructor(folder: IMAPFolder) {
    super(folder);
  }

  get uid(): number | null {
    return this.pID as number | null;
  }
  set uid(val: number | null) {
    assert(val === null || typeof (val) == "number", "IMAP EMail UID must be a number");
    this.pID = val;
  }

  async download() {
    let msgInfo = await this.folder.runCommand(async (conn) => {
      return await conn.fetchOne(this.uid + "", {
        uid: true,
        size: true,
        threadId: true,
        envelope: true,
        source: true,
        flags: true,
      }, { uid: true });
    });
    this.fromFlow(msgInfo);
    await this.parseMIME();
    await this.saveCompleteMessage();
  }

  fromFlow(msgInfo: any) {
    this.setFlagsLocal(msgInfo.flags);
    // <https://imapflow.com/global.html#FetchMessageObject>
    this.uid = sanitize.integer(msgInfo.uid, null);
    this.seq = sanitize.integer(msgInfo.seq, null);
    if (this.downloadComplete) {
      return;
    }
    // <https://imapflow.com/global.html#MessageEnvelopeObject>
    let env = msgInfo.envelope;
    this.id = sanitize.nonemptystring(env.messageId, this.uid + "");
    this.subject = sanitize.string(env.subject, null);
    this.received = msgInfo.internalDate ?? new Date();
    this.sent = sanitize.date(env.date, this.received);
    this.inReplyTo = sanitize.string(env.inReplyTo, null);
    this.threadID = sanitize.string(env.threadId, null); // Only if server supports OBJECTID or X-GM-EXT-1 IMAP extension
    if (env.from?.length && env.from[0]?.address) {
      let firstFrom = env.from[0];
      this.from = findOrCreatePersonUID(sanitize.nonemptystring(firstFrom.address), sanitize.label(firstFrom.name, null));
    } else {
      this.from = findOrCreatePersonUID("unknown@invalid", "Unknown");
    }
    setPersons(this.to, env.to);
    setPersons(this.cc, env.cc);
    setPersons(this.bcc, env.bcc);
    this.outgoing = appGlobal.me.emailAddresses.some(e => e.value == this.from.emailAddress);
    this.contact = this.outgoing ? this.to.first : this.from;
    this.needToLoadBody = this._text == null && this._rawHTML == null;
    assert(!msgInfo.source || msgInfo.source instanceof Uint8Array, "MIME source needs to be a buffer");
    this.mime = msgInfo.source;
  }

  setFlagsLocal(flags: Set<string>) {
    if (!(flags && flags instanceof Set) || this.flagsChanging) {
      return;
    }
    // <https://www.ietf.org/rfc/rfc9051.html#section-2.3.2>
    this.isRead = flags.has("\\Seen");
    this.isNewArrived = flags.has("\\Recent");
    this.isStarred = flags.has("\\Flagged");
    this.isReplied = flags.has("\\Answered");
    this.isDraft = flags.has("\\Draft");
    this.isSpam = flags.has("$Junk");

    for (let customTag of flags) {
      if (customTag.startsWith("\\") || customTag.startsWith("$") ||
          ["nonjunk", "junk"].includes(customTag.toLowerCase())) {
        continue;
      }
      this.tags.add(getTagByName(customTag));
    }
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
    await this.setFlagServer("$Junk", spam);
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
   * @param name -- the flag, e.g. "\Seen", "\Recent", "$Junk" etc., or a user-set tag
   * @param set -- true = add the flag, false = remove the flag
   */
  async setFlagServer(name: string, set = true) {
    this.flagsChanging = true;
    await this.folder.runCommand(async (conn) => {
      if (set) {
        await conn.messageFlagsAdd(this.uid, [name], { uid: true });
      } else {
        await conn.messageFlagsRemove(this.uid, [name], { uid: true });
      }
    });
    this.flagsChanging = false;
  }

  async addTagOnServer(tag: Tag) {
    await this.setFlagServer(tag.name, true);
  }

  async removeTagOnServer(tag: Tag) {
    await this.setFlagServer(tag.name, false);
  }

  async deleteMessageOnServer() {
    try {
      this.folder.deletions.add(this.uid);
      let strategy = this.folder.account.deleteStrategy;
      if (strategy == DeleteStrategy.DeleteImmediately) {
        await this.folder.runCommand(async (conn) => {
          await conn.messageDelete(this.uid, { uid: true });
        });
      } else if (strategy == DeleteStrategy.MoveToTrash) {
        let trash = this.folder.account.getSpecialFolder(SpecialFolder.Trash);
        assert(trash, gt`Trash folder is not set. Cannot delete the email. Please go to folder properties and set Use As: Trash.`);
        trash.moveMessageHere(this);
      } else if (strategy == DeleteStrategy.Flag) {
        await this.setFlagServer("\\Deleted", true);
      } else {
        throw new NotReached("Unknown delete strategy");
      }
    } finally {
      this.folder.deletions.delete(this.uid);
    }
  }
}
