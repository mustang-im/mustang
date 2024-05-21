import { EMail } from "./EMail";
import type { MailAccount } from "./MailAccount";
import type { TreeItem } from "../../frontend/Shared/FastTree";
import { Observable, notifyChangedProperty } from "../util/Observable";
import { ArrayColl, Collection } from 'svelte-collections';
import { assert, AbstractFunction } from "../util/util";

export class Folder extends Observable implements TreeItem {
  /** IMAP: folder path */
  id: string;
  dbID: number;
  @notifyChangedProperty
  name: string;
  @notifyChangedProperty
  parent: Folder | null;
  account: MailAccount;
  @notifyChangedProperty
  specialFolder: SpecialFolder = SpecialFolder.Normal;
  readonly messages = new ArrayColl<EMail>();
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

  constructor(account: MailAccount) {
    super();
    this.account = account;
  }

  get path(): string {
    return this.id;
  }
  set path(val: string) {
    this.id = val;
  }

  get orderPos(): string {
    return this.specialFolder ? "   " + specialFolderOrder.indexOf(this.specialFolder) : this.name;
  }

  async listMessages(): Promise<void> {
    throw new AbstractFunction();
  }

  /** Downloads the entire MIME of *all* emails in this folder.
   * Tries to download the small emails first, then the large emails.
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
    assert(folder != this, "Cannot move folder into itself. Neither physics nor logic allow that.");
    assert(this.subFolders.contains(folder), "Is already a subfolder");
    // TODO Check sub sub folders
    folder.parent.subFolders.remove(folder);
    folder.parent = this;
    this.subFolders.add(folder);
  }

  async createSubFolder(name: string): Promise<Folder> {
    let folder = this.account.newFolder();
    folder.name = name;
    folder.parent = this;
    folder.path = this.path + "/" + name;
    this.subFolders.add(folder);
    return folder;
  }

  async rename(newName: string): Promise<void> {
    this.name = newName;
  }

  /** Warning: Also deletes all messages in the folder, also on the server */
  async deleteIt(): Promise<void> {
    throw new AbstractFunction();
  }

  async markAllRead(): Promise<void> {
    this.countUnread = 0;
    for (let message of this.messages) {
      message.isRead = true;
    }
  }

  get children(): Collection<TreeItem> {
    return this.subFolders as any as Collection<TreeItem>;
  }

  /** @return false, if delete is possible. If not, a string with the reason why it's not possible. */
  disableDelete(): string | false {
    if (this.specialFolder) {
      return "You cannot delete this folder, because it has a special use. See Use As.";
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
      return "You cannot change the Inbox folder.";
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
