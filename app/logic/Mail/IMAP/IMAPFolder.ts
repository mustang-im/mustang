import { Folder, SpecialFolder } from "../Folder";
import { IMAPEMail } from "./IMAPEMail";
import type { IMAPAccount } from "./IMAPAccount";
import { SQLFolder } from "../SQL/SQLFolder";
import { SQLEMail } from "../SQL/SQLEMail";
import { ArrayColl, Collection } from "svelte-collections";

export class IMAPFolder extends Folder {
  account: IMAPAccount;
  uidvalidity: number = 0;
  /** Last sequence number seen */
  lastSeen: number = 0;

  constructor(account: IMAPAccount) {
    super(account);
  }

  get path(): string {
    return this.id;
  }
  set path(val: string) {
    this.id = val;
  }

  fromFlow(folderInfo: any) {
    this.name = folderInfo.name;
    this.path = folderInfo.path;
    if (folderInfo.status) {
      this.countTotal = folderInfo.status.messages;
      this.countUnread = folderInfo.status.unseen;
      this.countNewArrived = folderInfo.status.recent;
    }
    this.specialUse(folderInfo.specialUse);
  }

  async runCommand(imapFunc: (conn: any) => Promise<void>) {
    let lock;
    try {
      let conn = await this.account.connection();
      try {
        lock = await conn.getMailboxLock(this.path);
      } catch (ex) {
        console.log("Opening IMAP folder failed", ex);
        if (ex.code == "NoConnection") {
          this.account._connection = null;
          conn = await this.account.connection();
          lock = await conn.getMailboxLock(this.path);
          // Re-try only once
        } else {
          throw ex;
        }
      }
      await imapFunc(conn);
    } finally {
      lock?.release();
    }
  }

  async listMessages() {
    if (!this.dbID) {
      await SQLFolder.save(this);
    }
    await SQLEMail.readAll(this);

    if (this.countTotal === 0) {
      return;
    }
    let newMessages = new ArrayColl<IMAPEMail>();
    let updatedMessages = new ArrayColl<IMAPEMail>();
    await this.runCommand(async (conn) => {
      let msgsAsyncIterator = await conn.fetch({ all: true }, {
        uid: true,
        size: true,
        threadId: true,
        internalDate: true,
        envelope: true,
        flags: true,
      }, {
        changedSince: this.lastSeen,
      });
      for await (let msgInfo of msgsAsyncIterator) {
        let msg = this.getEMailByUID(msgInfo.uid);
        if (msg) {
          msg.fromFlow(msgInfo);
          updatedMessages.add(msg);
        } else {
          msg = new IMAPEMail(this);
          msg.fromFlow(msgInfo);
          newMessages.add(msg);
        }
        this.updateModSeq(msgInfo.modseq);
      }
    });
    this.messages.addAll(newMessages); // notify only once

    for (let email of updatedMessages) {
      await SQLEMail.save(email);
      // await SQLEMail.saveWritableProps(email); -- TODO: Lacks dbID on initial fetch
    }
    for (let email of newMessages) {
      await SQLEMail.save(email);
    }

    await this.downloadMessagesComplete();
  }

  /**
   * Checks which of the `messages` are not downloaded yet,
   * and downloads them in batches.
   * @return Actually newly downloaded msgs
   */
  async downloadMessagesComplete(): Promise<ArrayColl<IMAPEMail>> {
    let needToDownload = new ArrayColl(this.messages.contents.filter(msg => !msg.downloadComplete) as IMAPEMail[]);
    let downloadedMessages = new ArrayColl<IMAPEMail>();
    const kMaxCount = 50;
    while (needToDownload.hasItems) {
      let downloadMessages = needToDownload.getIndexRange(needToDownload.length - kMaxCount, kMaxCount) as any as IMAPEMail[];
      needToDownload.removeAll(downloadMessages);
      let uids = downloadMessages.map(msg => msg.uid).join(",");
      await this.runCommand(async (conn) => {
        let msgInfos = await conn.fetch(uids, {
            uid: true,
            size: true,
            threadId: true,
            envelope: true,
            source: true,
            flags: true,
            // headers: true,
          }, { uid: true });
        for await (let msgInfo of msgInfos) {
          let msg = this.getEMailByUID(msgInfo.uid);
          if (msg?.downloadComplete) {
            continue;
          } else if (msg) {
            msg.fromFlow(msgInfo);
            this.updateModSeq(msgInfo.modseq);
            await msg.parseMIME();
            await SQLEMail.save(msg);
            downloadedMessages.add(msg);
          }
        }
      });
      return downloadedMessages;
    }
  }

  getEMailByUID(uid: number): IMAPEMail {
    return this.messages.find((m: IMAPEMail) => m.uid == uid) as IMAPEMail;
  }

  /* getEMailByUIDOrCreate(uid: number): IMAPEMail {
    return this.getEMailByUID(uid) ?? new IMAPEMail(this);
  }*/

  getEMailBySeq(seq: number): IMAPEMail {
    return this.messages.find((m: IMAPEMail) => m.seq == seq) as IMAPEMail;
  }

  updateModSeq(modseq: number) {
    if (typeof (modseq) != "number") {
      return;
    }
    if (modseq > this.lastSeen) {
      this.lastSeen = modseq;
    }
  }

  /** We received an event from the serverthat the number of emails in the folder changed */
  async countChanged(newCount: number, oldCount: number): Promise<void> {
    let hasChanged = newCount != oldCount || newCount != this.countTotal;
    this.countTotal = newCount;
    if (hasChanged) {
      await this.listMessages();
    }
  }

  /** We received an event from the serverthat the number of emails in the folder changed */
  async messageFlagsChanged(uid: number | null, seq: number, flags: Set<string>, newModSeq?: number): Promise<void> {
    let message = uid ? this.getEMailByUID(uid) : this.getEMailBySeq(seq);
    if (!message) {
      await this.listMessages();
      return;
    }

    message.setFlagsLocal(flags);
    SQLEMail.save(message);

    if (newModSeq) {
      // TODO What if we missed other notifications? Is modseq always increased by exactly 1, so that we can check that?
      this.updateModSeq(newModSeq);
    }
  }

  async moveMessagesHere(messages: Collection<IMAPEMail>) {
    await super.moveMessagesHere(messages);
    let ids = messages.contents.map(msg => msg.uid).join(",");
    await this.account._connection.messageMove(ids, this.path, { uid: true });
    let sourceFolder = messages.first.folder;
    sourceFolder.countTotal -= 1;
    this.countTotal += 1;
    await sourceFolder.listMessages();
    await this.listMessages();
  }

  async copyMessagesHere(messages: Collection<IMAPEMail>) {
    await super.copyMessagesHere(messages);
    let ids = messages.contents.map(msg => msg.uid).join(",");
    await this.account._connection.messageCopy(ids, this.path, { uid: true });
    let sourceFolder = messages.first.folder;
    this.countTotal += 1;
    await sourceFolder.listMessages();
    await this.listMessages();
  }

  async moveFolderHere(folder: Folder) {
    await super.moveFolderHere(folder);
    console.log("Folder moved");
  }

  async createSubFolder(name: string): Promise<IMAPFolder> {
    let folder = new IMAPFolder(this.account);
    folder.name = name;
    folder.parent = this;
    this.subFolders.add(folder);
    await SQLFolder.save(this);
    console.log("Folder created");
    return folder;
  }

  /** @param specialUse From RFC 6154, e.g. `\Sent`
   * <https://datatracker.ietf.org/doc/html/rfc6154> */
  specialUse(specialUse: string): void {
    switch (specialUse) {
      case "\Inbox":
        this.account.inbox = this;
        this.specialFolder = SpecialFolder.Inbox;
        break;
      case "\Trash":
        this.account.trash = this;
        this.specialFolder = SpecialFolder.Trash;
        break;
      case "\Junk":
        this.account.spam = this;
        this.specialFolder = SpecialFolder.Spam;
        break;
      case "\Sent":
        this.account.sent = this;
        this.specialFolder = SpecialFolder.Sent;
        break;
      case "\Drafts":
        this.account.drafts = this;
        this.specialFolder = SpecialFolder.Drafts;
        break;
      case "\Archive":
        this.account.archive = this;
        this.specialFolder = SpecialFolder.Archive;
        break;
    }
    if (this.path.toUpperCase() == "INBOX") {
      this.account.inbox = this;
      this.specialFolder = SpecialFolder.Inbox;
    } else if (!this.account.sent && this.path.toLowerCase() == "sent") {
      // or "INBOX/Sent" or "Sent Messages" (Exchange) or various translated versions of it
      this.account.sent = this;
      this.specialFolder = SpecialFolder.Sent;
    } else if (!this.account.drafts && this.path.toLowerCase() == "drafts") {
      this.account.drafts = this;
      this.specialFolder = SpecialFolder.Drafts;
    } else if (!this.account.trash && this.path.toLowerCase() == "trash") {
      this.account.trash = this;
      this.specialFolder = SpecialFolder.Trash;
    }
  }

  newEMail(): IMAPEMail {
    return new IMAPEMail(this);
  }
}
