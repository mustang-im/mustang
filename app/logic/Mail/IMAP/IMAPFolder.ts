import { Folder, SpecialFolder } from "../Folder";
import { IMAPEMail } from "./IMAPEMail";
import { type IMAPAccount, IMAPCommandError, ConnectionPurpose } from "./IMAPAccount";
import type { EMail } from "../EMail";
import type { EMailCollection } from "../Store/EMailCollection";
import { CreateMIME } from "../SMTP/CreateMIME";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import type { Locked } from "../../util/Lock";
import { assert } from "../../util/util";
import { gt } from "../../../l10n/l10n";
import { ArrayColl, Collection } from "svelte-collections";
import { Buffer } from "buffer";
import type { ImapFlow } from "../../../../backend/node_modules/imapflow";
import { PersonUID } from "../../Abstract/PersonUID";

export class IMAPFolder extends Folder {
  declare account: IMAPAccount;
  declare readonly messages: EMailCollection<IMAPEMail>;
  declare readonly subFolders: ArrayColl<IMAPFolder>;
  uidvalidity: number = 0;
  protected poller: ReturnType<typeof setInterval>;
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
  get lastModSeq(): bigint {
    return BigInt(this.syncState ?? 0n);
  }
  set lastModSeq(val: bigint) {
    assert(typeof (val) == "bigint", "IMAP Folder modseq must be a bigint");
    this.syncState = String(val);
    this.storage.saveFolderProperties(this).catch(this.account.errorCallback);
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

  async runCommand<T>(imapFunc: (conn: ImapFlow) => Promise<T>, purpose = ConnectionPurpose.Main, connection: ImapFlow = null, doLock = true): Promise<T> {
    let lockMailbox;
    let lock: Locked;
    try {
      let conn = connection ?? await this.account.connection(false, purpose);
      try {
        if (doLock) {
          lock = await this.account.connectionLock.get(conn).lock();
          lockMailbox = await conn.getMailboxLock(this.path);
        } else if (conn.mailbox.path == this.path) {
          // already open
        } else {
          await conn.mailboxOpen(this.path);
        }
      } catch (ex) {
        console.log("Opening IMAP folder failed", ex);
        if (ex.code == "NoConnection") {
          conn = await this.account.reconnect(conn, purpose);
          if (doLock) {
            lock ??= await this.account.connectionLock.get(conn).lock();
            lockMailbox ??= await conn.getMailboxLock(this.path);
          } else {
            await conn.mailboxOpen(this.path);
          }
          // Re-try only once (to open mailbox)
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
      lockMailbox?.release();
    }
  }

  /** Lists all messages in this folder.
   * But doesn't download their contents. @see downloadMessages()
   * @returns new messages */
  async listMessages(): Promise<Collection<IMAPEMail>>  {
    await this.readFolder();
    if (this.countTotal === 0) {
      return new ArrayColl<IMAPEMail>();
    }
    let lock = await this.listMessagesLock.lock();
    try {
      if (this.countNewArrived) {
        this.countNewArrived = 0;
        await this.storage.saveFolderProperties(this);
      }
      let newMsgs: ArrayColl<IMAPEMail>;
      if (await this.account.hasCapability("CONDSTORE")) {
        newMsgs = await this.listChangedMessages();
      } else {
        newMsgs = await this.listAllUnknownMessages();
        await this.updateNewFlags();
      }
      return newMsgs;
    } finally {
      lock.release();
    }
  }

  /** Lists all messages in this folder that have not been fetched yet.
   * But doesn't download their contents. @see downloadMessages() */
  protected async listAllUnknownMessages(): Promise<ArrayColl<IMAPEMail>> {
    // TODO save range of lowest and highest UID of emails that we have fetched and saved,
    // to not re-fetch the whole list over and over again.
    let allUIDs = await this.fetchUIDList({ all: true });

    // Delete messages that are no longer on the server @see checkDeletedMessages()
    let deletedMsgs = this.messages.filterOnce(msg => !allUIDs.includes(msg.uid));
    this.messages.removeAll(deletedMsgs);
    for (let deletedMsg of deletedMsgs) {
      await deletedMsg.deleteMessageLocally();
    }

    // Fetch new msgs
    let localUIDs = new ArrayColl(this.messages.contents.map(msg => msg.uid));
    let newUIDs = allUIDs.subtract(localUIDs).sortBy(uid => -uid);
    let newMsgs = new ArrayColl<IMAPEMail>();
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
  protected async listAllMessages(): Promise<ArrayColl<IMAPEMail>> {
    let lock = await this.listMessagesLock.lock();
    try {
      let { newMessages } = await this.fetchMessageList({ all: true }, {});
      this.messages.addAll(newMessages);
      await this.storage.saveFolderProperties(this);
      await this.saveNewMsgs(newMessages);
      return newMessages;
    } finally {
      lock.release();
    }
  }

  /** Lists all messages in this folder that are new or updated since the last fetch.
   * Works only with CONDSTORE server capability. */
  protected async listChangedMessages(): Promise<ArrayColl<IMAPEMail>> {
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
  async listNewMessages(): Promise<ArrayColl<IMAPEMail>> {
    await this.readFolder();
    let lock = await this.listMessagesLock.lock();
    try {
      if (this.countTotal === 0) {
        return new ArrayColl();
      }
      let fromUID = this.getHighestUID() ?? "1";
      let { newMessages } = await this.fetchMessageList({ uid: fromUID + ":*" }, {});
      this.messages.addAll(newMessages);
      await this.saveNewMsgs(newMessages);
      await this.storage.saveFolderProperties(this);
      return newMessages;
    } finally {
      lock.release();
    }
  }

  protected async fetchMessageList(range: any, options: any): Promise<{ newMessages: ArrayColl<IMAPEMail>, updatedMessages: ArrayColl<IMAPEMail> }> {
    let newMessages = new ArrayColl<IMAPEMail>();
    let updatedMessages = new ArrayColl<IMAPEMail>();
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
          msg = new IMAPEMail(this);
          msg.fromFlow(msgInfo);
          newMessages.add(msg);
        }
        this.updateModSeq(msgInfo.modseq);
      }
    }, ConnectionPurpose.Fetch);
    return { newMessages, updatedMessages };
  }

  protected async fetchFlags(range: any, options: any, connection?: ImapFlow): Promise<{ updatedMessages: ArrayColl<IMAPEMail> }> {
    let updatedMessages = new ArrayColl<IMAPEMail>();
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
    }, ConnectionPurpose.Fetch, connection);
    return { updatedMessages };
  }

  /** @returns UIDs within the requested range */
  protected async fetchUIDList(range: any, connection?: ImapFlow): Promise<ArrayColl<number>> {
    let ids: number[];
    await this.runCommand(async (conn) => {
      ids = await conn.search(range, { uid: true });
    }, ConnectionPurpose.Fetch, connection);
    return new ArrayColl(ids);
  }

  protected async updateNewFlags() {
    let recentMsg = this.getRecentMsg();
    let highestUID = this.getHighestUID();
    if (!recentMsg || !highestUID) {
      return;
    }
    let { updatedMessages } = await this.fetchFlags(
      { uid: recentMsg.uid + ":" + highestUID }, {});
    await this.saveMsgUpdates(updatedMessages);
  }

  /** Lists new messages, and downloads them */
  async getNewMessages(): Promise<Collection<IMAPEMail>> {
    await this.checkDeletedMessages(this.getRecentMsg()?.uid);
    let newMsgs = await this.listNewMessages();
    await this.downloadMessages(newMsgs);
    return newMsgs;
  }

  /** Lists all messages, and downloads them */
  async getAllMessages(): Promise<ArrayColl<IMAPEMail>> {
    await this.checkDeletedMessages(1);
    let newMsgs = await this.listAllMessages();
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
      let downloadingMsgs = needMsgs.getIndexRange(needMsgs.length - kMaxCount, kMaxCount);
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
      }, ConnectionPurpose.Fetch);
    }

    /*for (let msg of this.messages) {
      if (!msg.threadID && msg.dbID) {
        await msg.findThread(this.messages);
      }
    }*/

    return downloadedMsgs;
  }

  getEMailByUID(uid: number): IMAPEMail {
    return this.messages.find(m => m.uid == uid);
  }

  /** @returns UID of newest message known locally */
  protected getHighestUID(): number {
    let highest = 1;
    for (let msg of this.messages) {
      if (msg.uid > highest) {
        highest = msg.uid;
      }
    }
    return highest;
  }

  /** @returns message from n days ago */
  protected getRecentMsg(): IMAPEMail {
    const kDaysPast = 7;
    let recently = new Date();
    recently.setDate(recently.getDate() - kDaysPast);
    return this.messages
      .filterOnce(msg => msg.received.getTime() > recently.getTime()) // last n days
      .sortBy(msg => msg.uid)
      .first; // oldest
  }

  /** Save partial headers of newly discovered emails.
   *
   * Note: Completely downloaded emails are not saved here, but in
   * `downloadMessages()` -> `msg.saveCompleteMessage()` */
  protected async saveNewMsgs(msgs: Collection<IMAPEMail>) {
    if (msgs.isEmpty) {
      return;
    }
    let startTime = Date.now();
    await this.storage.saveMessages(msgs);
    let saveTime = Date.now() - startTime;
    console.log("  Saved", msgs.length, "msgs in", saveTime, "ms =", saveTime / msgs.length, "ms/msg");
  }

  protected async saveMsgUpdates(msgs: Collection<IMAPEMail>) {
    for (let email of msgs) {
      try {
        if (email.subject && email.dbID) {
          await this.storage.saveMessageWritableProps(email);
        }
      } catch (ex) {
        this.account.errorCallback(ex);
      }
    }
  }

  updateModSeq(modseq: bigint) {
    if (typeof (modseq) != "bigint") {
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
    let localMsgs = this.messages.filterOnce(msg => msg.uid >= fromUID);
    let serverUIDs = await this.fetchUIDList({ uid: fromUID + ":" + this.getHighestUID() });
    let deletedMsgs = localMsgs.filterOnce(msg => !serverUIDs.includes(msg.uid));

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
  async messageFlagsChanged(uid: number | null, seq: number, flags: Set<string>, newModSeq?: bigint, connection?: ImapFlow): Promise<void> {
    // console.log("msg flags changed", "uid", uid, "seq", seq, "flags", flags, "modseq", newModSeq);
    if (this.deletions.has(uid)) {
      return;
    }
    let query = uid && this.getEMailByUID(uid)
      ? { uid: uid }
      : { seq: seq }; // needs to happen on the same IMAP connection where we got the seq number from
    let { updatedMessages } = await this.fetchFlags(query, {}, connection);
    await this.saveMsgUpdates(updatedMessages);
  }

  /** We received an event from the server that a
   * message was deleted */
  async messageDeletedNotification(seq: number, connection: ImapFlow): Promise<void> {
    // We need to map from msg sequence number to UID
    // Ask server to list all known messages (as UID) from 1 msg before seq to seq.
    // (whereas `seq` is now the message after (!) the deleted msg,
    // given that seq are order numbers are therefore get re-assigned on delete.)
    // This should return exactly 2 messages (unless we're at the end or start).
    // Any UIDs between those 2 UIDs are deleted messages.
    // We should purge them from our cache.
    // This works even if several messages are deleted in a row.
    // Thanks to Arnt Gulbrandsen for the ingeneous tip

    if (seq == 1) {
      return; // TODO Handle seq == 1
    }
    // needs to happen on the same IMAP connection where we got the seq number from
    let remainingUIDs = await this.fetchUIDList({ seq: (seq - 1) + ":" + seq }, connection);
    if (remainingUIDs.length != 2) {
      return; // TODO Handle start and end
    }
    let startUID = remainingUIDs.first;
    let endUID = remainingUIDs.last;
    let deletedMsgs = this.messages.filterOnce(msg => startUID < msg.uid && msg.uid < endUID);
    for (let deletedMsg of deletedMsgs) {
      //console.log(`Deleted msg ${deletedMsg.subject}`);
      await deletedMsg.deleteMessageLocally();
    }
  }

  async moveMessagesHere(messages: Collection<IMAPEMail>) {
    if (await this.moveOrCopyMessages("move", messages)) {
      return;
    }
    let sourceFolder = messages.first.folder;
    sourceFolder.countTotal -= messages.length;
    this.countTotal += messages.length;
    for (let sourceMsg of messages) {
      await sourceMsg.deleteMessageLocally();
    }
    let ids = messages.contents.map(msg => msg.uid).join(",");
    await sourceFolder.runCommand(async conn => {
      await conn.messageMove(ids, this.path, { uid: true });
    });
    await this.listNewMessages();
  }

  async copyMessagesHere(messages: Collection<IMAPEMail>) {
    if (await this.moveOrCopyMessages("copy", messages)) {
      return;
    }
    this.countTotal += messages.length;
    let sourceFolder = messages.first.folder;
    let ids = messages.contents.map(msg => msg.uid).join(",");
    await sourceFolder.runCommand(async conn => {
      await conn.messageCopy(ids, this.path, { uid: true });
    });
    await this.listNewMessages();
  }

  async addMessage(message: EMail) {
    message.mime ??= await CreateMIME.getMIME(message);
    await this.runCommand(async (conn) => {
      await conn.append(this.path, Buffer.from(message.mime), IMAPEMail.getIMAPFlags(message), message.received);
    });
  }

  async moveFolderHere(folder: IMAPFolder) {
    await super.moveFolderHere(folder);
    /*
    assert(folder.subFolders.isEmpty, `Folder ${folder.name} has sub-folders. Cannot yet move entire folder hierarchies. You may move the folders individually.`);
    let newFolder = await this.createSubFolder(folder.name);
    await newFolder.moveMessagesHere(folder.messages);
    await folder.deleteIt();
    console.log("Folder moved from", folder.path, "to", newFolder.path);
    */
    await this.runCommand(async (conn) => {
      await conn.mailboxRename(folder.path, [this.path, folder.getPathComponents().pop()]);
    });
  }

  async createSubFolder(name: string): Promise<IMAPFolder> {
    let newFolder = await super.createSubFolder(name) as IMAPFolder;
    newFolder.path = this.path + "/" + name;
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
  protected async deleteItOnServer(): Promise<void> {
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

  async getSharedPersons(): Promise<ArrayColl<PersonUID> | undefined> {
    if (!await this.account.hasCapability("ACL")) {
      return undefined;
    }
    let conn = await this.account.connection();
    let attributes: Array<{ type: string, value: string }>;
    let persons = new ArrayColl<PersonUID>();
    let response = await conn.exec('GETACL', [{ type: 'ATOM', value: this.path }], { untagged: { async ACL(untagged) { attributes = untagged.attributes; } } });
    await response.next();
    for (let i = 1; i < attributes.length; i += 2) {
      let name = sanitize.nonemptystring(attributes[i].value);
      if (name == this.account.username) {
        continue;
      }
      let emailAddress = name.includes('@') ? name : name + this.account.emailAddress.slice(this.account.emailAddress.indexOf('@'));
      persons.add(new PersonUID(emailAddress, name));
    }
    return persons;
  }

  async addPermission(permission: PersonUID, rights: string) {
    let conn = await this.account.connection();
    let response = await conn.exec('SETACL', [{ type: 'ATOM', value: this.path }, { type: 'ATOM', value: permission.name }, { type: 'ATOM', value: "+" + rights }]);
    await response.next();
  }

  async removePermission(permission: PersonUID) {
    let conn = await this.account.connection();
    let response = await conn.exec('DELETEACL', [{ type: 'ATOM', value: this.path }, { type: 'ATOM', value: permission.name }]);
    await response.next();
  }
}
