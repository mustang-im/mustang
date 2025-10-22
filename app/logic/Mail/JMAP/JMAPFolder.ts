import { Folder, SpecialFolder } from "../Folder";
import { JMAPEMail } from "./JMAPEMail";
import type { JMAPAccount } from "./JMAPAccount";
import type { EMail } from "../EMail";
import type { EMailCollection } from "../Store/EMailCollection";
import type { TJMAPChangeResponse, TJMAPEMailHeaders, TJMAPFolder, TJMAPGetResponse, TJMAPUpload } from "./JMAPTypes";
import { CreateMIME } from "../SMTP/CreateMIME";
import { Semaphore } from "../../util/Semaphore";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { NotImplemented, assert } from "../../util/util";
import { ArrayColl, Collection } from "svelte-collections";
import { Buffer } from "buffer";
import { gt } from "../../../l10n/l10n";

export class JMAPFolder extends Folder {
  declare account: JMAPAccount;
  declare readonly messages: EMailCollection<JMAPEMail>;
  declare readonly subFolders: ArrayColl<JMAPFolder>;
  isSubscribed: boolean = true;
  sortOrder: number = Infinity;
  myRights = {} as TJMAPFolder["myRights"];
  protected poller: ReturnType<typeof setInterval>;
  readonly deletions = new Set<string>();

  constructor(account: JMAPAccount) {
    super(account);
  }

  fromJMAP(json: TJMAPFolder) {
    this.id = sanitize.nonemptystring(json.id);
    this.name = sanitize.nonemptystring(json.name);
    this.countTotal = sanitize.integer(json.totalEmails);
    this.countUnread = sanitize.integer(json.unreadEmails);
    this.isSubscribed = sanitize.boolean(json.isSubscribed, true);
    this.sortOrder = sanitize.integer(json.sortOrder);
    for (let right in json.myRights) {
      this.myRights[right] = sanitize.boolean(json.myRights[right], true);
    }
    this.setSpecialUse(json.role);
  }

  /** Lists messages in this folder. Updates are efficient.
   * But doesn't download their contents. @see downloadMessages() */
  async listMessages(): Promise<ArrayColl<JMAPEMail>> {
    if (!this.account.isLoggedIn) {
      await this.account.login(false);
    }

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
    if (!this.account.syncState.has("Email")) {
      return await this.listAllMessages();
    }
    return new ArrayColl(); // TODO folder sync is per account, not per folder

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
    let lock = await this.account.stateLock.lock();
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

      let result = this.parseMessageList(listResponse.list);
      this.account.setState("Email", listResponse.state);
      return result;
    } finally {
      lock.release();
    }
  }

  protected async fetchChangedMessages(): Promise<{ newMessages: ArrayColl<JMAPEMail>, removedMessages: ArrayColl<JMAPEMail>, updatedMessages: ArrayColl<JMAPEMail> }> {
    assert(this.account.syncState.has("Email"), "No sync state");
    console.log("JMAP fetch changes");
    let lock = await this.account.stateLock.lock();
    try {
      // <https://www.rfc-editor.org/rfc/rfc8620#section-5.2>
      let response = await this.account.makeCombinedCall([
        [
          "Email/changes", {
            accountId: this.account.accountID,
            sinceState: this.account.syncState.get("Email"),
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
      let addedResponse = response["added"] as TJMAPGetResponse<TJMAPEMailHeaders>;
      let changedResponse = response["changed"] as TJMAPGetResponse<TJMAPEMailHeaders>;

      let removedMessages = await this.parseRemovedMessages(changes.destroyed)
      let addedResult = this.parseMessageList(addedResponse.list, false);
      let changedResult = this.parseMessageList(changedResponse.list);
      addedResult.newMessages.addAll(changedResult.newMessages);

      this.account.setState("Email", changes.newState, changes.oldState);
      return {
        newMessages: addedResult.newMessages,
        updatedMessages: changedResult.updatedMessages,
        removedMessages,
      };
    } finally {
      lock.release();
    }
  }

  protected async parseRemovedMessages(messageIDs: string[]): Promise<ArrayColl<JMAPEMail>> {
    let removedMessages = new ArrayColl<JMAPEMail>();
    for (let removedID of messageIDs) {
      let msg = this.getEMailByPID(removedID);
      if (!msg) {
        continue;
      }
      removedMessages.add(msg);
      await msg.deleteMessageLocally();
    }
    return removedMessages;
  }

  protected parseMessageList(msgs: TJMAPEMailHeaders[], checkUpdates = true): { newMessages: ArrayColl<JMAPEMail>, updatedMessages: ArrayColl<JMAPEMail> } {
    let newMessages = new ArrayColl<JMAPEMail>();
    let updatedMessages = new ArrayColl<JMAPEMail>();
    for (let json of msgs) {
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

  protected getEMailByPID(pID: string): JMAPEMail {
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
    // #if [!WEBMAIL]
    await this.addMessageFromMIME(email);
    // #else
    await this.addMessageFromProperties(email);
    // #endif
  }

  /** Creates a MIME message locally and uploads that to the JMAP server */
  async addMessageFromMIME(email: EMail) {
    email.mime ??= await CreateMIME.getMIME(email);

    let uploadResponse = await this.account.uploadBlob(Buffer.from(email.mime), "message/rfc822", "email");
    let blobId = uploadResponse.blobId;
    assert(uploadResponse.size == email.mime.length, `Storing message failed: Sent ${email.mime.length} bytes, received: ${uploadResponse.size} bytes`);
    let createResponse = await this.account.makeSingleCall("Email/import", {
      accountId: this.account.accountID,
      emails: {
        "addMessage": {
          mailboxIds: {
            [this.id]: true
          },
          blobId: blobId,
          keywords: JMAPEMail.getJMAPFlags(email),
          receivedAt: email.received?.toISOString(),
        },
      },
    }) as TJMAPChangeResponse;
    let error = createResponse["notCreated"] as any;
    if (error) {
      throw new Error("Upload of message to server failed: " + (error.addMessage?.description ?? "") + " " + (error.addMessage?.properties?.join(", ") ?? ""));
    }
    // TODO need to clone email into a new JMAPEMail, esp. when copying (not moving) from EWS to JMAP.
    email.pID = createResponse.created["addMessage"].id;
    email.folder = this;
    // this.messages.add(email); -- see above
    await this.listChangedMessages();
  }

  /** Uploads the email as individual properties and body parts to the JMAP server */
  async addMessageFromProperties(email: EMail) {
    email.folder = this;
    let createResponse = await this.account.makeSingleCall("Email/set", {
      accountId: this.account.accountID,
      create: {
        "addMessage": await JMAPEMail.getJMAPEmailObject(email, this.account),
      },
    }) as TJMAPChangeResponse;
    let error = createResponse["notCreated"] as any;
    if (error) {
      throw new Error("Upload of message to server failed: " + (error.addMessage?.description ?? "") + " " + (error.addMessage?.properties?.join(", ") ?? ""));
    }
    // need to clone email -- see above
    email.pID = createResponse.created["addMessage"].id;
    // this.messages.add(email); -- see above
    await this.listChangedMessages();
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
        [`mailboxIds/${targetFolderID}`]: true,
        [`mailboxIds/${sourceFolderID}`]: action == "copy" ? true : null,
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
    console.log("JMAP folder deleted", this.name, this.id);
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
      ? gt`You cannot delete this folder, because the server forbids it.`
      : null;
  }

  disableRename(): string | false {
    return super.disableRename() ??
      this.myRights.mayRename
      ? gt`You cannot rename this folder, because the server forbids it.`
      : null;
  }

  disableSubfolders(): string | false {
    return super.disableSubfolders() ??
      this.myRights.mayCreateChild
      ? gt`You cannot create subfolders of this folder, because the server forbids it.`
      : null;
  }

  newEMail(): JMAPEMail {
    return new JMAPEMail(this);
  }
}
