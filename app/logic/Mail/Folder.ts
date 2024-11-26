import { EMail } from "./EMail";
import type { MailAccount } from "./MailAccount";
import type { TreeItem } from "../../frontend/Shared/FastTree";
import { EMailCollection } from "./Store/EMailCollection";
import { Observable, notifyChangedProperty } from "../util/Observable";
import { ArrayColl, Collection } from 'svelte-collections';
import { Lock } from "../util/Lock";
import { assert, AbstractFunction } from "../util/util";
import { gt } from "../../l10n/l10n";

export class Folder extends Observable implements TreeItem<Folder> {
  /** IMAP: folder path */
  id: string;
  dbID: number | string;
  @notifyChangedProperty
  name: string;
  @notifyChangedProperty
  parent: Folder | null;
  account: MailAccount;
  @notifyChangedProperty
  specialFolder: SpecialFolder = SpecialFolder.Normal;
  readonly messages = new EMailCollection<EMail>(this);
  readonly subFolders = new ArrayColl<Folder>();
  @notifyChangedProperty
  countTotal = 0;
  @notifyChangedProperty
  countUnread = 0;
  @notifyChangedProperty
  countNewArrived = 0;
  /**
   * IMAP: modseq from CONDSTORE, as integer
   * EWS: Sync state, as string
   */
  syncState: number | string | null = null;
  _readFolderLock = new Lock();
  _listMessagesLock = new Lock();

  constructor(account: MailAccount) {
    super();
    this.account = account;
  }

  // TODO remove, and adapt SQLFolder to use folder.id instead (but keep column name "path" in the DB)
  get path(): string {
    return this.id;
  }
  set path(val: string) {
    this.id = val;
  }

  get orderPos(): string {
    return this.specialFolder ? "   " + specialFolderOrder.indexOf(this.specialFolder) : this.name;
  }

  get storage() {
    return this.account.storage;
  }

  protected async readFolder() {
    let lock = await this._readFolderLock.lock();
    try {
      if (lock.wasWaiting) {
        return;
      }
      if (this.messages.hasItems) {
        return;
      }
      if (!this.dbID) {
        await this.save();
      }
      let log = "Reading msgs from DB, for folder " + this.account.name + " " + this.path;
      console.time(log + " first 200");
      await this.storage.readAllMessagesMainProperties(this, 200);
      console.timeEnd(log + " first 200");
      console.time(log);
      await this.storage.readAllMessagesMainProperties(this, null, 200);
      console.timeEnd(log);
    } finally {
      lock.release();
    }
  }

  /** Gets the metadata of the emails in this folder.
   * May be slow, depending on the protocol.
   * @returns the new messages (not yet downloaded). */
  async listMessages(): Promise<ArrayColl<EMail>> {
    throw new AbstractFunction();
  }

  /** Downloads the entire MIME of *all* emails in this folder.
   * Tries to download the small emails first, then the large emails.
   * Assumes that you did `listMessages()` first.
   * @returns the actually downloaded emails. */
  async downloadAllMessages(): Promise<Collection<EMail>> {
    let missing = this.messages.filter(msg => !msg.downloadComplete) as any as Collection<EMail>;
    const kMaxSize = 50000;
    let missingLarge = missing.filter(msg => msg.size && msg.size > kMaxSize);
    let missingSmall = missing.subtract(missingLarge);
    // First the small messages, then the large ones
    let downloadedSmall = await this.downloadMessages(missingSmall);
    let downloadedLarge = await this.downloadMessages(missingLarge);
    return downloadedSmall.concat(downloadedLarge);
  }

  /** Downloads the entire MIME of the given emails.
   * @returns the actually downloaded emails. */
  async downloadMessages(emails: Collection<EMail>): Promise<Collection<EMail>> {
    throw new AbstractFunction();
  }

  /** Lists only the new messages, and downloads them.
   *
   * Should be implemented as fast as possible (a few seconds),
   * so that the action can be repeated routinely every few minutes.
   * @returns the new messages */
  async getNewMessages(): Promise<ArrayColl<EMail>> {
    throw new AbstractFunction();
  }

  async addMessage(email: EMail) {
    if (!email.mime) {
      await email.download();
    }
    assert(email.mime, "Need MIME to upload it to a folder");
    email.folder = this;
    this.messages.add(email);
  }

  async moveMessageHere(message: EMail) {
    await this.moveMessagesHere(new ArrayColl([message]));
  }

  async copyMessageHere(message: EMail) {
    await this.copyMessagesHere(new ArrayColl([message]));
  }

  async moveMessagesHere(messages: Collection<EMail>) {
    let sourceFolder = messages.first.folder;
    assert(sourceFolder, "Need source folder");
    assert(messages.contents.every(msg => msg.folder === sourceFolder), "All messages must be from the same folder");
    sourceFolder.messages.removeAll(messages);
    // Both folders need refresh
  }

  async copyMessagesHere(messages: Collection<EMail>) {
    let sourceFolder = messages.first.folder;
    assert(sourceFolder, "Need source folder");
    assert(messages.contents.every(msg => msg.folder === sourceFolder), "All messages must be from the same folder");
    // Both folders need refresh
  }

  async moveFolderHere(folder: Folder) {
    assert(folder != folder.account.getSpecialFolder(SpecialFolder.Inbox), "Cannot move the inbox");
    assert(!folder.specialFolder, "Should not move special folders");
    assert(folder != this, "Cannot move a folder into itself. Neither physics nor logic allow that. We would run into a circle and run and run and run...");
    assert(this.subFolders.contains(folder), "This folder is *already* a subfolder of the target folder");
    let disableSubfolders = this.disableSubfolders();
    assert(!disableSubfolders, disableSubfolders ?? "This folder cannot have subfolders");
    // TODO Check sub sub folders
    folder.parent.subFolders.remove(folder);
    folder.parent = this;
    this.subFolders.add(folder);
  }

  async createSubFolder(name: string): Promise<Folder> {
    let disableSubfolders = this.disableSubfolders();
    assert(!disableSubfolders, disableSubfolders ?? "This folder cannot have subfolders");
    let folder = this.account.newFolder();
    folder.name = name;
    folder.parent = this;
    folder.path = this.path + "/" + name;
    this.subFolders.add(folder);
    return folder;
  }

  async rename(newName: string): Promise<void> {
    let disabled = this.disableRename();
    assert(!disabled, disabled);
    this.name = newName;
  }

  async save(): Promise<void> {
    await this.storage.saveFolder(this);
  }

  /** Warning: Also deletes all messages in the folder, also on the server */
  async deleteIt(): Promise<void> {
    let disableDelete = this.disableDelete();
    assert(!disableDelete, disableDelete ?? "Cannot delete");
    await this.deleteItLocally();
    await this.deleteItOnServer();
  }

  /** Warning: Also deletes all messages in the folder, also on the server */
  async deleteItLocally(): Promise<void> {
    if (this.parent) {
      this.parent.subFolders.remove(this);
    } else {
      this.account.rootFolders.remove(this);
    }
    if (this.dbID) {
      await this.storage.deleteFolder(this);
    }
  }

  protected async deleteItOnServer() {
  }

  async markAllRead(): Promise<void> {
    this.countUnread = 0;
    for (let message of this.messages) {
      message.isRead = true;
    }
  }

  get children(): Collection<Folder> {
    return this.subFolders as any as Collection<Folder>;
  }

  /** @return false, if delete is possible. If not, a string with the reason why it's not possible. */
  disableDelete(): string | false {
    if (this.specialFolder != SpecialFolder.Normal) {
      return gt(`You cannot delete this folder, because it has a special use. See Use As.`);
    }
    return false;
  }

  /** @return false, if renaming is possible. If not, a string with the reason why it's not possible. */
  disableRename(): string | false {
    if (this.specialFolder == SpecialFolder.Inbox || this.path?.toUpperCase() == "INBOX") {
      return gt(`You cannot rename the inbox.`);
    }
    return false;
  }

  /** @return false, if creating subfolders is possible. If not, a string with the reason why it's not possible. */
  disableSubfolders(): string | false {
    return false;
  }

  /** @return false, if changing the special folder is possible. If not, a string with the reason why it's not possible. */
  disableChangeSpecial(): string | false {
    if (this.path.toUpperCase() == "INBOX") {
      return gt(`You cannot change the Inbox folder.`);
    }
    return false;
  }

  newEMail(): EMail {
    return new EMail(this);
  }
}

export enum SpecialFolder {
  Normal = "normal",
  Inbox = "inbox",
  Sent = "sent",
  Drafts = "drafts",
  Trash = "trash",
  Spam = "spam",
  Archive = "archive",
  Outbox = "outbox",
  All = "all",
  Search = "search",
}

export const specialFolderOrder = [
  SpecialFolder.All,
  SpecialFolder.Inbox,
  SpecialFolder.Sent,
  SpecialFolder.Drafts,
  SpecialFolder.Trash,
  SpecialFolder.Spam,
  SpecialFolder.Archive,
  SpecialFolder.Outbox,
  SpecialFolder.Search,
  SpecialFolder.Normal,
];

export const specialFolderNames = {};
specialFolderNames[SpecialFolder.Inbox] = gt`Inbox`;
specialFolderNames[SpecialFolder.Sent] = gt`Sent`;
specialFolderNames[SpecialFolder.Drafts] = gt`Drafts`;
specialFolderNames[SpecialFolder.Trash] = gt`Trash`;
specialFolderNames[SpecialFolder.Spam] = gt`Spam`;
specialFolderNames[SpecialFolder.Archive] = gt`Archive`;
specialFolderNames[SpecialFolder.Outbox] = gt`Outbox`;
specialFolderNames[SpecialFolder.Search] = gt`Saved Search`;
specialFolderNames[SpecialFolder.Normal] = gt`Normal folder`;
specialFolderNames[SpecialFolder.All] = gt`All messages`;
