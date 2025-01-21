import { Folder, SpecialFolder } from "../Folder";
import { JMAPEMail } from "./JMAPEMail";
import type { JMAPAccount } from "./JMAPAccount";
import type { EMail } from "../EMail";
import type { EMailCollection } from "../Store/EMailCollection";
import type { TJMAPChangeResponse, TJMAPEMailHeaders, TJMAPFolder, TJMAPGetResponse } from "./JMAPTypes";
import { Lock } from "../../util/Lock";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assert } from "../../util/util";
import { ArrayColl, Collection } from "svelte-collections";
import { Buffer } from "buffer";
import { gt } from "../../../l10n/l10n";

export class JMAPFolder extends Folder {
  account: JMAPAccount;
  readonly messages: EMailCollection<JMAPEMail>;
  isSubscribed: boolean = true;
  sortOrder: number = Infinity;
  protected poller: ReturnType<typeof setInterval>;
  protected listLock = new Lock(); /** protects this.syncState */
  readonly deletions = new Set<string>();

  constructor(account: JMAPAccount) {
    super(account);
  }

  fromJMAP(json: TJMAPFolder) {
    this.id = sanitize.nonemptystring(json.id);
    this.name = sanitize.nonemptystring(json.name);
    this.countTotal = sanitize.integer(json.totalEmails);
    this.countUnread = sanitize.integer(json.unreadEmails);
    this.isSubscribed = sanitize.boolean(json.isSubscribed);
    this.sortOrder = sanitize.integer(json.sortOrder);
    this.setSpecialUse(json.role);
  }

  /** Lists messages in this folder. Updates are efficient.
   * But doesn't download their contents. @see downloadMessages() */
  async listMessages(): Promise<ArrayColl<JMAPEMail>> {
    await this.readFolder();
    return this.messages.isEmpty
      ? await this.listAllMessages()
      : await this.listChangedMessages();
  }

  /** Lists all messages in this folder.
   * But doesn't download their contents. @see downloadMessages() */
  protected async listAllMessages(): Promise<ArrayColl<JMAPEMail>> {
    const batchSize = 200;
    let allNewMessages = new ArrayColl<JMAPEMail>();
    for (let i = 0; i < this.countTotal; i += batchSize) {
      let { newMessages } = await this.fetchMessageList(i, batchSize);
      this.messages.addAll(newMessages);
      await this.saveNewMsgs(newMessages);
      allNewMessages.addAll(newMessages);
    }
    await this.storage.saveFolderProperties(this);
    return allNewMessages;
  }

  /** Lists all messages in this folder that are new or updated since the last fetch. */
  protected async listChangedMessages(): Promise<ArrayColl<JMAPEMail>> {
    let { newMessages, removedMessages, updatedMessages } = await this.fetchNewMessages();
    this.messages.removeAll(removedMessages);
    this.messages.addAll(newMessages);

    await this.storage.saveFolderProperties(this);
    await this.saveMsgUpdates(updatedMessages);
    await this.saveNewMsgs(newMessages);
    return newMessages;
  }

  protected async fetchMessageList(start?: number, limit?: number, options?: any): Promise<{ newMessages: ArrayColl<JMAPEMail>, updatedMessages: ArrayColl<JMAPEMail> }> {
    console.log("JMAP fetch", limit || start ? `start ${start} limit ${limit}` : "all");
    let listResponse: TJMAPGetResponse<TJMAPEMailHeaders>;
    let lock = await this.listLock.lock();
    try {
      // <https://www.rfc-editor.org/rfc/rfc8621.html#section-4.4>
      let response = await this.account.makeCombinedCall([
        [
          "Email/query", {
            accountId: this.account.accountID,
            filter: {
              inMailbox: this.id,
            },
            sort: [
              { property: "receivedAt", isAscending: false }
            ],
            position: start,
            limit: limit,
          },
          "list",
        ], [
          "Email/get", {
            accountId: this.account.accountID,
            "#ids": {
              name: "Email/query",
              path: "/ids",
              resultOf: "list",
            },
          },
          "emails",
        ],
      ]) as TJMAPGetResponse<TJMAPEMailHeaders>;
      listResponse = response["emails"];

      let result = await this.parseMessageList(listResponse);
      this.syncState = listResponse.state;
      return result;
    } finally {
      lock.release();
    }
  }

  protected async fetchNewMessages(): Promise<{ newMessages: ArrayColl<JMAPEMail>, removedMessages: ArrayColl<JMAPEMail>, updatedMessages: ArrayColl<JMAPEMail> }> {
    console.log("JMAP fetch changes");
    let lock = await this.listLock.lock();
    try {
      // <https://www.rfc-editor.org/rfc/rfc8620#section-5.2>
      let response = await this.account.makeCombinedCall([
        [
          "Email/changes", {
            accountId: this.account.accountID,
            filter: {
              inMailbox: this.id,
            },
            sort: [
              { property: "receivedAt", isAscending: false }
            ],
            sinceQueryState: this.syncState,
          },
          "changes",
        ], [
          "Email/get", {
            accountId: this.account.accountID,
            "#ids": {
              name: "Email/queryChanges",
              path: "created/*",
              resultOf: "changes",
            },
          },
          "added",
        ], [
          "Email/get", {
            accountId: this.account.accountID,
            "#ids": {
              name: "Email/queryChanges",
              path: "changed/*",
              resultOf: "changes",
            },
          },
          "changed",
        ],
      ]);

      let changes = response["changes"] as TJMAPChangeResponse;
      let listNewResponse = response["added"] as TJMAPGetResponse<TJMAPEMailHeaders>;
      let listChangedResponse = response["changed"] as TJMAPGetResponse<TJMAPEMailHeaders>;

      let removedMessages = new ArrayColl<JMAPEMail>();
      for (let removedID of changes.destroyed) {
        let msg = this.getEMailByPID(removedID);
        if (!msg) {
          continue;
        }
        removedMessages.add(msg);
        await msg.deleteMessageLocally();
      }

      let addedResult = await this.parseMessageList(listNewResponse, false);
      let changedResult = await this.parseMessageList(listChangedResponse);
      addedResult.newMessages.addAll(changedResult.newMessages);

      this.syncState = changes.newState;
      return {
        newMessages: addedResult.newMessages,
        updatedMessages: changedResult.updatedMessages,
        removedMessages,
      };
    } finally {
      lock.release();
    }
  }

  protected async parseMessageList(listResponse: TJMAPGetResponse<TJMAPEMailHeaders>, checkUpdates = true): Promise<{ newMessages: ArrayColl<JMAPEMail>, updatedMessages: ArrayColl<JMAPEMail> }> {
    let newMessages = new ArrayColl<JMAPEMail>();
    let updatedMessages = new ArrayColl<JMAPEMail>();
    for (let json of listResponse.list) {
      let pID = sanitize.nonemptystring(json.id);
      if (this.deletions.has(pID)) {
        continue;
      }
      let msg = checkUpdates && this.getEMailByPID(pID);
      if (msg) {
        msg.fromJMAP(json);
        updatedMessages.add(msg);
      } else {
        msg = this.newEMail();
        msg.fromJMAP(json);
        newMessages.add(msg);
      }
    }
    return { newMessages, updatedMessages };
  }

  /** Lists new messages, and downloads them */
  async getNewMessages(): Promise<ArrayColl<JMAPEMail>> {
    let newMsgs = await this.listChangedMessages();
    this.messages.addAll(newMsgs);
    await this.downloadMessages(newMsgs);
    return newMsgs;
  }

  /** Lists all messages, and downloads them */
  async getAllMessages(): Promise<ArrayColl<JMAPEMail>> {
    let newMsgs = await this.listAllMessages();
    await this.downloadMessages(newMsgs);
    let updateNew = await this.getAllMessages();
    newMsgs.addAll(updateNew);
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
            let msg = this.getEMailByPID(msgInfo.uid);
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

  getEMailByPID(pID: string): JMAPEMail {
    return this.messages.find((m: JMAPEMail) => m.pID == pID) as JMAPEMail;
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
