import { Folder, SpecialFolder } from "../Folder";
import { EWSEMail, ensureArray } from "./EWSEMail";
import type { EWSAccount } from "./EWSAccount";
import { SQLFolder } from "../SQL/SQLFolder";
import { SQLEMail } from "../SQL/SQLEMail";
import { base64ToArrayBuffer, assert } from "../../util/util";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { ArrayColl, Collection } from "svelte-collections";

export const kMaxCount = 50;

export class EWSFolder extends Folder {
  account: EWSAccount;

  newEMail(): EWSEMail {
    return new EWSEMail(this);
  }

  fromXML(xmljs: any) {
    this.id = sanitize.nonemptystring(xmljs.FolderId.Id);
    this.name = sanitize.nonemptystring(xmljs.DisplayName);
    this.countTotal = sanitize.integer(xmljs.TotalCount);
    this.countUnread = sanitize.integer(xmljs.UnreadCount);
    switch (xmljs.DistinguishedFolderId) { // allowed to be null
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

  async listMessages() {
    if (!this.dbID) {
      await SQLFolder.save(this);
    }
    await SQLEMail.readAll(this);

    this.updateChangedMessages();
  }

  /** Uses the sync state to get just the messages that changed since last time.
   * Assumes previously known messages have already been loaded from the DB.
   * @returns the new messages (not yet downloaded) */
  async updateChangedMessages(): Promise<ArrayColl<EWSEMail>> {
    let newMsgs = new ArrayColl<EWSEMail>();
    let sync = {
      m$SyncFolderItems: {
        m$ItemShape: {
          t$BaseShape: "IdOnly",
          t$AdditionalProperties: {
            t$FieldURI: [{
              FieldURI: "message:IsRead",
            }, {
              FieldURI: "item:IsDraft",
            }, {
              FieldURI: "item:Flag",
            }],
            t$ExtendedFieldURI: {
              PropertyTag: "0x1080",
              PropertyType: "Integer",
            },
          },
        },
        m$SyncFolderId: {
          t$FolderId: {
            Id: this.id,
          },
        },
        m$SyncState: this.syncState,
        m$MaxChangesReturned: kMaxCount,
      }
    };
    let result: any = { IncludesLastItemInRange: "false" };
    while (result.IncludesLastItemInRange === "false") {
      try {
        result = await this.account.callEWS(sync);
      } catch (ex) {
        if (ex.error?.ResponseCode == 'ErrorInvalidSyncStateData') {
          this.syncState = null;
          await SQLFolder.save(this);
          sync.m$SyncFolderItems.m$SyncState = null;
          result = await this.account.callEWS(sync);
        } else {
          throw ex;
        }
      }
      let newMessageIDs = (await Promise.all([
        this.forEachSyncChange(result.Changes.ReadFlagChange, this.processSyncReadFlagChange, true),
        this.forEachSyncChange(result.Changes.Update, this.processSyncUpdate, false),
        this.forEachSyncChange(result.Changes.Create, this.processSyncUpdate, false),
      ])).flat();
      await this.getNewMessageHeaders(newMessageIDs, newMsgs);
      await this.forEachSyncChange(result.Changes.Delete, this.processSyncDelete, true);
      this.syncState = sync.m$SyncFolderItems.m$SyncState = sanitize.nonemptystring(result.SyncState);
      await SQLFolder.save(this);
    }
    this.messages.addAll(newMsgs);
    return newMsgs;
  }

  protected async forEachSyncChange(changes: any[], eachCallback, isDirectList: boolean): Promise<any[]> {
    let newEMails: any[] = [];
    for (let change of ensureArray(changes)) {
      if (!isDirectList) {
        change = getEWSItem(change);
      }
      let email = this.getEmailByItemID(sanitize.nonemptystring(change.ItemId.Id));
      if (email) {
        await eachCallback.call(this, email, change);
      } else {
        newEMails.push(change.ItemId);
      }
    }
    return newEMails;
  }

  protected async processSyncReadFlagChange(email: EWSEMail, change: any) {
    email.isRead = sanitize.boolean(change.IsRead);
    await SQLEMail.saveWritableProps(email);
  }

  protected async processSyncUpdate(email: EWSEMail, update: any) {
    email.setFlags(update);
    await SQLEMail.saveWritableProps(email);
  }

  protected async processSyncDelete(email: EWSEMail) {
    await email.deleteMessageLocally();
  }

  /** Lists all messages starting from scratch, ignoring the sync state.
   * If you don't want this, then clear the sync state and update changes.
   * Assumes previously known messages have already been loaded from the DB.
   * @returns the new messages */
  async listAllMessages(): Promise<ArrayColl<EWSEMail>> {
    let allMsgs: ArrayColl<EWSEMail> = new ArrayColl();
    let newMsgs: ArrayColl<EWSEMail> = new ArrayColl();
    let request = {
      m$FindItem: {
        m$ItemShape: {
          t$BaseShape: "IdOnly",
          t$AdditionalProperties: {
            t$FieldURI: [{
              FieldURI: "message:IsRead",
            }, {
              FieldURI: "item:IsDraft",
            }, {
              FieldURI: "item:Flag",
            }],
            t$ExtendedFieldURI: {
              PropertyTag: "0x1080",
              PropertyType: "Integer",
            },
          },
        },
        m$IndexedPageItemView: {
          BasePoint: "Beginning",
          Offset: 0,
        },
        m$ParentFolderIds: {
          t$FolderId: {
            Id: this.id,
          },
        },
        Traversal: "Shallow",
      },
    };
    let result: any = { RootFolder: { IncludesLastItemInRange: "false" } };
    while (result?.RootFolder?.IncludesLastItemInRange === "false") {
      result = await this.account.callEWS(request);
      if (!result?.RootFolder?.Items) {
        // This folder is empty.
        break;
      }
      request.m$FindItem.m$IndexedPageItemView.Offset = sanitize.integer(result.RootFolder.IndexedPagingOffset);
      let messages = getEWSItems(result.RootFolder.Items);
      let newMessageIDs = [];
      for (let message of messages) {
        let email = this.getEmailByItemID(sanitize.nonemptystring(message.ItemId.Id));
        if (email) {
          email.setFlags(message);
          await SQLEMail.saveWritableProps(email);
          allMsgs.add(email);
        } else {
          newMessageIDs.push(message.ItemId);
        }
      }
      await this.getNewMessageHeaders(newMessageIDs, newMsgs);
    }
    allMsgs.addAll(newMsgs);

    for (let email of this.messages.subtract(allMsgs)) {
      SQLEMail.deleteIt(email);
    }
    this.messages.replaceAll(allMsgs);
    return newMsgs;
  }

  async getNewMessageHeaders(newMessageIDs: Array<{ ID: string }>, newMsgs: ArrayColl<EWSEMail>) {
    if (newMessageIDs.length) {
      let request = {
        m$GetItem: {
          m$ItemShape: {
            t$BaseShape: "IdOnly",
            t$AdditionalProperties: {
              t$FieldURI: [{
                FieldURI: "message:InternetMessageId",
              }, {
                FieldURI: "message:IsRead",
              }, {
                FieldURI: "message:References",
              }, {
                FieldURI: "message:ReplyTo",
              }, {
                FieldURI: "message:From",
              }, {
                FieldURI: "message:Sender",
              }, {
                FieldURI: "message:ToRecipients",
              }, {
                FieldURI: "message:CcRecipients",
              }, {
                FieldURI: "message:BccRecipients",
              /* Non-MIME @see EWSEMail.bodyAndAttachmentsFromXML()
              }, {
                FieldURI: "item:Attachments",
              */
              }, {
                FieldURI: "item:Subject",
              }, {
                FieldURI: "item:DateTimeReceived",
              }, {
                FieldURI: "item:InReplyTo",
              }, {
                FieldURI: "item:IsDraft",
              }, {
                FieldURI: "item:DateTimeSent",
              /* Non-MIME
              }, {
                FieldURI: "item:Body",
              */
              }, {
                FieldURI: "item:Flag",
              /* Non-MIME
              }, {
                FieldURI: "item:TextBody",
              */
              }],
              t$ExtendedFieldURI: {
                PropertyTag: "0x1080",
                PropertyType: "Integer",
              },
            },
          },
          m$ItemIds: {
            t$ItemId: newMessageIDs,
          },
        },
      };
      let results = ensureArray(await this.account.callEWS(request));
      for (let result of results) {
        try {
          let email = this.newEMail();
          email.fromXML(getEWSItem(result.Items));
          await SQLEMail.save(email);
          newMsgs.add(email);
        } catch (ex) {
          this.account.errorCallback(ex);
        }
      }
    }
  }

  async downloadMessages(emails: Collection<EWSEMail>): Promise<Collection<EWSEMail>> {
    let downloadedEmail = new ArrayColl<EWSEMail>();
    let emailsToDownload = emails.contents;
    for (let i = 0; i < emailsToDownload.length; i += kMaxCount) {
      let batch = emailsToDownload.slice(i, i + kMaxCount);
      let request = {
        m$GetItem: {
          m$ItemShape: {
            t$BaseShape: "IdOnly",
            t$IncludeMimeContent: true,
          },
          m$ItemIds: {
            t$ItemId: batch.map(message => ({ Id: message.itemID })),
          },
        },
      };
      let results = ensureArray(await this.account.callEWS(request));
      for (let result of results) {
        let email = emailsToDownload.find(email => email.itemID == getEWSItem(result.Items).ItemId.Id);
        if (email && !email.downloadComplete) {
          try {
            let mimeBase64 = sanitize.nonemptystring(getEWSItem(result.Items).MimeContent.Value);
            email.mime = new Uint8Array(await base64ToArrayBuffer(mimeBase64, "message/rfc822"));
            await email.parseMIME();
            await email.save();
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
   * @returns the new messages */
  async getNewMessages(): Promise<ArrayColl<EWSEMail>> {
    let newMsgs = await this.updateChangedMessages(); // uses syncState and should be fast
    await this.downloadMessages(newMsgs);
    return newMsgs;
  }

  getEmailByItemID(id: string): EWSEMail | undefined {
    if (!id) {
      return undefined;
    }
    return this.messages.find((m: EWSEMail) => m.itemID == id) as EWSEMail | undefined;
  }

  async moveMessagesHere(messages: Collection<EWSEMail>) {
    assert(messages.contents.every(message => message.folder.account == this.account), "Cannot move messages between accounts");
    await this.moveOrCopyMessages(messages, "Move");
    await super.moveMessagesHere(messages);
  }

  async copyMessagesHere(messages: Collection<EWSEMail>) {
    assert(messages.contents.every(message => message.folder.account == this.account), "Cannot copy messages between accounts");
    await this.moveOrCopyMessages(messages, "Copy");
    await super.copyMessagesHere(messages);
  }

  async moveOrCopyMessages(messages: Collection<EWSEMail>, action: string) {
    let request = {
      ["m$" + action + "Item"]: {
        m$ToFolderId: {
          t$FolderId: {
            Id: this.id,
          },
        },
        m$ItemIds: {
          t$ItemId: messages.contents.map(message => ({
            Id: message.itemID,
          })),
        },
        m$ReturnNewItemIds: false,
      },
    };
    await this.account.callEWS(request);
  }

  async moveFolderHere(folder: EWSFolder) {
    assert(folder.account = this.account, "Cannot move folders between accounts");
    let request = {
      m$MoveFolder: {
        m$ToFolderId: {
          t$FolderId: {
            Id: this.id,
          },
        },
        m$FolderIds: {
          t$FolderId: {
            Id: folder.id,
          },
        },
      },
    };
    await this.account.callEWS(request);
    await super.moveFolderHere(folder);
  }

  async createSubFolder(name: string): Promise<EWSFolder> {
    let request = {
      m$CreateFolder: {
        m$ParentFolderId: {
          t$FolderId: {
            Id: this.id,
          },
        },
        m$Folders: {
          t$Folder: {
            t$FolderClass: "IPF.Note",
            t$DisplayName: name,
          },
        },
      },
    };
    let result = await this.account.callEWS(request);
    let folder = await super.createSubFolder(name) as EWSFolder;
    folder.id = sanitize.nonemptystring(result.Folders.Folder.FolderId.Id);
    return folder;
  }

  async rename(name: string) {
    let request = {
      m$UpdateFolder: {
        m$FolderChanges: {
          t$FolderChange: {
            t$FolderId: {
              Id: this.id,
            },
            t$Updates: {
              t$SetFolderField: {
                t$FieldURI: {
                  FieldURI: "folder:DisplayName",
                },
                t$Folder: {
                  t$DisplayName: name,
                },
              },
            },
          },
        },
      },
    };
    await this.account.callEWS(request);
    await super.rename(name);
  }

  async deleteIt() {
    await super.deleteIt();
    await SQLFolder.deleteIt(this);
    let request = {
      m$DeleteFolder: {
        m$FolderIds: {
          t$FolderId: {
            Id: this.id,
          },
        },
        DeleteType: "SoftDelete",
      },
    };
    await this.account.callEWS(request);
  }

  async markAllRead() {
    let request = {
      m$MarkAllItemsAsRead: {
        m$ReadFlag: true,
        m$SuppressReadReceipts: true,
        m$FolderIds: {
          t$FolderId: {
            Id: this.id,
          },
        },
      },
    };
    await this.account.callEWS(request);
    await super.markAllRead();
  }

  disableChangeSpecial(): string | false {
    return "You cannot change Exchange special folders.";
  }
}

/**
 * The EWS Items element contains items grouped by their EWS type.
 * It returns:
 * * `.Message` = EMail
 * * `.MeetingRequest` = Calendar invitation
 * * `.MeetingCancellation` = Calendar event cancelled by organizer
 * ...
 * This function is a convenience for a single item. */
export function getEWSItem(item: any): any {
  return Object.values(item)[0];
}

/** @see getEWSItem()
 * This function is a convenience for a multiple items. */
function getEWSItems(items: any[]): any[] {
  return Object.values(items).flat();
}
