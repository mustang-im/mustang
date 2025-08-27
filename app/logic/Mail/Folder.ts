import { EMail } from "./EMail";
import type { MailAccount } from "./MailAccount";
import type { TreeItem } from "../../frontend/Shared/FastTree";
import { EMailCollection } from "./Store/EMailCollection";
import { Observable, notifyChangedProperty } from "../util/Observable";
import { ArrayColl, Collection } from 'svelte-collections';
import { Lock } from "../util/Lock";
import { assert, AbstractFunction, NotImplemented } from "../util/util";
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
  readonly storageLock = new Lock();
  protected readonly readFolderLock = new Lock();
  protected readonly listMessagesLock = new Lock();

  constructor(account: MailAccount) {
    super();
    this.account = account;
  }

  get fullPath(): string {
    let path = this.name;
    let cur = this.parent;
    while (cur) {
      path = cur.name + "/" + path;
      cur = cur.parent;
    }
    return path;
  }

  get orderPos(): string {
    return this.specialFolder ? "   " + specialFolderOrder.indexOf(this.specialFolder) : this.name;
  }

  get storage() {
    return this.account.storage;
  }

  protected async readFolder() {
    let lock = await this.readFolderLock.lock();
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
      let log = "Reading msgs from DB, for folder " + this.account.name + " " + this.name;
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
  async listMessages(): Promise<Collection<EMail>> {
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
  async getNewMessages(): Promise<Collection<EMail>> {
    throw new AbstractFunction();
  }

  async moveMessageHere(message: EMail) {
    await this.moveMessagesHere(new ArrayColl([message]));
  }

  async copyMessageHere(message: EMail) {
    await this.copyMessagesHere(new ArrayColl([message]));
  }

  async moveMessagesHere(messages: Collection<EMail>) {
    throw new AbstractFunction();
  }

  async copyMessagesHere(messages: Collection<EMail>) {
    throw new AbstractFunction();
  }

  /**
   * Helper function for `copyMessagesHere()` and `moveMessagesHere()`
   * @returns
   * true = Move has already been done (across accounts)
   * false = Caller needs to move messages (within the same account) */
  protected async moveOrCopyMessages(action: "move" | "copy", messages: Collection<EMail>): Promise<boolean> {
    let sourceFolder = messages.first.folder;
    assert(sourceFolder, "Need source folder");
    assert(messages.contents.every(msg => msg.folder === sourceFolder), "All messages must be from the same folder");
    if (action == "move") {
      sourceFolder.messages.removeAll(messages);
    }
    if (this.account != sourceFolder.account) {
      for (let message of messages) {
        await message.loadMIME();
        await this.addMessage(message);
        if (action == "move") {
          await message.deleteMessage();
        }
      }
      return true;
    }
    // Both folders need refresh
    return false;
  }

  /**
   * Uploads a message to this folder on the server.
   *
   * MIME:
   * - If this is an existing message, e.g. from another
   *   server or from an .eml file, make sure that
   *   `.mime` is populated with the RFC5322 message.
   * - If this is a new message that you just created,
   *   then this function will create the MIME from the properties.
   */
  async addMessage(message: EMail) {
    throw new AbstractFunction();
  }

  async moveFolderHere(folder: Folder) {
    assert(folder.account == this.account, gt`Cannot move folders between accounts yet. You can create a new folder and move the messages`);
    assert(folder != folder.account.getSpecialFolder(SpecialFolder.Inbox), "Cannot move the inbox");
    assert(!folder.specialFolder, "Should not move special folders");
    assert(folder != this, "Cannot move a folder into itself. Neither physics nor logic allow that. We would run into a circle and run and run and run...");
    assert(this.subFolders.contains(folder), "This folder is *already* a subfolder of the target folder");
    let disableSubfolders = this.disableSubfolders();
    assert(!disableSubfolders, disableSubfolders ?? "This folder cannot have subfolders");
    // TODO Check sub sub folders
    if (folder.parent) {
      folder.parent.subFolders.remove(folder);
    } else {
      folder.account.rootFolders.remove(folder);
    }
    folder.parent = this;
    this.subFolders.add(folder);
  }

  /** @see MailAccount.createToplevelFolder() */
  async createSubFolder(name: string): Promise<Folder> {
    let disableSubfolders = this.disableSubfolders();
    assert(!disableSubfolders, disableSubfolders ?? "This folder cannot have subfolders");
    let folder = this.account.newFolder();
    folder.name = name;
    folder.parent = this;
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
    if (this.specialFolder == SpecialFolder.Inbox || this.name.toUpperCase() == "INBOX") {
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
    if (this.specialFolder == SpecialFolder.Inbox || this.name.toUpperCase() == "INBOX") {
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

export const specialFolderNames: Record<string, string> = {};
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
