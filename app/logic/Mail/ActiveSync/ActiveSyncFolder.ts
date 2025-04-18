import { Folder, SpecialFolder } from "../Folder";
import { ActiveSyncEMail } from "./ActiveSyncEMail";
import type { ActiveSyncAccount, ActiveSyncPingable } from "./ActiveSyncAccount";
import { ActiveSyncError } from "./ActiveSyncError";
import { CreateMIME } from "../SMTP/CreateMIME";
import type { EMailCollection } from "../Store/EMailCollection";
import { ensureArray, assert, NotImplemented, NotSupported } from "../../util/util";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { ArrayColl, type Collection } from "svelte-collections";
import { gt } from "../../../l10n/l10n";

export const kMaxCount = 50;

export enum FolderType {
  OtherSpecialFolder = "1",
  Inbox = "2",
  Drafts = "3",
  Trash = "4",
  Sent = "5",
  Outbox = "6",
  Tasks = "7",
  Calendar = "8",
  Contacts = "9",
  Notes = "10",
  Journal = "11",
  UserFolder = "12",
  UserCalendar = "13",
  UserContacts = "14",
  UserTasks = "15",
}

export class ActiveSyncFolder extends Folder implements ActiveSyncPingable {
  account: ActiveSyncAccount;
  messages: EMailCollection<ActiveSyncEMail>;
  readonly folderClass = "Email";

  get serverID() {
    return this.id;
  }

  async ping() {
    await this.listMessages();
  }

  newEMail(): ActiveSyncEMail {
    return new ActiveSyncEMail(this);
  }

  // These three functions are used to handle ActiveSync folder move updates;
  // now we support that for EWS and OWA, maybe they belong in Folder.ts?
  get parentFolderList() {
    return this.parent?.subFolders || this.account.rootFolders;
  }

  addToParent() {
    if (!this.parentFolderList.contains(this)) {
      this.parentFolderList.add(this);
    }
  }

  removeFromParent() {
    this.parentFolderList.remove(this);
  }

  fromWBXML(wbxmljs: any) {
    this.id = sanitize.nonemptystring(wbxmljs.ServerId);
    this.name = sanitize.nonemptystring(wbxmljs.DisplayName);
    switch (wbxmljs.Type) {
    case FolderType.Inbox:
      this.specialFolder = SpecialFolder.Inbox;
      break;
    case FolderType.Drafts:
      this.specialFolder = SpecialFolder.Drafts;
      break;
    case FolderType.Trash:
      this.specialFolder = SpecialFolder.Trash;
      break;
    case FolderType.Sent:
      this.specialFolder = SpecialFolder.Sent;
      break;
    //case FolderType.Outbox:
    //no FolderType.Spam:
    }
  }

  /**
   * Makes a `Sync` (synchronization) request to the server.
   * @param data information about the request
   * @param responseFunc
   * - It performs actions using the parameter `response.Collections.Collection`.
   * - It is called when the response is not null.
   * - It will be repeatedly called while `response.Collections.Collection.MoreAvailable` is
   * equal to an empty string.
   * - It may be called many times.
   */
  async makeSyncRequest(data?: any, responseFunc?: (response: any) => Promise<void>): Promise<any> {
    if (!this.syncState && !this.listMessagesLock.haveWaiting && data != undefined) {
      // First request must be an empty request
      await this.makeSyncRequest();
    }

    let lock = await this.listMessagesLock.lock();
    try {
      let response;
      do {
        let request = {
          Collections: {
            Collection: Object.assign({
              SyncKey: this.syncState || "0",
              CollectionId: this.id,
            }, data),
          },
        };
        response = await this.account.callEAS("Sync", request, { allowV16: true });
        if (!response) {
          return null;
        }
        if (response.Collections.Collection.Status == "3") {
          // Out of sync.
          this.syncState = null;
          await this.storage.saveFolder(this);
        }
        if (response.Collections.Collection.Status != "1") {
          throw new ActiveSyncError("Sync", response.Collections.Collection.Status, this.account);
        }
        await responseFunc?.(response.Collections.Collection);
        this.syncState = sanitize.string(response.Collections.Collection.SyncKey, null);
        await this.storage.saveFolder(this);
      } while (responseFunc && response.Collections.Collection.MoreAvailable == "");
      return response.Collections.Collection;
    } finally {
      lock.release();
    }
  }

  async listMessages(): Promise<Collection<ActiveSyncEMail>> {
    await this.readFolder();
    let newMsgs = new ArrayColl<ActiveSyncEMail>();
    let data = {
      WindowSize: String(kMaxCount),
      Options: {
        MIMESupport: "2",
        BodyPreference: {
          Type: "4",
          TruncationSize: "0",
        },
      },
    };
    await this.makeSyncRequest(data, async response => {
      for (let item of ensureArray(response.Commands?.Add).concat(ensureArray(response.Commands?.Change))) {
        try {
          let email = this.getEmailByServerID(item.ServerId);
          if (email) {
            email.setFlags(item.ApplicationData);
            await this.storage.saveMessageWritableProps(email);
          } else {
            email = this.newEMail();
            email.serverID = item.ServerId;
            email.fromWBXML(item.ApplicationData);
            await this.storage.saveMessage(email);
            newMsgs.add(email);
          }
        } catch (ex) {
          this.account.errorCallback(ex);
        }
      }
      for (let item of ensureArray(response.Commands?.Delete)) {
        try {
          let email = this.getEmailByServerID(item.ServerId);
          if (email) {
            await email.deleteMessageLocally();
          }
        } catch (ex) {
          this.account.errorCallback(ex);
        }
      }
    });
    this.messages.addAll(newMsgs);
    this.account.addPingable(this);
    return newMsgs;
  }

  async downloadMessages(emails: Collection<ActiveSyncEMail>): Promise<Collection<ActiveSyncEMail>> {
    let downloadedEmail = new ArrayColl<ActiveSyncEMail>();
    let emailsToDownload = emails.contents;
    for (let i = 0; i < emailsToDownload.length; i += kMaxCount) {
      let batch = emailsToDownload.slice(i, i + kMaxCount);
      let request = {
        Fetch: batch.map(email => ({
          Store: "Mailbox",
          ServerId: email.serverID,
          CollectionId: this.id,
          Options: {
            MIMESupport: "2",
            BodyPreference: {
              Type: "4",
            },
          },
        })),
      };
      let results = await this.account.callEAS("ItemOperations", request);
      for (let result of ensureArray(results.Response.Fetch)) try {
        if (result.Status != "1") {
          throw new ActiveSyncError("ItemOperations", result.Status, this.account);
        }
        let email = emailsToDownload.find(email => email.serverID == result.ServerID);
        if (email && !email.downloadComplete) {
          email.mime = result.Properties.Body.RawData;
          await email.parseMIME();
          await email.saveCompleteMessage();
          downloadedEmail.add(email);
        }
      } catch (ex) {
        this.account.errorCallback(ex);
      }
    }
    return downloadedEmail;
  }

  async getNewMessages(): Promise<Collection<ActiveSyncEMail>> {
    let newMsgs = await this.listMessages();
    await this.downloadMessages(newMsgs);
    return newMsgs;
  }

  getEmailByServerID(id: string): ActiveSyncEMail | undefined {
    if (!id) {
      return undefined;
    }
    return this.messages.find(m => m.serverID == id);
  }

  async moveMessagesHere(messages: Collection<ActiveSyncEMail>) {
    if (await this.moveOrCopyMessages("move", messages)) {
      return;
    }
    let request = {
      Move: messages.contents.map(msg => ({
        SrcMsgId: msg.serverID,
        SrcFldId: msg.folder.id,
        DstFldId: this.id,
      })),
    };
    let result = await this.account.callEAS("MoveItems", request);
    // Just reporting to the console for now.
    for (let response of ensureArray(result.Response)) {
      // "3" is success for a Move operation... go figure.
      if (response.Status != "3") {
        console.error(`ActiveSync MoveItems status ${response.Status}`);
      }
    }
  }

  async copyMessagesHere(messages: Collection<ActiveSyncEMail>) {
    throw new NotSupported(gt`ActiveSync does not permit messages to be copied`);
  }

  async addMessage(message: ActiveSyncEMail) {
    message.mime ??= await CreateMIME.getMIME(message);
    if (!message.isDraft || this.specialFolder != SpecialFolder.Drafts) {
      throw new NotSupported(gt`ActiveSync does not permit messages to be copied`);
    }
    if (this.account.protocolVersion != "16.1") {
      throw new NotSupported(gt`Drafts are not supported by ActiveSync ${this.account.protocolVersion}`);
    }
    let data = {
      GetChanges: "0",
      Commands: {
        Add: {
          ClientId: await this.account.nextClientID(),
          ApplicationData: {
            Body: {
              Type: "4",
              Data: message.mime,
            },
          },
        },
      },
    };
    let response = await this.makeSyncRequest(data);
    if (response.Responses.Add.Status != "1") {
      throw new ActiveSyncError("Sync", response.Responses.Add.Status, this.account);
    }
    let email = this.newEMail();
    // email.copyFrom didn't work
    email.mime = message.mime;
    await email.parseMIME();
    email.serverID = response.Responses.Add.ServerId;
    email.sent = email.received = new Date();
    email.isRead = true;
    await email.saveCompleteMessage();
    await this.readFolder();
    this.messages.add(email);
  }

  async moveFolderHere(folder: ActiveSyncFolder) {
    await super.moveFolderHere(folder);
    let request = {
      ServerId: this.id,
      ParentId: folder.id,
      DisplayName: this.name,
    };
    await this.account.queuedRequest("FolderUpdate", request);
    // We're required to sync which should be a no-op at this point.
    await this.account.listFolders();
  }

  async createSubFolder(name: string): Promise<ActiveSyncFolder> {
    let folder = await super.createSubFolder(name) as ActiveSyncFolder;
    let request = {
      ParentId: this.id,
      DisplayName: name,
      Type: "1",
    };
    let result = await this.account.queuedRequest("FolderCreate", request);
    folder.id = sanitize.nonemptystring(result.ServerId);
    // We're required to sync the folder hierarchy after creating a folder.
    // This performs the folder creation steps for us.
    await this.account.listFolders();
    return folder;
  }

  async rename(name: string) {
    await super.rename(name);
    let request = {
      ServerId: this.id,
      ParentId: this.parent?.id || "0",
      DisplayName: name,
    };
    await this.account.queuedRequest("FolderUpdate", request);
    // We're required to sync which should be a no-op at this point.
    await this.account.listFolders();
  }

  async deleteIt() {
    await this.storage.deleteFolder(this);
    this.removeFromParent();
    let request = {
      ServerId: this.id,
    };
    await this.account.queuedRequest("FolderDelete", request);
    // We're required to sync which should be a no-op at this point.
    await this.account.listFolders();
  }

  async markAllRead() {
    throw new NotImplemented();
  }

  disableChangeSpecial(): string | false {
    return "You cannot change Exchange special folders.";
  }
}
