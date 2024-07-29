import { Folder, SpecialFolder } from "../Folder";
import { IMAPEMail } from "./IMAPEMail";
import { type IMAPAccount, IMAPCommandError } from "./IMAPAccount";
import { SQLFolder } from "../SQL/SQLFolder";
import { SQLEMail } from "../SQL/SQLEMail";
import type { EMail } from "../EMail";
import { ArrayColl, Collection } from "svelte-collections";
import { assert } from "../../util/util";
import { Buffer } from "buffer";
import { gt } from "../../../l10n/l10n";

export class IMAPFolder extends Folder {
  account: IMAPAccount;
  uidvalidity: number = 0;
  readonly deletions = new Set<number>();

  constructor(account: IMAPAccount) {
    super(account);
  }

  get path(): string {
    return this.id;
  }
  set path(val: string) {
    this.id = val;
  }
  getPathComponents(): string[] {
    assert(this.path, "Missing folder path");
    assert(this.account.pathDelimiter, "Missing path delimiter");
    return this.path?.split(this.account.pathDelimiter);
  }

  /** Last sequence number seen */
  get lastModSeq(): number {
    return this.syncState as number ?? 0;
  }
  set lastModSeq(val: number) {
    assert(typeof (val) == "number", "IMAP Folder modseq must be a number");
    this.syncState = val;
    SQLFolder.save(this).catch(this.account.errorCallback);
  }

  fromFlow(folderInfo: any) {
    this.name = folderInfo.name;
    this.path = folderInfo.path;
    if (folderInfo.status) {
      this.countTotal = folderInfo.status.messages;
      this.countUnread = folderInfo.status.unseen;
      this.countNewArrived = folderInfo.status.recent;
    }
    this.setSpecialUse(folderInfo.specialUse);
    if (this.name.toUpperCase() == "INBOX") {
      this.name = gt`Inbox`;
    }
  }

  async runCommand<T>(imapFunc: (conn: any) => Promise<T>): Promise<T> {
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
      return await imapFunc(conn);
    } catch (ex) {
      if (ex.responseText) {
        throw new IMAPCommandError(ex, ex.responseText
          .replace("Error in IMAP command", "IMAP")
          .replace(/ \([\d\. +]* secs\)\./, ""));
      } else {
        throw ex;
      }
    } finally {
      lock?.release();
    }
  }

  protected async readFolder() {
    if (!this.dbID) {
      await this.save();
    }
    if (!this.messages.hasItems) {
      console.log(this.name, "Start reading msgs from DB");
      console.time(this.path);
      await SQLEMail.readAll(this);
      console.timeEnd(this.path);
    }
  }

  /** Lists all messages in this folder.
   * But doesn't download their contents. @see downloadMessages() */
  async listMessages(): Promise<ArrayColl<EMail>> {
    await this.readFolder();
    if (this.countTotal === 0) {
      return;
    }
    let { newMessages } = await this.fetchMessageList({ all: true }, {
        changedSince: this.lastModSeq,
      });
    let newMsgs = new ArrayColl<IMAPEMail>(newMessages.subtract(this.messages as ArrayColl<IMAPEMail>));
    this.messages.addAll(newMessages); // notify only once
    await SQLFolder.saveProperties(this);
    // Should save msgs to SQL DB, but often no `subject`, which violates the DB schema
    return newMsgs;
  }

  /** Lists new messages, based on the UID being higher.
   * But doesn't download their contents @see getNewMessages() */
  async listNewMessages(): Promise<ArrayColl<IMAPEMail>> {
    await this.readFolder();
    if (this.countTotal === 0) {
      return;
    }
    let { newMessages } = await this.fetchMessageList({ uid: this.highestUID() + ":*" }, {
      changedSince: this.lastModSeq,
    });
    this.messages.addAll(newMessages);
    await SQLFolder.saveProperties(this);
    return newMessages;
  }

  protected async fetchMessageList(range: any, options: any): Promise<{ newMessages: ArrayColl<IMAPEMail>, updatedMessages: ArrayColl<IMAPEMail> }> {
    let newMessages = new ArrayColl<IMAPEMail>();
    let updatedMessages = new ArrayColl<IMAPEMail>();
    console.log("IMAP fetch", range);
    await this.runCommand(async (conn) => {
      let msgsAsyncIterator = await conn.fetch(range, {
        uid: true,
        size: true,
        threadId: true,
        internalDate: true,
        envelope: true,
        flags: true,
      }, options);
      for await (let msgInfo of msgsAsyncIterator) {
        if (!msgInfo.envelope) {
          continue;
        }
        if (this.deletions.has(msgInfo.uid)) {
          continue;
        }
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
    return { newMessages, updatedMessages };
  }

  protected highestUID(): number {
    let uids = this.messages.map((msg: IMAPEMail) => msg.uid);
    return uids.sortBy(uid => -uid).first;
  }

  /** Lists new messagess, and downloads them */
  async getNewMessages(): Promise<ArrayColl<IMAPEMail>> {
    let newMsgs = await this.listNewMessages();
    await this.downloadMessages(newMsgs);
    return newMsgs;
  }

  /**
   * Downloads the emails in batches.
   * @return Actually newly downloaded msgs
   */
  async downloadMessages(emails: Collection<IMAPEMail>): Promise<Collection<IMAPEMail>> {
    let needMsgs = new ArrayColl(emails.sortBy(msg => -msg.uid));
    let downloadedMsgs = new ArrayColl<IMAPEMail>();
    const kMaxCount = 50;
    while (needMsgs.hasItems) {
      let downloadingMsgs = needMsgs.getIndexRange(needMsgs.length - kMaxCount, kMaxCount) as any as IMAPEMail[];
      needMsgs.removeAll(downloadingMsgs);
      let uids = downloadingMsgs.map(msg => msg.uid).join(",");
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
          try {
            if (this.deletions.has(msgInfo.uid)) {
              continue;
            }
            let msg = this.getEMailByUID(msgInfo.uid);
            if (msg?.downloadComplete) {
              continue;
            } else if (msg) {
              msg.fromFlow(msgInfo);
              this.updateModSeq(msgInfo.modseq);
              await msg.parseMIME();
              await msg.save();
              downloadedMsgs.add(msg);
            }
          } catch (ex) {
            this.account.errorCallback(ex);
          }
        }
      });
    }

    /*for (let msg of this.messages) {
      if (!msg.threadID && msg.dbID) {
        await msg.findThread(this.messages);
      }
    }*/

    return downloadedMsgs;
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
    if (modseq > this.lastModSeq) {
      this.lastModSeq = modseq;
    }
  }

  /** We received an event from the server that the
   * number of emails in the folder changed */
  async countChanged(newCount: number, oldCount: number): Promise<void> {
    let hasChanged = newCount != oldCount || newCount != this.countTotal;
    this.countTotal = newCount;
    if (hasChanged) {
      await this.getNewMessages();
    }
  }

  /** We received an event from the server that the
   * unread or flag status of an email changed */
  async messageFlagsChanged(uid: number | null, seq: number, flags: Set<string>, newModSeq?: number): Promise<void> {
    if (this.deletions.has(uid)) {
      return;
    }
    let message = uid ? this.getEMailByUID(uid) : this.getEMailBySeq(seq);
    if (!message) {
      await this.listMessages();
      return;
    }

    message.setFlagsLocal(flags);
    await SQLEMail.save(message);

    if (newModSeq) {
      // TODO What if we missed other notifications? Is modseq always increased by exactly 1, so that we can check that?
      this.updateModSeq(newModSeq);
    }
  }

  /** We received an event from the server that a
   * message was deleted */
  async messageDeletedNotification(seq: number): Promise<void> {
    let message = this.getEMailBySeq(seq);
    if (!message) {
      return;
    }
    this.messages.remove(message);
    await SQLEMail.deleteIt(message);
  }

  async addMessage(email: EMail) {
    // Do *not* call super.addMessage();
    assert(email.mime, "Need MIME to upload it to a folder");
    await this.runCommand(async (conn) => {
      let flags = ["\\Seen"]; // TODO
      await conn.append(this.path, Buffer.from(email.mime), flags); // TODO hangs
    });
  }

  async moveMessagesHere(messages: Collection<IMAPEMail>) {
    await super.moveMessagesHere(messages);
    let ids = messages.contents.map(msg => msg.uid).join(",");
    let conn = await this.account.connection(); // Don't lock: 2 mailboxes involved
    await conn.messageMove(ids, this.path, { uid: true });
    let sourceFolder = messages.first.folder;
    sourceFolder.countTotal -= 1;
    this.countTotal += 1;
    await sourceFolder.listMessages();
    await this.listMessages();
  }

  async copyMessagesHere(messages: Collection<IMAPEMail>) {
    await super.copyMessagesHere(messages);
    let ids = messages.contents.map(msg => msg.uid).join(",");
    let conn = await this.account.connection(); // Don't lock: 2 mailboxes involved
    await conn.messageCopy(ids, this.path, { uid: true });
    let sourceFolder = messages.first.folder;
    this.countTotal += 1;
    await sourceFolder.listMessages();
    await this.listMessages();
  }

  async moveFolderHere(folder: IMAPFolder) {
    assert(folder.account = this.account, "Cannot move folders between accounts yet. You can create a new folder and move the messages");
    await super.moveFolderHere(folder);
    /*
    assert(folder.subFolders.isEmpty, `Folder ${folder.name} has sub-folders. Cannot yet move entire folder hierarchies. You may move the folders individually.`);
    let newFolder = await this.createSubFolder(folder.name);
    await newFolder.moveMessagesHere(folder.messages as any as Collection<IMAPEMail>);
    await folder.deleteIt();
    console.log("Folder moved from", folder.path, "to", newFolder.path);
    */
    await this.runCommand(async (conn) => {
      await conn.mailboxRename(folder.path, [this.path, folder.getPathComponents().pop()]);
    });
  }

  async createSubFolder(name: string): Promise<IMAPFolder> {
    let newFolder = await super.createSubFolder(name) as IMAPFolder;
    await this.runCommand(async (conn) => {
      let created = await conn.mailboxCreate([this.path, name]);
      newFolder.path = created.path;
    });
    console.log("IMAP folder created", name, newFolder.path);
    await newFolder.listMessages();
    return newFolder;
  }

  async rename(newName: string): Promise<void> {
    await super.rename(newName);
    let parentPath = this.parent ? this.parent.path : this.getPathComponents().slice(0, -1);
    await this.runCommand(async (conn) => {
      await conn.mailboxRename(this.path, [...parentPath, newName]);
    });
    console.log("renamed", this.path, "to parent", parentPath, [...parentPath, newName]);
  }

  /** Warning: Also deletes all messages in the folder, also on the server */
  async deleteIt(): Promise<void> {
    await super.deleteIt();
    SQLFolder.deleteIt(this);
    await this.runCommand(async (conn) => {
      await conn.mailboxDelete(this.path);
    });
    console.log("IMAP folder deleted", this.name, this.path);
  }

  async markAllRead(): Promise<void> {
    await super.markAllRead();
    await this.runCommand(async (conn) => {
      await conn.messageFlagsAdd("1:*", ["\\Seen"], { uid: true });
    });
  }

  /** @param specialUse From RFC 6154, e.g. `\Sent`
   * <https://datatracker.ietf.org/doc/html/rfc6154> */
  setSpecialUse(specialUse: string): void {
    switch (specialUse) {
      case "\\Inbox":
        this.specialFolder = SpecialFolder.Inbox;
        break;
      case "\\Trash":
        this.specialFolder = SpecialFolder.Trash;
        break;
      case "\\Junk":
        this.specialFolder = SpecialFolder.Spam;
        break;
      case "\\Sent":
        this.specialFolder = SpecialFolder.Sent;
        break;
      case "\\Drafts":
        this.specialFolder = SpecialFolder.Drafts;
        break;
      case "\\Archive":
        this.specialFolder = SpecialFolder.Archive;
        break;
    }
    if (this.path.toUpperCase() == "INBOX") {
      this.specialFolder = SpecialFolder.Inbox;
    } else if (!this.account.getSpecialFolder(SpecialFolder.Sent) && this.path.toLowerCase() == "sent") {
      // or "INBOX/Sent" or "Sent Messages" (Exchange) or various translated versions of it
      this.specialFolder = SpecialFolder.Sent;
    } else if (!this.account.getSpecialFolder(SpecialFolder.Drafts) && this.path.toLowerCase() == "drafts") {
      this.specialFolder = SpecialFolder.Drafts;
    } else if (!this.account.getSpecialFolder(SpecialFolder.Trash) && this.path.toLowerCase() == "trash") {
      this.specialFolder = SpecialFolder.Trash;
    }
  }

  newEMail(): IMAPEMail {
    return new IMAPEMail(this);
  }
}
