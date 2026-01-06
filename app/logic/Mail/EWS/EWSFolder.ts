import { Folder, SpecialFolder, MailShareCombinedPermissions, type ShareCustomPermissions } from "../Folder";
import type { EMail } from "../EMail";
import { EWSEMail } from "./EWSEMail";
import type { EWSAccount } from "./EWSAccount";
import { EWSCreateItemRequest } from "./Request/EWSCreateItemRequest";
import { EWSItemError } from "./EWSError";
import type { EMailCollection } from "../Store/EMailCollection";
import { CreateMIME } from "../SMTP/CreateMIME";
import { AddressbookShareCombinedPermissions } from "../../Contacts/Addressbook";
import { CalendarShareCombinedPermissions } from "../../Calendar/Calendar";
import { PersonUID } from "../../Abstract/PersonUID";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { base64ToArrayBuffer, blobToBase64, NotReached, ensureArray } from "../../util/util";
import { gt } from "../../../l10n/l10n";
import { ArrayColl, type Collection } from "svelte-collections";

export const kMaxCount = 50;

export class EWSFolder extends Folder {
  declare account: EWSAccount;
  declare readonly messages: EMailCollection<EWSEMail>;
  declare readonly subFolders: ArrayColl<EWSFolder>;

  newEMail(): EWSEMail {
    return new EWSEMail(this);
  }

  fromXML(xmljs: any) {
    this.id = sanitize.nonemptystring(xmljs.FolderId.Id);
    this.name = sanitize.nonemptylabel(xmljs.DisplayName);
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

  async listMessages(): Promise<Collection<EWSEMail>> {
    await this.readFolder();
    return await this.updateChangedMessages();
  }

  /** Uses the sync state to get just the messages that changed since last time.
   * Assumes previously known messages have already been loaded from the DB.
   * @returns the new messages (not yet downloaded) */
  async updateChangedMessages(): Promise<ArrayColl<EWSEMail>> {
    let lock = await this.listMessagesLock.lock();
    try {
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
                FieldURI: "item:Categories",
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
      let newMsgs = new ArrayColl<EWSEMail>();
      let result: any = { IncludesLastItemInRange: "false" };
      while (result.IncludesLastItemInRange === "false") {
        try {
          result = await this.account.callEWS(sync);
        } catch (ex) {
          if (ex.error?.ResponseCode == 'ErrorInvalidSyncStateData') {
            this.syncState = null;
            await this.storage.saveFolder(this);
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
        let newMsgsInIteration = await this.getNewMessageHeaders(newMessageIDs);
        this.messages.addAll(newMsgsInIteration);
        newMsgs.addAll(newMsgsInIteration);
        await this.forEachSyncChange(result.Changes.Delete, this.processSyncDelete, true);
        this.syncState = sync.m$SyncFolderItems.m$SyncState = sanitize.nonemptystring(result.SyncState);
        await this.storage.saveFolder(this);
      }
      return newMsgs;
    } finally {
      lock.release();
    }
  }

  protected async forEachSyncChange(changes: any[], eachCallback: (email: EWSEMail, change: any) => Promise<void>, isDirectList: boolean): Promise<any[]> {
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
    email.isRead = sanitize.boolean(change.IsRead, false);
    await this.storage.saveMessageWritableProps(email);
  }

  protected async processSyncUpdate(email: EWSEMail, update: any) {
    email.setFlags(update);
    await this.storage.saveMessageWritableProps(email);
  }

  protected async processSyncDelete(email: EWSEMail) {
    await email.deleteMessageLocally();
  }

  /** Lists all messages starting from scratch, ignoring the sync state.
   * If you don't want this, then clear the sync state and update changes.
   * Assumes previously known messages have already been loaded from the DB.
   * @returns the new messages */
  async listAllMessages(): Promise<ArrayColl<EWSEMail>> {
    let lock = await this.listMessagesLock.lock();
    try {
      let allMsgs = new ArrayColl<EWSEMail>();
      let newMsgs = new ArrayColl<EWSEMail>();
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
                FieldURI: "item:Categories",
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
            await this.storage.saveMessageWritableProps(email);
            allMsgs.add(email);
          } else {
            newMessageIDs.push(message.ItemId);
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

  async getNewMessageHeaders(newMessageIDs: Array<{ ID: string }>): Promise<ArrayColl<EWSEMail>> {
    let newMsgs = new ArrayColl<EWSEMail>();
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
              }, {
                FieldURI: "item:ItemClass",
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
                FieldURI: "item:Categories",
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
      try {
        let results = ensureArray(await this.account.callEWS(request));
        for (let result of results) {
          try {
            if (result.ResponseClass == "Error") {
              throw new EWSItemError(result, request);
            }
            let email = this.newEMail();
            email.fromXML(getEWSItem(result.Items));
            await this.storage.saveMessage(email);
            newMsgs.add(email);
          } catch (ex) {
            this.account.errorCallback(ex);
          }
        }
      } catch (ex) {
        this.account.errorCallback(ex);
      }
    }
    return newMsgs;
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
   * @returns the new messages */
  async getNewMessages(): Promise<Collection<EWSEMail>> {
    let newMsgs = await this.listMessages(); // uses syncState and should be fast
    await this.downloadMessages(newMsgs);
    return newMsgs;
  }

  getEmailByItemID(id: string): EWSEMail | undefined {
    if (!id) {
      return undefined;
    }
    return this.messages.find((m: EWSEMail) => m.itemID == id) as EWSEMail | undefined;
  }

  protected async moveOrCopyMessages(action: "move" | "copy", messages: Collection<EMail>): Promise<boolean> {
    // We can copy messages to and from shared folders for the main account.
    let mainAccount = this.account.mainAccount || this.account;
    if (messages.contents.every(msg => msg.folder.account == mainAccount || msg.folder.account.mainAccount == mainAccount)) {
      return false;
    }
    return await super.moveOrCopyMessages(action, messages);
  }

  async moveMessagesHere(messages: Collection<EMail>) {
    if (await this.moveOrCopyMessages("move", messages)) {
      return;
    }
    await this.moveOrCopyMessagesOnServer("Move", messages as Collection<EWSEMail>);
  }

  async copyMessagesHere(messages: Collection<EMail>) {
    if (await this.moveOrCopyMessages("copy", messages)) {
      return;
    }
    await this.moveOrCopyMessagesOnServer("Copy", messages as Collection<EWSEMail>);
  }

  async moveOrCopyMessagesOnServer(action: "Move" | "Copy", messages: Collection<EWSEMail>) {
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

  async addMessage(message: EMail) {
    message.mime ??= await CreateMIME.getMIME(message);
    let request = new EWSCreateItemRequest({ m$SavedItemFolderId: { t$FolderId: { Id: this.id } }, MessageDisposition: "SaveOnly" });
    request.addField("Message", "MimeContent", await blobToBase64(new Blob([message.mime])));
    if (message.tags.hasItems) {
      request.addField("Message", "Categories", { t$String: message.tags.contents.map(tag => tag.name) });
    }
    if (!message.isDraft) {
      request.addField("Message", "ExtendedProperty", { t$ExtendedFieldURI: { PropertyTag: "0x0E07", PropertyType: "Integer" }, t$Value: 0 });
    }
    if (message.isStarred) {
      request.addField("Message", "Flag", {
        t$CompleteDate: null,
        t$DueDate: null,
        t$StartDate: null,
        t$FlagStatus: "Flagged",
      });
    }
    request.addField("Message", "IsRead", message.isRead);
    await this.account.callEWS(request);
  }

  async moveFolderHere(folder: EWSFolder) {
    await super.moveFolderHere(folder);
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
  }

  async createSubFolder(name: string): Promise<EWSFolder> {
    let folder = await super.createSubFolder(name) as EWSFolder;
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
    folder.id = sanitize.nonemptystring(result.Folders.Folder.FolderId.Id);
    this.account.folderMap.set(folder.id, folder);
    return folder;
  }

  async rename(name: string) {
    await super.rename(name);
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
  }

  async deleteItOnServer() {
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

  async getPermissions(): Promise<ArrayColl<ExchangePermission>> {
    let request = {
      m$GetFolder: {
        m$FolderShape: {
          t$BaseShape: "IdOnly",
          t$AdditionalProperties: {
            t$FieldURI: {
              FieldURI: "folder:PermissionSet",
            },
          },
        },
        m$FolderIds: {
          t$FolderId: {
            Id: this.id,
          },
        },
      },
    };
    let result = await this.account.callEWS(request);
    return new ArrayColl(result.Folders.Folder.PermissionSet.Permissions.Permission.map(permission => ExchangePermission.fromExchange(permission, this.account.emailAddress)));
  }

  async setPermissions(permissions: ArrayColl<ExchangePermission>) {
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
                  FieldURI: "folder:PermissionSet",
                },
                t$Folder: {
                  t$PermissionSet: {
                    t$Permissions: {
                      t$Permission: permissions.contents.map(permission => permission.toEWSFolderPermission()),
                    },
                  },
                },
              },
            },
          },
        },
      },
    };
    await this.account.callEWS(request);
  }
}

export class ExchangePermissions {
  CanCreateItems: boolean;
  CanCreateSubFolders: boolean;
  DeleteItems: "None" | "Owned" | "All";
  EditItems: "None" | "Owned" | "All";
  IsFolderContact: boolean;
  IsFolderOwner: boolean;
  IsFolderVisible: boolean;
  ReadItems: "None" | "TimeOnly" | "TimeAndSubjectAndLocation" | "FullDetails";

  constructor(permissions: Partial<ExchangePermissions> = {}) {
    this.CanCreateItems = sanitize.boolean(permissions.CanCreateItems, false);
    this.CanCreateSubFolders = sanitize.boolean(permissions.CanCreateSubFolders, false);
    this.DeleteItems = sanitize.enum(permissions.DeleteItems, ["None", "Owned", "All"], "None");
    this.EditItems = sanitize.enum(permissions.EditItems, ["None", "Owned", "All"], "None");
    this.IsFolderContact = sanitize.boolean(permissions.IsFolderContact, false);
    this.IsFolderOwner = sanitize.boolean(permissions.IsFolderOwner, false);
    this.IsFolderVisible = sanitize.boolean(permissions.IsFolderVisible, true);
    this.ReadItems = sanitize.enum(permissions.ReadItems, ["None", "TimeOnly", "TimeAndSubjectAndLocation", "FullDetails"], "None");
  }

  toEWS() {
    let result: Record<string, boolean | string> = {};
    for (let permission in this) {
      result["t$" + permission] = this[permission] as string | boolean;
    }
    return result;
  }
}

export class ExchangePermission extends PersonUID {
  exchangePermissions: ExchangePermissions;
  distinguishedUser?: string;

  constructor(emailAddress: string, name: string, permissions: Partial<ExchangePermissions> = {}, distinguishedUser?: "Anonymous" | "Default") {
    super(emailAddress, name);
    this.exchangePermissions = new ExchangePermissions(permissions);
    this.distinguishedUser = distinguishedUser;
  }

  static fromExchange(permissions: any, emailAddress: string) {
    let name;
    let distinguishedUser = permissions.UserId.DistinguishedUser as "Anonymous" | "Default" | undefined;
    switch (distinguishedUser) {
    case "Anonymous":
      emailAddress = "*@*";
      name = gt`Anonymous`;
      break;
    case "Default":
      emailAddress = emailAddress.replace(/.*@/, "*@");
      name = gt`All other users`;
      break;
    default:
      emailAddress = sanitize.emailAddress(permissions.UserId.PrimarySmtpAddress, null);
      name = sanitize.string(permissions.UserId.DisplayName, null);
      break;
    }
    return new ExchangePermission(emailAddress, name, permissions, distinguishedUser);
  }

  toEWSFolderPermission() {
    return Object.assign({
      t$UserId: this.distinguishedUser
      ? { t$DistinguishedUser: this.distinguishedUser, }
      : { t$PrimarySmtpAddress: this.emailAddress, },
    }, { t$PermissionLevel: "Custom" }, this.exchangePermissions.toEWS());
  }

  toEWSCalendarPermission() {
    return Object.assign({
      t$UserId: this.distinguishedUser
      ? { t$DistinguishedUser: this.distinguishedUser, }
      : { t$PrimarySmtpAddress: this.emailAddress, },
    }, { t$CalendarPermissionLevel: "Custom" }, this.exchangePermissions.toEWS());
  }

  toOWAFolderPermission() {
    return Object.assign({
      __type: "Permission:#Exchange",
      UserId: this.distinguishedUser
      ? { DistinguishedUser: this.distinguishedUser, }
      : { PrimarySmtpAddress: this.emailAddress, },
    }, { PermissionLevel: "Custom" }, this.exchangePermissions);
  }

  toOWACalendarPermission() {
    return Object.assign({
      __type: "CalendarPermission:#Exchange",
      UserId: this.distinguishedUser
      ? { DistinguishedUser: this.distinguishedUser, }
      : { PrimarySmtpAddress: this.emailAddress, },
    }, { PermissionLevel: "Custom" }, this.exchangePermissions);
  }
}

export async function deleteExchangePermissions(target: { getPermissions(): Promise<ArrayColl<ExchangePermission>>, setPermissions(permission: ArrayColl<ExchangePermission>): Promise<void> }, otherPerson: PersonUID) {
  let targetPermissions = await target.getPermissions();
  let personPermission = targetPermissions.find(permission => permission.emailAddress == otherPerson.emailAddress);
  if (personPermission) {
    targetPermissions.remove(personPermission);
    await target.setPermissions(targetPermissions);
  }
}

export async function setExchangePermissions(target: { getPermissions(): Promise<ArrayColl<ExchangePermission>>, setPermissions(permission: ArrayColl<ExchangePermission>): Promise<void> }, person: PersonUID, access: string, { shareRead, shareFlags, shareDelete, shareCreate, shareDeleteFolder, shareCreateSubfolders } = {} as ShareCustomPermissions) {
  let targetPermissions = await target.getPermissions();
  let personPermission = targetPermissions.find(permission => permission.emailAddress == person.emailAddress);
  if (!personPermission) {
    personPermission = new ExchangePermission(person.emailAddress, person.name, { IsFolderVisible: true });
    targetPermissions.add(personPermission);
  }
  let permission = personPermission.exchangePermissions;
  switch (access) {
  case CalendarShareCombinedPermissions.ReadAvailability:
    permission.ReadItems = "TimeOnly";
    break;
  case CalendarShareCombinedPermissions.ReadTitle:
    permission.ReadItems = "TimeAndSubjectAndLocation";
    break;
  case CalendarShareCombinedPermissions.ReadAll:
  case AddressbookShareCombinedPermissions.Read:
  case MailShareCombinedPermissions.Read:
    permission.ReadItems = "FullDetails";
    break;
  case MailShareCombinedPermissions.FlagChange:
    permission.ReadItems = "FullDetails";
    permission.EditItems = "All";
    break;
  case CalendarShareCombinedPermissions.Modify:
  case AddressbookShareCombinedPermissions.Modify:
  case MailShareCombinedPermissions.Modify:
    permission.ReadItems = "FullDetails";
    permission.EditItems = "All";
    permission.DeleteItems = "All";
    permission.CanCreateItems = true;
    break;
  case MailShareCombinedPermissions.Custom:
    permission.ReadItems = shareRead ? "FullDetails" : "None";
    permission.EditItems = shareFlags ? "All" : "None"; // closest supported by Exchange
    permission.DeleteItems = shareDelete ? "All" : "None";
    permission.CanCreateItems = shareCreate;
    permission.IsFolderOwner = shareDeleteFolder; // closest supported by Exchange
    permission.CanCreateSubFolders = shareCreateSubfolders;
    break;
  default:
    throw new NotReached();
  }
  await target.setPermissions(targetPermissions);
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
