import type { EMail } from "../../../logic/Mail/EMail";
import type { Folder } from "../../../logic/Mail/Folder";
import type { MailAccount } from "../../../logic/Mail/MailAccount";
import type { SearchEMail } from "../../../logic/Mail/Store/SearchEMail";
import { writable } from "svelte/store";

export type MailDialog =
  { kind: "move-messages", messages: EMail[], copy: boolean } |
  { kind: "new-folder", account: MailAccount, parent: Folder | null } |
  { kind: "rename-folder", folder: Folder } |
  { kind: "move-folder", folder: Folder } |
  { kind: "go-to-folder" } |
  { kind: "folder-properties", folder: Folder } |
  { kind: "reading-pane-options" } |
  { kind: "color-categories" } |
  { kind: "new-search-folder", account: MailAccount | null } |
  { kind: "save-search", search: SearchEMail } |
  { kind: "search-person" };

export class MailDialogs {
  static readonly current = writable<MailDialog | null>(null);

  static open(dialog: MailDialog) {
    MailDialogs.current.set(dialog);
  }

  static close() {
    MailDialogs.current.set(null);
  }
}
