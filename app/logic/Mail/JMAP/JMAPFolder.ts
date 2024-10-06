import { Folder, SpecialFolder } from "../Folder";
import { JMAPEMail } from "./JMAPEMail";
import { type JMAPAccount, JMAPCommandError } from "./JMAPAccount";
import type { EMail } from "../EMail";
import type { EMailCollection } from "../SQL/EMailCollection";
import { ArrayColl, Collection } from "svelte-collections";
import { assert } from "../../util/util";
import { Buffer } from "buffer";
import { gt } from "../../../l10n/l10n";
import type { TJMAPFolder } from "./JMAPTypes";

export class JMAPFolder extends Folder {
  account: JMAPAccount;
  readonly messages: EMailCollection<JMAPEMail>;
  uidvalidity: number = 0;
  protected poller: ReturnType<typeof setInterval>;
  readonly deletions = new Set<number>();

  constructor(account: JMAPAccount) {
    super(account);
  }

  get path(): string {
    return this.id;
  }
  set path(val: string) {
    this.id = val;
  }

  /** Last sequence number seen */
  get lastModSeq(): number {
    return this.syncState as number ?? 0;
  }
  set lastModSeq(val: number) {
    assert(typeof (val) == "number", "JMAP Folder modseq must be a number");
    this.syncState = val;
    this.storage.saveFolderProperties(this).catch(this.account.errorCallback);
  }

  fromJMAP(folderJSON: TJMAPFolder) {
    this.name = folderJSON.name;
    this.countTotal = folderJSON.totalEmails;
    this.countUnread = folderJSON.unreadEmails;
    this.setSpecialUse(folderJSON.role);
  }

  async runCommand<T>(jmapFunc: (conn: any) => Promise<T>, doLock = false): Promise<T> {
    let lock;
    try {
      let conn = await this.account.connection();
      try {
        if (doLock) {
          lock = await conn.getMailboxLock(this.path);
        } else if (conn.mailbox.path == this.path) {
          // already open
        } else {
          await conn.mailboxOpen(this.path);
        }
      } catch (ex) {
        console.log(gt`Opening JMAP folder failed`, ex);
        if (ex.code == "NoConnection") {
          this.account.session = null;
          conn = await this.account.connection();
          if (doLock) {
            lock = await conn.getMailboxLock(this.path);
          } else {
            await conn.mailboxOpen(this.path);
          }
          // Re-try only once (to open mailbox)
        } else {
          throw ex;
        }
      }
      return await jmapFunc(conn);
    } catch (ex) {
      if (ex.responseText) {
        throw new JMAPCommandError(ex, ex.responseText);
      } else {
        throw ex;
      }
    } finally {
      lock?.release();
    }
  }

  /** Lists all messages in this folder.
   * But doesn't download their contents. @see downloadMessages() */
  async listMessages(): Promise<ArrayColl<JMAPEMail>>  {
    await this.readFolder();
    let newMsgs = new ArrayColl<JMAPEMail>();
    // TODO
    return newMsgs;
  }

  /** Lists all messages in this folder that have not been fetched yet.
   * But doesn't download their contents. @see downloadMessages() */
  protected async listAllUnknownMessages(): Promise<ArrayColl<JMAPEMail>> {
    // TODO save range of lowest and highest UID of emails that we have fetched and saved,
    // to not re-fetch the whole list over and over again.
    let allUIDs = await this.fetchUIDList({ all: true });

    // Delete messages that are no longer on the server @see checkDeletedMessages()
    let deletedMsgs = this.messages.filter((msg: JMAPEMail) => !allUIDs.includes(msg.uid));
    this.messages.removeAll(deletedMsgs);
    for (let deletedMsg of deletedMsgs) {
      await deletedMsg.deleteMessageLocally();
    }

    // Fetch new msgs
    let localUIDs = new ArrayColl(this.messages.contents.map((msg: JMAPEMail) => msg.uid));
    let newUIDs = allUIDs.subtract(localUIDs).sortBy(uid => -uid);
    let newMsgs = new ArrayColl<JMAPEMail>();
    //console.log("Folder", this.account.name, this.name, "has", allUIDs.length, "msgs,", localUIDs.length, "local msgs,", newUIDs.length, "new");
    const kBatchSize = 200;
    while (newUIDs.hasItems) {
      //let startTime = Date.now();
      let fetchUIDs = newUIDs.splice(0, kBatchSize); // Gets the first n, and removes them from the list
      let { newMessages } = await this.fetchMessageList({ uid: fetchUIDs.join(",") }, {});
      newMsgs.addAll(newMessages);
      this.messages.addAll(newMessages);
      //let fetchTime = Date.now() - startTime;
      await this.saveNewMsgs(newMessages);
      //let saveTime = Date.now() - startTime - fetchTime;
      //console.log("  Fetched", fetchUIDs.length, ", remaining", newUIDs.length, "- Time: Fetch:", fetchTime / kBatchSize, "ms/msg, save time", saveTime / kBatchSize, "ms/msg");
    }

    await this.storage.saveFolderProperties(this);
    return newMsgs;
  }

  /** Lists all messages in this folder.
   * But doesn't download their contents. @see downloadMessages() */
  protected async listAllMessages(): Promise<ArrayColl<JMAPEMail>> {
    let { newMessages } = await this.fetchMessageList({ all: true }, {});
    this.messages.addAll(newMessages);
    await this.storage.saveFolderProperties(this);
    await this.saveNewMsgs(newMessages);
    return newMessages;
  }

  /** Lists all messages in this folder that are new or updated since the last fetch.
   * Works only with CONDSTORE server capability. */
  protected async listChangedMessages(): Promise<ArrayColl<JMAPEMail>> {
    let { newMessages } = await this.fetchMessageList({ all: true }, {
      changedSince: this.lastModSeq, // Works only with CONDSTORE capa
    });
    this.messages.addAll(newMessages);
    await this.storage.saveFolderProperties(this);
    await this.saveNewMsgs(newMessages);
    return newMessages;
  }

  /** Lists new messages, based on the UID being higher.
   * But doesn't download their contents @see getNewMessages() */
  async listNewMessages(): Promise<ArrayColl<JMAPEMail>> {
    await this.readFolder();
    if (this.countTotal === 0) {
      return new ArrayColl();
    }
    let fromUID = this.highestUID ?? "1";
    let { newMessages } = await this.fetchMessageList({ uid: fromUID + ":*" }, {});
    this.messages.addAll(newMessages);
    await this.saveNewMsgs(newMessages);
    await this.storage.saveFolderProperties(this);
    return newMessages;
  }

  protected async fetchMessageList(range: any, options: any): Promise<{ newMessages: ArrayColl<JMAPEMail>, updatedMessages: ArrayColl<JMAPEMail> }> {
    console.log("JMAP fetch", range);
    let newMessages = new ArrayColl<JMAPEMail>();
    let updatedMessages = new ArrayColl<JMAPEMail>();
    await this.runCommand(async (conn) => {
      let returnData = {
        uid: true,
        size: true,
        threadId: true,
        internalDate: true,
        envelope: true,
        flags: true,
      };
      let msgsAsyncIterator = await conn.fetch(range, returnData, options);
      for await (let msgInfo of msgsAsyncIterator) {
        if (!msgInfo.envelope || this.deletions.has(msgInfo.uid)) {
          continue;
        }
        let msg = this.getEMailByUID(msgInfo.uid);
        if (msg) {
          msg.fromFlow(msgInfo);
          updatedMessages.add(msg);
        } else {
          msg = new JMAPEMail(this);
          msg.fromFlow(msgInfo);
          newMessages.add(msg);
        }
        this.updateModSeq(msgInfo.modseq);
      }
    });
    return { newMessages, updatedMessages };
  }

  protected async fetchFlags(range: any, options: any): Promise<{ updatedMessages: ArrayColl<JMAPEMail> }> {
    let updatedMessages = new ArrayColl<JMAPEMail>();
    await this.runCommand(async (conn) => {
      let returnData = {
        uid: true,
        flags: true,
        //threadId: true,
      };
      let msgsAsyncIterator = await conn.fetch(range, returnData, options);
      for await (let msgInfo of msgsAsyncIterator) {
        if (!msgInfo.flags || this.deletions.has(msgInfo.uid)) {
          continue;
        }
        let msg = this.getEMailByUID(msgInfo.uid);
        if (!msg) {
          continue;
        }
        msg.setFlagsLocal(msgInfo.flags);
        updatedMessages.add(msg);
      }
    });
    return { updatedMessages };
  }

  /** @returns UIDs within the requested range */
  protected async fetchUIDList(range: any): Promise<ArrayColl<number>> {
    let ids: number[];
    await this.runCommand(async (conn) => {
      ids = await conn.search(range, { uid: true });
    });
    return new ArrayColl(ids);
  }

  protected async updateNewFlags() {
    let recentMsg = this.recentMsg;
    let highestUID = this.highestUID;
    if (!recentMsg || !highestUID) {
      return;
    }
    let { updatedMessages } = await this.fetchFlags(
      { uid: this.recentMsg.uid + ":" + highestUID }, {});
    await this.saveMsgUpdates(updatedMessages);
  }

  /** Lists new messages, and downloads them */
  async getNewMessages(): Promise<ArrayColl<JMAPEMail>> {
    await this.checkDeletedMessages(this.recentMsg?.uid);
    let newMsgs = await this.listNewMessages();
    await this.downloadMessages(newMsgs);
    return newMsgs;
  }

  /** Lists all messages, and downloads them */
  async getAllMessages(): Promise<ArrayColl<JMAPEMail>> {
    await this.checkDeletedMessages(1);
    let newMsgs = await this.listAllMessages();
    await this.downloadMessages(newMsgs);
    return newMsgs;
  }

  /**
   * Downloads the emails in batches.
   * @return Actually newly downloaded msgs
   */
  async downloadMessages(emails: Collection<JMAPEMail>): Promise<Collection<JMAPEMail>> {
    let needMsgs = new ArrayColl(emails.sortBy(msg => -msg.uid));
    let downloadedMsgs = new ArrayColl<JMAPEMail>();
    const kMaxCount = 50;
    while (needMsgs.hasItems) {
      let downloadingMsgs = needMsgs.getIndexRange(needMsgs.length - kMaxCount, kMaxCount) as any as JMAPEMail[];
      needMsgs.removeAll(downloadingMsgs);
      let uids = downloadingMsgs.map(msg => msg.uid).join(",");
      await this.runCommand(async (conn) => {
        let msgInfos = await conn.fetch({ uid: uids }, {
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
              await msg.saveCompleteMessage();
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

  getEMailByUID(uid: number): JMAPEMail {
    return this.messages.find((m: JMAPEMail) => m.uid == uid) as JMAPEMail;
  }

  /** Does *not* necessarily return the right email. But typically one close to it. */
  getEMailBySeq(seq: number): JMAPEMail {
    let msg = this.messages.find((m: JMAPEMail) => m.seq == seq);
    if (msg) {
      return msg as JMAPEMail;
    }
    let byUID = this.messages.sortBy((m: JMAPEMail) => m.uid);
    // The sequence number changes with every email deletion :-( Thus,
    // emulate how the server calculates the sequence number
    msg = byUID.getIndex(seq);
    if (msg) {
      return msg as JMAPEMail;
    }
    return byUID.last as JMAPEMail;
  }

  /** Return local msgs around the sequence number.
   * @return first = oldest = `beforeCount` before `seq`, last = newest = `afterCount` after `seq` */
  getEmailsAroundSeq(seq: number, beforeCount: number, afterCount: number): ArrayColl<JMAPEMail> {
    let message = this.getEMailBySeq(seq);
    if (!message) {
      return new ArrayColl<JMAPEMail>();
    }
    let sortedByUID = this.messages.sortBy((msg: JMAPEMail) => msg.uid);
    let pos = sortedByUID.getKeyForValue(message);
    let from = pos - beforeCount;
    let to = pos + afterCount;
    return new ArrayColl(sortedByUID.getIndexRange(from, to) as JMAPEMail[]);
  }

  /** @returns UID of newest message known locally */
  protected get highestUID(): number {
    let uids = this.messages.map((msg: JMAPEMail) => msg.uid);
    return uids.sortBy(uid => -uid).first;
  }

  /** @returns message from n days ago */
  protected get recentMsg(): JMAPEMail {
    const kDaysPast = 14;
    let recently = new Date();
    recently.setDate(recently.getDate() - kDaysPast);
    return this.messages
      .filter(msg => msg.received.getTime() < recently.getTime()) // last n days
      .sortBy((msg: JMAPEMail) => msg.uid)
      .first as JMAPEMail; // oldest
  }

  protected async saveNewMsgs(msgs: Collection<JMAPEMail>) {
    let startTime = Date.now();
    for (let email of msgs) {
      try {
        if (email.subject) {
          await this.storage.saveMessage(email);
        }
      } catch (ex) {
        this.account.errorCallback(ex);
      }
    }
    let saveTime = Date.now() - startTime;
    console.log("  Saved", msgs.length, "msgs in", saveTime, "ms =", saveTime / msgs.length, "ms/msg");
  }

  protected async saveMsgUpdates(msgs: Collection<JMAPEMail>) {
    for (let email of msgs) {
      try {
        if (email.subject) {
          await this.storage.saveMessageWritableProps(email);
        }
      } catch (ex) {
        this.account.errorCallback(ex);
      }
    }
  }

  updateModSeq(modseq: number) {
    if (typeof (modseq) != "number") {
      return;
    }
    if (modseq > this.lastModSeq) {
      this.lastModSeq = modseq;
    }
  }

  startPolling() {
    if (!this.account.pollIntervalMinutes) {
      return;
    }
    this.stopPolling();

    this.poller = setInterval(async () => {
      try {
        await this.pollRun();
      } catch (ex) {
        this.account.errorCallback(ex);
      }
    }, this.account.pollIntervalMinutes * 1000 * 60);
  }

  stopPolling() {
    if (!this.poller) {
      return;
    }
    clearInterval(this.poller);
    this.poller = null;
  }

  protected async pollRun() {
    await this.getNewMessages();
  }

  /**
   * Compares messages on the server with the locally known messages,
   * and deletes all messages locally that do not exist on the server.
   *
   * @param fromUID Check all messages starting with this UID,
   *   up to the newest message in this folder.
   *   Optional. By default, checks entire folder (may be slow!)
   */
  async checkDeletedMessages(fromUID: number = 1) {
    let localMsgs = this.messages.contents.filter((msg: JMAPEMail) => msg.uid >= fromUID);
    let serverUIDs = await this.fetchUIDList({ uid: fromUID + ":" + this.highestUID });
    let deletedMsgs = localMsgs.filter((msg: JMAPEMail) => !serverUIDs.includes(msg.uid));

    this.messages.removeAll(deletedMsgs);
    for (let deletedMsg of deletedMsgs) {
      await deletedMsg.deleteMessageLocally();
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

    let message = uid && this.getEMailByUID(uid);
    if (message) {
      message.setFlagsLocal(flags);
      await this.storage.saveMessageWritableProps(message);
      return;
    }

    let updateMsgs = this.getEmailsAroundSeq(seq, 10, 10);
    let fromUID = updateMsgs.first?.uid ?? 1;
    let toUID = updateMsgs.last?.uid ?? this.highestUID;
    let { updatedMessages } = await this.fetchFlags({ uid: fromUID + ":" + toUID }, {});
    await this.saveMsgUpdates(updatedMessages);
  }

  /** We received an event from the server that a
   * message was deleted */
  async messageDeletedNotification(seq: number): Promise<void> {
    await this.checkDeletedMessages(this.recentMsg?.uid); // HACK Doesn't consider which msg was deleted

    /* old impl:
    let fromUID: number;
    let message = this.getEMailBySeq(seq);
    if (message) {
      let sortedByUID = this.messages.sortBy((msg: JMAPEMail) => -msg.uid);
      let pos = sortedByUID.getKeyForValue(message);
      pos += 20; // Get a few more
      let fromMsg = sortedByUID.getIndex(pos) ?? sortedByUID.last;
      fromUID = (fromMsg as JMAPEMail).uid;
    } */
    /* New impl: TODO Deletes last few days of messages
    let fromUID = this.getEmailsAroundSeq(seq, 20, 0).first?.uid;
    await this.checkDeletedMessages(fromUID);
    */
  }

  async addMessage(email: EMail) {
    // Do *not* call super.addMessage();
    assert(email.mime, "Need MIME to upload it to a folder");
    await this.runCommand(async (conn) => {
      let flags = ["\\Seen"]; // TODO
      await conn.append(this.path, Buffer.from(email.mime), flags); // TODO hangs
    });
  }

  async moveMessagesHere(messages: Collection<JMAPEMail>) {
    await super.moveMessagesHere(messages);
    let ids = messages.contents.map(msg => msg.uid).join(",");
    let conn = await this.account.connection(); // Don't lock: 2 mailboxes involved
    await conn.messageMove(ids, this.path, { uid: true });
    let sourceFolder = messages.first.folder;
    sourceFolder.countTotal -= messages.length;
    this.countTotal += messages.length;
    for (let sourceMsg of messages) {
      await sourceMsg.deleteMessageLocally();
    }
    await this.listNewMessages();
  }

  async copyMessagesHere(messages: Collection<JMAPEMail>) {
    await super.copyMessagesHere(messages);
    let ids = messages.contents.map(msg => msg.uid).join(",");
    let conn = await this.account.connection(); // Don't lock: 2 mailboxes involved
    await conn.messageCopy(ids, this.path, { uid: true });
    this.countTotal += messages.length;
    for (let sourceMsg of messages) {
      await sourceMsg.deleteMessageLocally();
    }
    await this.listNewMessages();
  }

  async moveFolderHere(folder: JMAPFolder) {
    assert(folder.account == this.account, "Cannot move folders between accounts yet. You can create a new folder and move the messages");
    await super.moveFolderHere(folder);
    /*
    assert(folder.subFolders.isEmpty, `Folder ${folder.name} has sub-folders. Cannot yet move entire folder hierarchies. You may move the folders individually.`);
    let newFolder = await this.createSubFolder(folder.name);
    await newFolder.moveMessagesHere(folder.messages as any as Collection<JMAPEMail>);
    await folder.deleteIt();
    console.log("Folder moved from", folder.path, "to", newFolder.path);
    */
    await this.runCommand(async (conn) => {
      // Set this.JSON.parentId = folder.id;
    });
  }

  async createSubFolder(name: string): Promise<JMAPFolder> {
    let newFolder = await super.createSubFolder(name) as JMAPFolder;
    await this.runCommand(async (conn) => {
      let created = await conn.mailboxCreate([this.path, name]);
      newFolder.path = created.path;
    });
    console.log("JMAP folder created", name, newFolder.path);
    await newFolder.listMessages();
    return newFolder;
  }

  async rename(newName: string): Promise<void> {
    await super.rename(newName);
    await this.runCommand(async (conn) => {
      // Set this.JSON.name = newName;
    });
  }

  /** Warning: Also deletes all messages in the folder, also on the server */
  protected async deleteItOnServer(): Promise<void> {
    await this.runCommand(async (conn) => {
      await conn.mailboxDelete(this.path);
    });
    console.log("JMAP folder deleted", this.name, this.path);
  }

  async markAllRead(): Promise<void> {
    await super.markAllRead();
    await this.runCommand(async (conn) => {
      await conn.messageFlagsAdd("1:*", ["\\Seen"], { uid: true });
    });
  }

  /** @param specialUse From RFC 6154, e.g. `\Sent`
   * <https://datatracker.ietf.org/doc/html/rfc6154> */
  setSpecialUse(role: string): void {
    switch (role) {
      case "inbox":
        this.specialFolder = SpecialFolder.Inbox;
        break;
      case "trash":
        this.specialFolder = SpecialFolder.Trash;
        break;
      case "junk":
        this.specialFolder = SpecialFolder.Spam;
        break;
      case "sent":
        this.specialFolder = SpecialFolder.Sent;
        break;
      case "drafts":
        this.specialFolder = SpecialFolder.Drafts;
        break;
      case "archive":
        this.specialFolder = SpecialFolder.Archive;
        break;
    }
  }

  newEMail(): JMAPEMail {
    return new JMAPEMail(this);
  }
}
