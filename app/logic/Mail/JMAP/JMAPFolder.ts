import { Folder, SpecialFolder } from "../Folder";
import { JMAPEMail } from "./JMAPEMail";
import type { JMAPAccount } from "./JMAPAccount";
import type { EMail } from "../EMail";
import type { EMailCollection } from "../Store/EMailCollection";
import type { TJMAPChangeResponse, TJMAPEMailHeaders, TJMAPFolder, TJMAPGetResponse, TJMAPUpload } from "./JMAPTypes";
import { Lock } from "../../util/Lock";
import { Semaphore } from "../../util/Semaphore";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { NotImplemented, assert } from "../../util/util";
import { ArrayColl, Collection } from "svelte-collections";
import { Buffer } from "buffer";
import { gt } from "../../../l10n/l10n";

export class JMAPFolder extends Folder {
  account: JMAPAccount;
  readonly messages: EMailCollection<JMAPEMail>;
  isSubscribed: boolean = true;
  sortOrder: number = Infinity;
  myRights = {} as TJMAPFolder["myRights"];
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
    for (let right in json.myRights) {
      this.myRights[right] = sanitize.boolean(json.myRights[right], true);
    }
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
    let { newMessages, removedMessages, updatedMessages } = await this.fetchChangedMessages();
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

  protected async fetchChangedMessages(): Promise<{ newMessages: ArrayColl<JMAPEMail>, removedMessages: ArrayColl<JMAPEMail>, updatedMessages: ArrayColl<JMAPEMail> }> {
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
            sinceState: this.syncState,
          },
          "changes",
        ], [
          "Email/get", {
            accountId: this.account.accountID,
            "#ids": {
              name: "Email/changes",
              path: "created/*",
              resultOf: "changes",
            },
          },
          "added",
        ], [
          "Email/get", {
            accountId: this.account.accountID,
            "#ids": {
              name: "Email/changes",
              path: "updated/*",
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
    let newMsgs = await this.listMessages();
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
    let needMsgs = new ArrayColl(emails);
    let downloadedMsgs = new ArrayColl<JMAPEMail>();
    const kMaxParallelCount = 5;
    let semaphore = new Semaphore(kMaxParallelCount);
    while (needMsgs.hasItems) {
      let msg = needMsgs.pop();
      let lock = await semaphore.lock();
      (async () => {
        try {
          await msg.download();
        } catch (ex) {
          this.account.errorCallback(ex);
        } finally {
          lock.release();
        }
      })();
    }
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
    let url = this.account.session.uploadUrl;
    url = url
      .replace("{accountId}", this.account.accountID)
      .replace("{name}", "email")
      .replace("{type}", "message/rfc822");
    let uploadResponse = await this.account.httpPostBinary(url, Buffer.from(email.mime), {
      headers: {
        "Content-Type": "message/rfc822",
      },
    }) as TJMAPUpload;
    let blobId = uploadResponse.blobId;
    assert(uploadResponse.size == email.mime.length, `Storing message failed: Sent ${email.mime.length} bytes, received: ${uploadResponse.size} bytes`);
    let createResponse = await this.account.makeSingleCall("Email/set", {
      accountId: this.account.accountID,
      create: {
        "addMessage": {
          mailboxIds: {
            [this.id]: true
          },
          blobId: blobId,
          keywords: JMAPEMail.getJMAPFlags(email),
          receivedAt: email.received.toISOString(),
          /*
          sentAt: email.sent.toISOString(),
          subject: email.subject,
          from: [{ name: email.from.name, email: email.from.emailAddress }],
          replyTo: email.replyTo ? [{ name: email.replyTo.name ?? email.from.name, email: email.replyTo.emailAddress }] : undefined,
          cc: email.cc.map(p => ({ name: p.name, email: p.emailAddress })),
          bcc: email.bcc.map(p => ({ name: p.name, email: p.emailAddress })),
          size: email.mime.length,
          */
        },
      },
    }) as TJMAPChangeResponse;
    email.pID = createResponse.created["addMessage"].id;
  }

  async moveMessagesHere(messages: Collection<JMAPEMail>) {
    if (await this.moveOrCopyMessages("move", messages)) {
      return;
    }
    return await this.moveOrCopyMessagesOnServer("move", messages);
  }

  async copyMessagesHere(messages: Collection<JMAPEMail>) {
    if (await this.moveOrCopyMessages("copy", messages)) {
      return;
    }
    return await this.moveOrCopyMessagesOnServer("copy", messages);
  }

  async moveOrCopyMessagesOnServer(action: "move" | "copy", messages: Collection<JMAPEMail>) {
    let targetFolderID = this.id;
    let updates = {};
    for (let msg of messages) {
      let id = msg.pID;
      let sourceFolderID = msg.folder.id;
      updates[id] = {
        mailboxIds: {
          [targetFolderID]: true,
          [sourceFolderID]: action == "copy",
        },
      };
    }
    await this.account.makeSingleCall("Email/set", {
      accountId: this.account.accountID,
      update: updates,
    });

    this.countTotal += messages.length;
    let sourceFolder = messages.first.folder;
    if (action == "move") {
      sourceFolder.countTotal -= messages.length;
      for (let sourceMsg of messages) {
        await sourceMsg.deleteMessageLocally();
      }
    }

    await this.listChangedMessages();
    if (action == "move") {
      sourceFolder.listChangedMessages();
    }
  }

  async moveFolderHere(folder: JMAPFolder) {
    await super.moveFolderHere(folder);
    await this.account.makeSingleCall("Mailbox/set", {
      accountId: this.account.accountID,
      update: {
        [folder.id]: {
          parentId: this.id,
        },
      },
    });
    await this.account.listFolders();
  }

  async createSubFolder(name: string): Promise<JMAPFolder> {
    let newFolder = await super.createSubFolder(name) as JMAPFolder;
    let response = await this.account.makeSingleCall("Mailbox/set", {
      accountId: this.account.accountID,
      create: {
        "newFolder": {
          parentId: this.id,
          name: name,
          isSubscribed: true,
        },
      },
    }) as TJMAPChangeResponse;
    newFolder.id = response.created["newFolder"].id;
    this.account.allFolders.set(newFolder.id, newFolder);
    console.log("JMAP folder created", name);
    await this.account.listFolders();
    await newFolder.listMessages();
    return newFolder;
  }

  async rename(newName: string): Promise<void> {
    await super.rename(newName);
    await this.account.makeSingleCall("Mailbox/set", {
      accountId: this.account.accountID,
      update: {
        [this.id]: {
          name: newName,
        },
      },
    });
  }

  /** Warning: Also deletes all messages in the folder, also on the server */
  protected async deleteItOnServer(): Promise<void> {
    await this.account.makeSingleCall("Mailbox/set", {
      accountId: this.account.accountID,
      destroy: [this.id],
    });
    console.log("JMAP folder deleted", this.name, this.path);
  }

  async markAllRead(): Promise<void> {
    await super.markAllRead();
    throw new NotImplemented();
    await this.account.makeCombinedCall([
      [
        "Email/query", {
          accountId: this.account.accountID,
          filter: {
            inMailbox: this.id,
          },
        },
        "list",
      ], [
        "Email/set", {
          accountId: this.account.accountID,
          update: {
            "#ids": {
              name: "Email/query",
              path: "/ids",
              resultOf: "list",
            },
            idFromResultTODO: {
              keywords: {
                ["$seen"]: true,
              }
            }
          }
        },
        "markRead",
      ],
    ]);
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

  disableDelete(): string | false {
    return super.disableDelete() ??
      this.myRights.mayDelete
      ? gt(`You cannot delete this folder, because the server forbids it.`)
      : null;
  }

  disableRename(): string | false {
    return super.disableRename() ??
      this.myRights.mayRename
      ? gt(`You cannot rename this folder, because the server forbids it.`)
      : null;
  }

  disableSubfolders(): string | false {
    return super.disableSubfolders() ??
      this.myRights.mayCreateChild
      ? gt(`You cannot create subfolders of this folder, because the server forbids it.`)
      : null;
  }

  newEMail(): JMAPEMail {
    return new JMAPEMail(this);
  }
}
