import type { EMail } from "./EMail";
import { Observable, notifyChangedProperty } from "../util/Observable";
import { ArrayColl } from 'svelte-collections';

export class Folder extends Observable {
  @notifyChangedProperty
  name: string;
  @notifyChangedProperty
  specialFolder: SpecialFolder;
  readonly messages = new ArrayColl<EMail>();
  readonly subFolders = new ArrayColl<Folder>();
  countTotal = 0;
  countUnread = 0;
  countUnseen = 0;

  async listMessages() {
    console.log("list messages in folder", this.name);
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
