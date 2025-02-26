import { Folder, SpecialFolder } from "../Folder";
import type { EMail } from "../EMail";
import { OWAEMail } from "./OWAEMail";
import type { OWAAccount } from "./OWAAccount";
import OWACreateItemRequest from "./Request/OWACreateItemRequest";
import { base64ToArrayBuffer, blobToBase64, assert } from "../../util/util";
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

  async folderCountsChanged() {
    if (this.dirty) {
      this.dirty = false;
      return true;
    }
    let request = {
      __type: "GetFolderJsonRequest:#Exchange",
      Header: {
        __type: "JsonRequestHeaders:#Exchange",
        RequestServerVersion: "Exchange2013",
      },
      Body: {
        __type: "GetFolderRequest:#Exchange",
        FolderShape: {
          __type: "FolderResponseShape:#Exchange",
          BaseShape: "IdOnly",
          AdditionalProperties: [{
            __type: "PropertyUri:#Exchange",
            FieldURI: "folder:UnreadCount",
          }, {
            __type: "PropertyUri:#Exchange",
            FieldURI: "folder:TotalCount",
          }],
        },
        FolderIds: [{
          __type: "FolderId:#Exchange",
          Id: this.id,
        }],
      },
    };
    let result = await this.account.callOWA(request);
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
      let request = {
        __type: "FindItemJsonRequest:#Exchange",
        Header: {
          __type: "JsonRequestHeaders:#Exchange",
          RequestServerVersion: "Exchange2013",
        },
        Body: {
          __type: "FindItemRequest:#Exchange",
          ItemShape: {
            __type: "ItemResponseShape:#Exchange",
            BaseShape: "IdOnly",
            AdditionalProperties: [{
              __type: "PropertyUri:#Exchange",
              FieldURI: "message:IsRead",
            }, {
              __type: "PropertyUri:#Exchange",
              FieldURI: "item:IsDraft",
            }, {
              __type: "PropertyUri:#Exchange",
              FieldURI: "item:Categories",
            }, {
              __type: "PropertyUri:#Exchange",
              FieldURI: "item:Flag",
              /*}, {
                __type: "PropertyUri:#Exchange",
                ExtendedFieldURI: {
                  PropertyTag: "0x1080",
                  PropertyType: "Integer",
                },*/
            }],
          },
          ParentFolderIds: [{
            __type: "FolderId:#Exchange",
            Id: this.id,
          }],
          Traversal: "Shallow",
          Paging: {
            __type: "IndexedPageView:#Exchange",
            BasePoint: "Beginning",
            Offset: 0,
            MaxEntriesReturned: kMaxFetchCount,
          },
        },
      };
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
      let request = {
        __type: "GetItemJsonRequest:#Exchange",
        Header: {
          __type: "JsonRequestHeaders:#Exchange",
          RequestServerVersion: "Exchange2013",
        },
        Body: {
          __type: "GetItemRequest:#Exchange",
          ItemShape: {
            __type: "ItemResponseShape:#Exchange",
            BaseShape: "IdOnly",
            AdditionalProperties: [{
              __type: "PropertyUri:#Exchange",
              FieldURI: "message:InternetMessageId",
            }, {
              __type: "PropertyUri:#Exchange",
              FieldURI: "message:IsRead",
            }, {
              __type: "PropertyUri:#Exchange",
              FieldURI: "message:References",
            }, {
              __type: "PropertyUri:#Exchange",
              FieldURI: "message:ReplyTo",
            }, {
              __type: "PropertyUri:#Exchange",
              FieldURI: "message:From",
            }, {
              __type: "PropertyUri:#Exchange",
              FieldURI: "message:Sender",
            }, {
              __type: "PropertyUri:#Exchange",
              FieldURI: "message:ToRecipients",
            }, {
              __type: "PropertyUri:#Exchange",
              FieldURI: "message:CcRecipients",
            }, {
              __type: "PropertyUri:#Exchange",
              FieldURI: "message:BccRecipients",
            }, {
              __type: "PropertyUri:#Exchange",
              FieldURI: "item:ItemClass",
            /* Non-MIME @see OWAEMail.bodyAndAttachmentsFromJson()
            }, {
              __type: "PropertyUri:#Exchange",
              FieldURI: "item:Attachments",
            */
            }, {
              __type: "PropertyUri:#Exchange",
              FieldURI: "item:Subject",
            }, {
              __type: "PropertyUri:#Exchange",
              FieldURI: "item:DateTimeReceived",
            }, {
              __type: "PropertyUri:#Exchange",
              FieldURI: "item:InReplyTo",
            }, {
              __type: "PropertyUri:#Exchange",
              FieldURI: "item:IsDraft",
            }, {
              __type: "PropertyUri:#Exchange",
              FieldURI: "item:DateTimeSent",
            /* Non-MIME
            }, {
              __type: "PropertyUri:#Exchange",
              FieldURI: "item:Body",
            */
            }, {
              __type: "PropertyUri:#Exchange",
              FieldURI: "item:Categories",
            }, {
              __type: "PropertyUri:#Exchange",
              FieldURI: "item:Flag",
            /* Non-MIME
            }, {
              __type: "PropertyUri:#Exchange",
              FieldURI: "item:TextBody",
            */
            /*}, {
              __type: "PropertyUri:#Exchange",
              ExtendedFieldURI: {
                PropertyTag: "0x1080",
                PropertyType: "Integer",
              },*/
            }],
          },
          ItemIds: newMessageIDs.map(id => ({
            __type: "ItemId:#Exchange",
            Id: id,
          })),
        },
      };
      let results = await this.account.callOWA(request);
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
      let request = {
        __type: "GetItemJsonRequest:#Exchange",
        Header: {
          __type: "JsonRequestHeaders:#Exchange",
          RequestServerVersion: "Exchange2013",
        },
        Body: {
          __type: "GetItemRequest:#Exchange",
          ItemShape: {
            __type: "ItemResponseShape:#Exchange",
            BaseShape: "IdOnly",
            AdditionalProperties: [{ // Work around Office365 bug
              __type: "PropertyUri:#Exchange",
              FieldURI: "item:Size"
            }],
            IncludeMimeContent: true,
          },
          ItemIds: batch.map(message => ({
            __type: "ItemId:#Exchange",
            Id: message.itemID,
          })),
        },
      };
      let results = await this.account.callOWA(request);
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
    let request = {
      __type: action + "ItemJsonRequest:#Exchange",
      Header: {
        __type: "JsonRequestHeaders:#Exchange",
        RequestServerVersion: "Exchange2013",
      },
      Body: {
        __type: action + "ItemRequest:#Exchange",
        ItemIds: messages.contents.map(message => ({
          __type: "ItemId:#Exchange",
          Id: message.itemID,
        })),
        ToFolderId: {
          __type: "TargetFolderId:#Exchange",
          BaseFolderId: {
            __type: "FolderId:#Exchange",
            Id: this.id,
          },
        },
        // ReturnNewItemIds: false,
      },
    };
    await this.account.callOWA(request);
  }

  async addMessage(message: EMail) {
    assert(message.mime, "Call loadMIME() first");
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
    let request = {
      __type: "MoveFolderJsonRequest:#Exchange",
      Header: {
        __type: "JsonRequestHeaders:#Exchange",
        RequestServerVersion: "Exchange2013",
      },
      Body: {
        __type: "MoveFolderRequest:#Exchange",
        FolderIds: [{
          FolderId: {
            __type: "FolderId:#Exchange",
            Id: folder.id,
          },
        }],
        ToFolderId: {
          __type: "TargetFolderId:#Exchange",
          FolderId: {
            __type: "FolderId:#Exchange",
            Id: this.id,
          },
        },
      },
    };
    await this.account.callOWA(request);
  }

  async createSubFolder(name: string): Promise<OWAFolder> {
    let folder = await super.createSubFolder(name) as OWAFolder;
    let request = {
      __type: "CreateFolderJsonRequest:#Exchange",
      Header: {
        __type: "JsonRequestHeaders:#Exchange",
        RequestServerVersion: "Exchange2013",
      },
      Body: {
        __type: "CreateFolderRequest:#Exchange",
        ParentFolderId: {
          __type: "TargetFolderId:#Exchange",
          BaseFolderId: {
            __type: "FolderId:#Exchange",
            Id: this.id,
          },
        },
        Folders: [{
          __type: "Folder:#Exchange",
          FolderClass: "IPF.Note",
          DisplayName: name,
        }],
      },
    };
    let result = await this.account.callOWA(request);
    folder.id = sanitize.nonemptystring(result.Folders[0].FolderId.Id);
    this.account.folderMap.set(folder.id, folder);
    return folder;
  }

  async rename(name: string) {
    await super.rename(name);
    let request = {
      __type: "UpdateFolderJsonRequest:#Exchange",
      Header: {
        __type: "JsonRequestHeaders:#Exchange",
        RequestServerVersion: "Exchange2013",
      },
      Body: {
        __type: "UpdateFolderRequest:#Exchange",
        FolderChanges: [{
          __type: "FolderChange:#Exchange",
          FolderId: {
            __type: "FolderId:#Exchange",
            Id: this.id,
          },
          Updates: [{
            __type: "SetFolderField:#Exchange",
            Folder: {
              __type: "Folder:#Exchange",
              DisplayName: name,
            },
            Path: {
              __type: "PropertyUri:#Exchange",
              FieldURI: "FolderDisplayName",
            },
          }],
        }],
      },
    };
    await this.account.callOWA(request);
  }

  protected async deleteItOnServer() {
    let request = {
      __type: "DeleteFolderJsonRequest:#Exchange",
      Header: {
        __type: "JsonRequestHeaders:#Exchange",
        RequestServerVersion: "Exchange2013",
      },
      Body: {
        __type: "DeleteFolderRequest:#Exchange",
        FolderIds: [{
          __type: "FolderId:#Exchange",
          Id: this.id,
        }],
        DeleteType: "SoftDelete",
      },
    };
    await this.account.callOWA(request);
  }

  async markAllRead() {
    await super.markAllRead();
    let request = {
      __type: "MarkAllItemsAsReadJsonRequest:#Exchange",
      Header: {
        __type: "JsonRequestHeaders:#Exchange",
        RequestServerVersion: "Exchange2013",
      },
      Body: {
        __type: "MarkAllItemsAsReadRequest:#Exchange",
        ReadFlag: true,
        SuppressReadReceipts: true,
        FolderIds: [{
          __type: "FolderId:#Exchange",
          Id: this.id,
        }],
        ItemIdsToExclude: [],
      },
    };
    await this.account.callOWA(request);
  }

  disableChangeSpecial(): string | false {
    return gt`You cannot change special folders on the Exchange server`;
  }
}


export const kMaxFetchCount = 50;
