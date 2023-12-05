import type { EMail } from "./Message";
import { ArrayColl } from 'svelte-collections';

export class Folder {
  name: string;
  specialFolder: SpecialFolder;
  messages = new ArrayColl<EMail>();
}

export enum SpecialFolder {
  Inbox = "inbox",
  Sent = "sent",
  Drafts = "drafts",
  Trash = "trash",
  Spam = "spam",
  Archive = "archive",
}
