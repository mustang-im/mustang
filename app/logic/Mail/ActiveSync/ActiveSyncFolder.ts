import { Folder, SpecialFolder } from "../Folder";
import { ActiveSyncEMail } from "./ActiveSyncEMail";
import { type ActiveSyncAccount, type ActiveSyncPingable, EASError } from "./ActiveSyncAccount";
import type { EMailCollection } from "../SQL/EMailCollection";
import { assert, NotImplemented, NotSupported } from "../../util/util";
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
  syncKeyBusy: Promise<any> | null;
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
   * Queues `Sync` requests locally and waits until the 
   * server is available.
   * Sync requests for a given folder must be serialised,
   * because they all use the same per-folder sync key.
   * @param data information about the request
   * @param responseFunc callback for processing the response
   */
  async queuedSyncRequest(data: any, responseFunc?: (response: any) => Promise<void>): Promise<any> {
    if (!this.syncState && !this.syncKeyBusy) try {
      // First request must be an empty request.
      this.syncKeyBusy = this.makeSyncRequest();
      await this.syncKeyBusy;
    } finally {
      this.syncKeyBusy = null;
    }
    while (this.syncKeyBusy) try {
      await this.syncKeyBusy;
    } catch (ex) {
      // If the function currently holding the sync key throws, we don't care.
    }
    try {
      this.syncKeyBusy = this.makeSyncRequest(data, responseFunc);
      return await this.syncKeyBusy;
    } finally {
      this.syncKeyBusy = null;
    }
  }

  /**
   * Makes a `Sync` request to the server. It is called by
   * `queuedSyncRequest()` and it may be called multiple times.
   * @param data information about the request
   * @param responseFunc callback function for processing the response
   */
  protected async makeSyncRequest(data?: any, responseFunc?: (response: any) => Promise<void>): Promise<any> {
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
      response = await this.account.callEAS("Sync", request);
      if (!response) {
        return null;
      }
      if (response.Collections.Collection.Status == "3") {
        // Out of sync.
        this.syncState = null;
        await this.storage.saveFolder(this);
      }
      if (response.Collections.Collection.Status != "1") {
        throw new EASError("Sync", response.Collections.Collection.Status);
      }
      responseFunc?.(response.Collections.Collection);
      this.syncState = response.Collections.Collection.SyncKey;
      await this.storage.saveFolder(this);
    } while (responseFunc && response.Collections.Collection.MoreAvailable == "");
    return response.Collections.Collection;
  }

  async listMessages(): Promise<ArrayColl<ActiveSyncEMail>> {
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
    await this.queuedSyncRequest(data, async response => {
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
          throw new EASError("ItemOperations", result.Status);
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

  async getNewMessages(): Promise<ArrayColl<ActiveSyncEMail>> {
    let newMsgs = await this.listMessages();
    await this.downloadMessages(newMsgs);
    return newMsgs;
  }

  async addMessage(email: ActiveSyncEMail) {
    throw new NotSupported("Drafts are not supported by ActiveSync 14.1");
    // ActiveSync 16 apparently does let you create drafts.
  }

  getEmailByServerID(id: string): ActiveSyncEMail | undefined {
    if (!id) {
      return undefined;
    }
    return this.messages.find(m => m.serverID == id);
  }

  async moveMessagesHere(messages: Collection<ActiveSyncEMail>) {
    assert(messages.contents.every(message => message.folder.account == this.account), "Cannot move messages between accounts");
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

  async moveFolderHere(folder: ActiveSyncFolder) {
    assert(folder.account == this.account, "Cannot move folders between accounts");
    let request = {
      ServerId: this.id,
      ParentId: folder.id,
      DisplayName: this.name,
    };
    await this.account.queuedRequest("FolderUpdate", request);
    await super.moveFolderHere(folder);
    // We're required to sync which should be a no-op at this point.
    await this.account.listFolders();
  }

  async createSubFolder(name: string): Promise<ActiveSyncFolder> {
    let request = {
      ParentId: this.id,
      DisplayName: name,
      Type: "1",
    };
    let result = await this.account.queuedRequest("FolderCreate", request);
    // We're required to sync the folder hierarchy after creating a folder.
    // This would normally perform the folder creation steps for us,
    // but unfortunately the API wants us to return the new folder,
    // even though nobody ever uses it, so we have to jump through hoops.
    let folder = await super.createSubFolder(name) as ActiveSyncFolder;
    folder.id = sanitize.nonemptystring(result.ServerId);
    await this.account.listFolders();
    return folder;
  }

  async rename(name: string) {
    let request = {
      ServerId: this.id,
      ParentId: this.parent?.id || "0",
      DisplayName: name,
    };
    await this.account.queuedRequest("FolderUpdate", request);
    await super.rename(name);
    // We're required to sync which should be a no-op at this point.
    await this.account.listFolders();
  }

  async deleteIt() {
    let request = {
      ServerId: this.id,
    };
    await this.account.queuedRequest("FolderDelete", request);
    await this.storage.deleteFolder(this);
    this.removeFromParent();
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

export function ensureArray<Type>(val: Type[] | Type): Type[] {
  return val ? Array.isArray(val) ? val : [val] : [];
}
