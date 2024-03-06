import type { EMail } from "./EMail";
import { Observable, notifyChangedProperty } from "../util/Observable";
import { ArrayColl } from 'svelte-collections';

export class Folder extends Observable {
  @notifyChangedProperty
  name: string;
  @notifyChangedProperty
  specialFolder: SpecialFolder;
  readonly messages = new ArrayColl<EMail>();
}

export enum SpecialFolder {
  Inbox = "inbox",
  Sent = "sent",
  Drafts = "drafts",
  Trash = "trash",
  Spam = "spam",
  Archive = "archive",
}
