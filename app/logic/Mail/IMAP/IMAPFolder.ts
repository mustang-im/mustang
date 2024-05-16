import { Folder, SpecialFolder } from "../Folder";
import { IMAPEMail } from "./IMAPEMail";
import type { IMAPAccount } from "./IMAPAccount";
import { SQLFolder } from "../SQL/SQLFolder";
import { SQLEMail } from "../SQL/SQLEMail";
import type { EMail } from "../EMail";
import { ArrayColl, Collection } from "svelte-collections";
import { assert } from "../../util/util";

export class IMAPFolder extends Folder {
  account: IMAPAccount;
  uidvalidity: number = 0;

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
    } finally {
      lock?.release();
    }
  }

  async listMessages() {
    if (!this.dbID) {
      await SQLFolder.save(this);
    }
    if (!this.messages.hasItems) {
      console.log(this.name, "Start reading msgs from DB");
      console.time(this.path);
      await SQLEMail.readAll(this);
      console.timeEnd(this.path);
    }

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
        changedSince: this.lastModSeq,
      });
      for await (let msgInfo of msgsAsyncIterator) {
        if (!msgInfo.envelope) {
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
    this.messages.addAll(newMessages); // notify only once
    await SQLFolder.saveProperties(this);
    // Should save to SQL DB, but often no `subject`, which violates the DB schema
  }

  /**
   * Downloads the emails in batches.
   * @return Actually newly downloaded msgs
   */
  async downloadMessages(emails: Collection<IMAPEMail>): Promise<Collection<IMAPEMail>> {
    let needMsgs = new ArrayColl(emails);
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

    for (let msg of this.messages) {
      if (!msg.threadID && msg.dbID) {
        await msg.findThread(this.messages);
      }
    }

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
      await this.listMessages();
      await this.downloadAllMessages();
    }
  }

  /** We received an event from the server that the
   * unread or flag status of an email changed */
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

  async moveMessagesHere(messages: Collection<IMAPEMail>) {
    await super.moveMessagesHere(messages);
    let ids = messages.contents.map(msg => msg.uid).join(",");
    await (await this.account.connection()).messageMove(ids, this.path, { uid: true });
    let sourceFolder = messages.first.folder;
    sourceFolder.countTotal -= 1;
    this.countTotal += 1;
    await sourceFolder.listMessages();
    await this.listMessages();
  }

  async copyMessagesHere(messages: Collection<IMAPEMail>) {
    await super.copyMessagesHere(messages);
    let ids = messages.contents.map(msg => msg.uid).join(",");
    await (await this.account.connection()).messageCopy(ids, this.path, { uid: true });
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
    await (await this.account.connection()).mailboxRename(folder.path, [this.path, folder.getPathComponents().pop() ]);
  }

  async addMessage(email: EMail) {
    assert(email.mime, "Need MIME to upload it to a folder"); // TODO download msg, or construct MIME
    await this.runCommand(async (conn) => {
      let flags = null; // TODO
      await conn.append(this.path, email.mime, flags);
    });
  }

  async createSubFolder(name: string): Promise<IMAPFolder> {
    let newFolder = await super.createSubFolder(name) as IMAPFolder;
    let created = await (await this.account.connection()).mailboxCreate([this.path, name]);
    newFolder.path = created.path;
    console.log("IMAP folder created", name, newFolder.path);
    await newFolder.listMessages();
    return newFolder;
  }

  async rename(newName: string): Promise<void> {
    this.name = newName;
    let parentPath = this.parent ? this.parent.path : this.getPathComponents().slice(0, -1);
    await (await this.account.connection()).mailboxRename(this.path, [ ...parentPath, newName ]);
    console.log("renamed", this.path, "to parent", parentPath, [...parentPath, newName]);
  }

  /** Warning: Also deletes all messages in the folder, also on the server */
  async deleteIt(): Promise<void> {
    if (this.parent) {
      this.parent.subFolders.remove(this);
    } else {
      this.account.rootFolders.remove(this);
    }
    await (await this.account.connection()).mailboxDelete(this.path);
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
