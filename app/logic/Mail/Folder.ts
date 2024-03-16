import type { EMail } from "./EMail";
import type { MailAccount } from "./MailAccount";
import { Observable, notifyChangedProperty } from "../util/Observable";
import { ArrayColl, Collection } from 'svelte-collections';
import { assert, AbstractFunction } from "../util/util";

export class Folder extends Observable {
  /** IMAP: folder path */
  id: string;
  @notifyChangedProperty
  name: string;
  @notifyChangedProperty
  parent: Folder | null;
  account: MailAccount;
  @notifyChangedProperty
  specialFolder: SpecialFolder;
  readonly messages = new ArrayColl<EMail>();
  readonly subFolders = new ArrayColl<Folder>();
  @notifyChangedProperty
  countTotal = 0;
  @notifyChangedProperty
  countUnread = 0;
  @notifyChangedProperty
  countNewArrived = 0;
  dbID: number;

  constructor(account: MailAccount) {
    super();
    this.account = account;
  }

  async listMessages() {
    console.log("list messages in folder", this.name);
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
    assert(folder != folder.account.inbox, "Cannot move the inbox");
    assert(!folder.specialFolder, "Should not move special folders");
    assert(folder != this, "Cannot move folder into itself. Neither physics nor logic allow that.");
    assert(this.subFolders.contains(folder), "Is already a subfolder");
    // TODO Check sub sub folders
    folder.parent.subFolders.remove(folder);
    folder.parent = this;
    this.subFolders.add(folder);
  }

  async createSubFolder(name: string) {
    throw new AbstractFunction();
  }
}

export enum SpecialFolder {
  Inbox = "inbox",
  Sent = "sent",
  Drafts = "drafts",
  Trash = "trash",
  Spam = "spam",
  Archive = "archive",
}
