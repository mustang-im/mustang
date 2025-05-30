import { Folder, SpecialFolder } from "../Folder";
import { GraphEMail } from "./GraphEMail";
import { kMaxFetchCount, type GraphAccount } from "./GraphAccount";
import type { EMail } from "../EMail";
import type { EMailCollection } from "../Store/EMailCollection";
import { type TGraphFolder, type TGraphEMail, TGraphEMailHeaderProperties } from "./GraphTypes";
import { Semaphore } from "../../util/Semaphore";
import { Lock } from "../../util/Lock";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { NotImplemented, type URLString } from "../../util/util";
import { ArrayColl, Collection } from "svelte-collections";
import { gt } from "../../../l10n/l10n";

export class GraphFolder extends Folder {
  account: GraphAccount;
  readonly messages: EMailCollection<GraphEMail>;
  isSubscribed: boolean = true;
  sortOrder: number = Infinity;
  protected poller: ReturnType<typeof setInterval>;
  readonly deletions = new Set<string>();
  protected readonly syncLock = new Lock(); /** Protects syncState */

  constructor(account: GraphAccount) {
    super(account);
  }

  get path(): string {
    return `mailFolders/${this.id}`;
  }
  get deltaURL(): URLString {
    return this.syncState as URLString;
  }
  set deltaURL(url: URLString) {
    this.syncState = url;
  }

  fromGraph(json: TGraphFolder) {
    this.id = sanitize.nonemptystring(json.id);
    this.name = sanitize.nonemptystring(json.displayName);
    this.countTotal = sanitize.integer(json.totalItemCount);
    this.countUnread = sanitize.integer(json.unreadItemCount);
    this.isSubscribed = !sanitize.boolean(json.isHidden, false);
    this.setSpecialUse(json.wellKnownName);
  }

  /** Lists messages in this folder. Updates are efficient.
   * But doesn't download their contents. @see downloadMessages() */
  async listMessages(): Promise<ArrayColl<GraphEMail>> {
    await this.readFolder();
    return this.messages.isEmpty
      ? await this.listAllMessages()
      : await this.listChangedMessages();
  }

  /** Lists all messages in this folder.
   * But doesn't download their contents. @see downloadMessages() */
  protected async listAllMessages(): Promise<ArrayColl<GraphEMail>> {
    const batchSize = kMaxFetchCount;
    let nextURL: URLString;
    let hadNext = false;
    let allNewMessages = new ArrayColl<GraphEMail>();
    for (let i = 0; i < this.countTotal; ) {
      let newMessagesJSON: TGraphEMail[];
      if (hadNext && !nextURL) {
        break;
      } else if (nextURL) {
        hadNext = true;
        // nextURL already includes the $select. And ky searchParams would overwrite the skip token.
        newMessagesJSON = await this.account.graphGet<TGraphEMail>(nextURL);
      } else {
        newMessagesJSON = await this.account.graphGet<TGraphEMail>(`${this.path}/messages`, {
          top: batchSize,
          "$skip": i || undefined,
          "$select": TGraphEMailHeaderProperties.join(","),
        });
      }
      let extra = newMessagesJSON as any;
      nextURL = extra.nextURL;

      let { newMessages } = await this.parseMessageList(newMessagesJSON);
      this.messages.addAll(newMessages);
      await this.saveNewMsgs(newMessages);
      allNewMessages.addAll(newMessages);

      if (!newMessagesJSON.length) {
        break;
      }
      i += newMessagesJSON.length;
    }
    await this.storage.saveFolderProperties(this);
    return allNewMessages;
  }

  /** Lists all messages in this folder that are new or updated since the last fetch.
   * @returns new messages */
  protected async listChangedMessages(): Promise<ArrayColl<GraphEMail>> {
    if (!this.deltaURL) {
      return await this.listAllMessages();
    }
    let lock = await this.syncLock.lock();
    try {
      // <https://learn.microsoft.com/en-us/graph/delta-query-overview>
      // deltaURL already includes the $select. And ky searchParams would overwrite the skip token.
      let messagesJSON = await this.account.graphGetAll<TGraphEMail>(this.deltaURL);
      this.deltaURL = (messagesJSON as any).deltaURL;
      let { newMessages, missingMessagesJSON } = await this.processChangedMessages(messagesJSON);
      await this.storage.saveFolderProperties(this);

      if (missingMessagesJSON.hasItems) {
        console.log("Missing", missingMessagesJSON.length, "messages, found during sync. Starting all message fetch again");
         // TODO fetch only those messages
        await this.listAllMessages();
      }

      return newMessages;
    } finally {
      lock.release();
    }
  }

  /**
   * @returns new messages
   */
  protected async processChangedMessages(messagesJSON: TGraphEMail[]): Promise<{ newMessages: ArrayColl<GraphEMail>, missingMessagesJSON: ArrayColl<TGraphEMail> }> {
    let newMessages = new ArrayColl<GraphEMail>();
    let updatedMessages = new ArrayColl<GraphEMail>();
    let removedMessages = new ArrayColl<GraphEMail>();
    let missingMessagesJSON = new ArrayColl<TGraphEMail>();
    for (let messageJSON of messagesJSON) {
      let msg = this.getEMailByPID(messageJSON.id);
      if (messageJSON["@removed"]) {
        if (msg) {
          removedMessages.add(msg);
        }
        continue;
      }
      if (messageJSON.internetMessageId) { // new
        msg = this.newEMail();
        msg.fromGraph(messageJSON);
        newMessages.add(msg);
      } else { // changed
        if (!msg) {
          missingMessagesJSON.add(messageJSON);
        } else {
          msg.setFlagsLocal(messageJSON);
          updatedMessages.add(msg);
        }
      }
    }

    this.messages.addAll(newMessages);
    this.messages.removeAll(removedMessages);
    await this.saveNewMsgs(newMessages);
    await this.saveMsgUpdates(updatedMessages);
    for (let msg of removedMessages) {
      await msg.deleteMessageLocally();
    }

    return { newMessages, missingMessagesJSON };
  }

  protected parseMessageList(msgs: TGraphEMail[], checkUpdates = true): { newMessages: ArrayColl<GraphEMail>, updatedMessages: ArrayColl<GraphEMail> } {
    let newMessages = new ArrayColl<GraphEMail>();
    let updatedMessages = new ArrayColl<GraphEMail>();
    for (let json of msgs) {
      let pID = sanitize.nonemptystring(json.id);
      if (this.deletions.has(pID)) {
        continue;
      }
      let msg = checkUpdates && this.getEMailByPID(pID);
      if (msg) {
        msg.fromGraph(json);
        updatedMessages.add(msg);
      } else {
        msg = this.newEMail();
        msg.fromGraph(json);
        newMessages.add(msg);
      }
    }
    return { newMessages, updatedMessages };
  }

  protected parseMessageExtendedProperties(msgs: TGraphEMail[], checkUpdates = true) {
    for (let json of msgs) {
      let pID = sanitize.nonemptystring(json.id);
      if (this.deletions.has(pID)) {
        continue;
      }
      let msg = checkUpdates && this.getEMailByPID(pID);
      if (!msg) {
        continue;
      }
    }
  }

  /** Lists new messages, and downloads them */
  async getNewMessages(): Promise<ArrayColl<GraphEMail>> {
    let newMsgs = await this.listMessages();
    await this.downloadMessages(newMsgs);
    return newMsgs;
  }

  /** Lists all messages, and downloads them */
  async getAllMessages(): Promise<ArrayColl<GraphEMail>> {
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
  async downloadMessages(emails: Collection<GraphEMail>): Promise<Collection<GraphEMail>> {
    let needMsgs = new ArrayColl(emails);
    let downloadedMsgs = new ArrayColl<GraphEMail>();
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

  protected getEMailByPID(pID: string): GraphEMail {
    return this.messages.find((m: GraphEMail) => m.pID == pID) as GraphEMail;
  }

  protected async saveNewMsgs(msgs: Collection<GraphEMail>) {
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

  protected async saveMsgUpdates(msgs: Collection<GraphEMail>) {
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
    this.messages.add(email as GraphEMail);
  }

  async moveMessagesHere(messages: Collection<GraphEMail>) {
    if (await this.moveOrCopyMessages("move", messages)) {
      return;
    }
    return await this.moveOrCopyMessagesOnServer("move", messages);
  }

  async copyMessagesHere(messages: Collection<GraphEMail>) {
    if (await this.moveOrCopyMessages("copy", messages)) {
      return;
    }
    return await this.moveOrCopyMessagesOnServer("copy", messages);
  }

  async moveOrCopyMessagesOnServer(action: "move" | "copy", messages: Collection<GraphEMail>) {
    for (let msg of messages) {
      this.account.graphPost(msg.path + "/" + action, {
        destinationId: this.id,
      });
    }

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

  async moveFolderHere(folder: GraphFolder) {
    await super.moveFolderHere(folder);
    await this.account.graphPost(`${folder.path}/move`, {
      destinationId: this.id,
    });
    await this.account.listFolders();
  }

  async createSubFolder(name: string): Promise<GraphFolder> {
    let newFolder = await super.createSubFolder(name) as GraphFolder;
    let newFolderJSON = await this.account.graphPost(`${this.path}/childFolders`, {
      displayName: name,
    });
    newFolder.fromGraph(newFolderJSON);
    this.account.allFolders.set(newFolder.id, newFolder);
    console.log("Folder created", name);
    await newFolder.listMessages();
    return newFolder;
  }

  async rename(newName: string): Promise<void> {
    await super.rename(newName);
    await this.account.graphPatch(this.path, {
      displayName: newName,
    });
  }

  /** Warning: Also deletes all messages in the folder, also on the server */
  protected async deleteItOnServer(): Promise<void> {
    await this.account.graphDelete(this.path);
    console.log("Graph folder deleted", this.name, this.path);
  }

  async markAllRead(): Promise<void> {
    await super.markAllRead();
    throw new NotImplemented("Microsoft Graph does not support Mark All Read");
  }

  setSpecialUse(wellKnownName: string): void {
    switch (wellKnownName) {
      case "inbox":
        this.specialFolder = SpecialFolder.Inbox;
        break;
      case "deleteditems":
        this.specialFolder = SpecialFolder.Trash;
        break;
      case "junkemail":
        this.specialFolder = SpecialFolder.Spam;
        break;
      case "sent":
        this.specialFolder = SpecialFolder.Sent;
        break;
      case "outbox":
        this.specialFolder = SpecialFolder.Outbox;
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
    return super.disableDelete()
      ? gt(`You cannot delete this folder, because the server forbids it.`)
      : null;
  }

  disableRename(): string | false {
    return super.disableRename()
      ? gt(`You cannot rename this folder, because the server forbids it.`)
      : null;
  }

  disableSubfolders(): string | false {
    return super.disableSubfolders()
      ? gt(`You cannot create subfolders of this folder, because the server forbids it.`)
      : null;
  }

  newEMail(): GraphEMail {
    return new GraphEMail(this);
  }
}
