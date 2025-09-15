import { Folder, SpecialFolder } from "../Folder";
import type { EMail } from "../EMail";
import { OWAEMail } from "./OWAEMail";
import { type OWAAccount, kMaxFetchCount } from "./OWAAccount";
import { OWACreateItemRequest } from "./Request/OWACreateItemRequest";
import {
  owaCreateNewSubFolderRequest, owaDeleteFolderRequest,
  owaDownloadMsgsRequest, owaFindMsgsInFolderRequest,
  owaFolderCountsRequest, owaFolderMarkAllMsgsReadRequest,
  owaGetNewMsgHeadersRequest, owaMoveEntireFolderRequest,
  owaMoveOrCopyMsgsIntoFolderRequest, owaRenameFolderRequest,
  owaSetFolderPermissionsRequest, owaGetPermissionsRequest
} from "./Request/OWAFolderRequests";
import { ExchangePermission } from "../EWS/EWSFolder";
import { CreateMIME } from "../SMTP/CreateMIME";
import { base64ToArrayBuffer, blobToBase64 } from "../../util/util";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { ArrayColl, Collection } from "svelte-collections";
import { gt } from "../../../l10n/l10n";

export class OWAFolder extends Folder {
  account: OWAAccount;
  // Whether a folder scan or notification changed the counts
  dirty: boolean = false;

  newEMail(): OWAEMail {
    return new OWAEMail(this);
  }

  fromJSON(json: any) {
    if (this.countTotal != sanitize.integer(json.TotalCount) ||
        this.countUnread != sanitize.integer(json.UnreadCount)) {
      this.dirty = true;
    }
    this.id = sanitize.nonemptystring(json.FolderId.Id);
    this.name = sanitize.nonemptystring(json.DisplayName);
    this.countTotal = sanitize.integer(json.TotalCount);
    this.countUnread = sanitize.integer(json.UnreadCount);
    switch (json.DistinguishedFolderId) { // allowed to be null
    case "inbox":
      this.specialFolder = SpecialFolder.Inbox;
      break;
    case "drafts":
      this.specialFolder = SpecialFolder.Drafts;
      break;
    case "sentitems":
      this.specialFolder = SpecialFolder.Sent;
      break;
    case "junkemail":
      this.specialFolder = SpecialFolder.Spam;
      break;
    case "deleteditems":
      this.specialFolder = SpecialFolder.Trash;
      break;
    //case "outbox":
    }
  }

  /**
   * OWA doesn't do sync, so we only read the folder if the counts have changed,
   * either by a notification setting the `dirty` flag or by a manual check.
   */
  async folderCountsChanged() {
    if (this.dirty) {
      this.dirty = false;
      return true;
    }
    let result = await this.account.callOWA(owaFolderCountsRequest(this.id));
    let countTotal = sanitize.integer(result.Folders[0].TotalCount);
    let countUnread = sanitize.integer(result.Folders[0].UnreadCount);
    if (this.countTotal == countTotal && this.countUnread == countUnread) {
      // Nothing to do, hopefully.
      return false;
    }
    this.countTotal = countTotal;
    this.countUnread = countUnread;
    return true;
  }

  async listMessages(): Promise<Collection<OWAEMail>> {
    await this.readFolder();
    let lock = await this.listMessagesLock.lock();
    try {
      if (!await this.folderCountsChanged()) {
        // Avoid unnecessarily rereading the message list.
        return new ArrayColl<OWAEMail>();
      }

      let allMsgs = new ArrayColl<OWAEMail>();
      let newMsgs = new ArrayColl<OWAEMail>();
      let request = owaFindMsgsInFolderRequest(this.id, kMaxFetchCount);
      let result: any = { RootFolder: { IncludesLastItemInRange: false } };
      while (result?.RootFolder?.IncludesLastItemInRange === false) {
        result = await this.account.callOWA(request);
        if (!result?.RootFolder?.Items?.length) {
          // This folder is empty.
          break;
        }
        request.Body.Paging.Offset = sanitize.integer(result.RootFolder.IndexedPagingOffset);
        let messages = result.RootFolder.Items;
        let newMessageIDs: string[] = [];
        for (let message of messages) {
          let email = this.getEmailByItemID(sanitize.nonemptystring(message.ItemId.Id));
          if (email) {
            email.setFlags(message);
            await this.storage.saveMessageWritableProps(email);
            allMsgs.add(email);
          } else {
            newMessageIDs.push(message.ItemId.Id);
          }
        }
        let newMsgsInIteration = await this.getNewMessageHeaders(newMessageIDs);
        newMsgs.addAll(newMsgsInIteration);
      }

      for (let email of this.messages.subtract(allMsgs)) {
        await this.storage.deleteMessage(email);
      }
      allMsgs.addAll(newMsgs);
      this.messages.replaceAll(allMsgs);
      return newMsgs;
    } finally {
      lock.release();
    }
  }

  async getNewMessageHeaders(newMessageIDs: string[]): Promise<ArrayColl<OWAEMail>> {
    let newMsgs = new ArrayColl<OWAEMail>();
    if (newMessageIDs.length) {
      let results = await this.account.callOWA(owaGetNewMsgHeadersRequest(newMessageIDs));
      let items = results.ResponseMessages ? results.ResponseMessages.Items.map(item => item.Items[0]) : results.Items;
      for (let item of items) {
        try {
          let email = this.newEMail();
          email.fromJSON(item);
          await this.storage.saveMessage(email);
          newMsgs.add(email);
        } catch (ex) {
          this.account.errorCallback(ex);
        }
      }
    }
    return newMsgs;
  }

  async downloadMessages(emails: Collection<OWAEMail>): Promise<Collection<OWAEMail>> {
    let downloadedEmail = new ArrayColl<OWAEMail>();
    let emailsToDownload = emails.contents;
    for (let i = 0; i < emailsToDownload.length; i += kMaxFetchCount) {
      let batch = emailsToDownload.slice(i, i + kMaxFetchCount);
      let results = await this.account.callOWA(owaDownloadMsgsRequest(batch));
      let items = results.ResponseMessages ? results.ResponseMessages.Items.map(item => item.Items[0]) : results.Items;
      for (let item of items) {
        let email = emailsToDownload.find(email => email.itemID == item.ItemId.Id);
        if (email && !email.downloadComplete) {
          try {
            let mimeBase64 = sanitize.nonemptystring(item.MimeContent.Value);
            email.mime = new Uint8Array(await base64ToArrayBuffer(mimeBase64, "message/rfc822"));
            await email.parseMIME();
            await email.saveCompleteMessage();
            downloadedEmail.add(email);
          } catch (ex) {
            this.account.errorCallback(ex);
          }
        }
      }
    }

    /*for (let email of this.messages) {
      if (!email.threadID && email.dbID) {
        await email.findThread(this.messages);
      }
    }*/

    return downloadedEmail;
  }

  /** Lists only the new messages, and downloads them.
   *
   * Should be implemented as fast as possible (a few seconds),
   * so that the action can be repeated routinely every few minutes.
   * @returns the new messages */
  async getNewMessages(): Promise<Collection<OWAEMail>> {
    let newMsgs = await this.listMessages(); // TODO get only the msgs from the last 4 weeks
    await this.downloadMessages(newMsgs);
    return newMsgs;
  }

  getEmailByItemID(id: string): OWAEMail | undefined {
    if (!id) {
      return undefined;
    }
    return this.messages.find((m: OWAEMail) => m.itemID == id) as OWAEMail | undefined;
  }

  async moveMessagesHere(messages: Collection<EMail>) {
    if (await this.moveOrCopyMessages("move", messages)) {
      return;
    }
    await this.moveOrCopyMessagesOnServer("Move", messages as Collection<OWAEMail>);
  }

  async copyMessagesHere(messages: Collection<EMail>) {
    if (await this.moveOrCopyMessages("copy", messages)) {
      return;
    }
    await this.moveOrCopyMessagesOnServer("Copy", messages as Collection<OWAEMail>);
  }

  async moveOrCopyMessagesOnServer(action: "Move" | "Copy", messages: Collection<OWAEMail>) {
    await this.account.callOWA(owaMoveOrCopyMsgsIntoFolderRequest(action, this.id, messages.contents));
  }

  async addMessage(message: EMail) {
    message.mime ??= await CreateMIME.getMIME(message);
    let request = new OWACreateItemRequest({ SavedItemFolderId: { __type: "TargetFolderId:#Exchange", BaseFolderId: { __type: "FolderId:#Exchange", Id: this.id } }, MessageDisposition: "SaveOnly" });
    request.addField("Message", "MimeContent", { CharacterSet: "UTF-8", Value: await blobToBase64(new Blob([message.mime])) });
    if (message.tags.hasItems) {
      request.addField("Message", "Categories", message.tags.contents.map(tag => tag.name));
    }
    if (!message.isDraft) {
      request.addField("Message", "ExtendedProperty", [{ ExtendedFieldURI: { PropertyTag: "0x0E07", PropertyType: "Integer" }, Value: "0" }]);
    }
    if (message.isStarred) {
      request.addField("Message", "Flag", {
        __type: "FlagType:#Exchange",
        CompleteDate: null,
        DueDate: null,
        StartDate: null,
        FlagStatus: "Flagged",
      });
    }
    request.addField("Message", "IsRead", message.isRead);
    await this.account.callOWA(request);
  }

  async moveFolderHere(folder: OWAFolder) {
    await super.moveFolderHere(folder);
    await this.account.callOWA(owaMoveEntireFolderRequest(folder.id, this.id));
  }

  async createSubFolder(name: string): Promise<OWAFolder> {
    let folder = await super.createSubFolder(name) as OWAFolder;
    let result = await this.account.callOWA(owaCreateNewSubFolderRequest(name, this.id));
    folder.id = sanitize.nonemptystring(result.Folders[0].FolderId.Id);
    this.account.folderMap.set(folder.id, folder);
    return folder;
  }

  async rename(name: string) {
    await super.rename(name);
    await this.account.callOWA(owaRenameFolderRequest(name, this.id));
  }

  protected async deleteItOnServer() {
    await this.account.callOWA(owaDeleteFolderRequest(this.id));
  }

  async markAllRead() {
    await super.markAllRead();
    await this.account.callOWA(owaFolderMarkAllMsgsReadRequest(this.id));
  }

  disableChangeSpecial(): string | false {
    return gt`You cannot change special folders on the Exchange server`;
  }

  async getPermissions(): Promise<ArrayColl<ExchangePermission>> {
    let result = await this.account.callOWA(owaGetPermissionsRequest(this.id));
    return new ArrayColl(result.Folders[0].PermissionSet.Permissions.map(permission => ExchangePermission.fromExchange(permission, this.account.emailAddress)));
  }

  async setPermissions(permissions: ArrayColl<ExchangePermission>) {
    await this.account.callOWA(owaSetFolderPermissionsRequest(this.id, permissions.contents));
  }
}
