import type { EMail } from "../../../logic/Mail/EMail";
import type { Folder } from "../../../logic/Mail/Folder";
import type { MailAccount } from "../../../logic/Mail/MailAccount";
import type { SearchEMail } from "../../../logic/Mail/Store/SearchEMail";
import type { SavedSearchFolder } from "../../../logic/Mail/Virtual/SavedSearchFolder";
import type { Person } from "../../../logic/Abstract/Person";
import type { FolderPropertiesTab } from "./FolderProperties/FolderPropertiesTab";
import { writable } from "svelte/store";

export type MailDialog =
  { kind: "move-messages", messages: EMail[], copy: boolean } |
  { kind: "new-folder", account: MailAccount, parent: Folder | null } |
  { kind: "move-folder", folder: Folder } |
  { kind: "go-to-folder" } |
  { kind: "folder-properties", folder: Folder, tab?: FolderPropertiesTab } |
  { kind: "reading-pane-options" } |
  { kind: "message-properties", message: EMail } |
  { kind: "color-categories", messages: EMail[] } |
  { kind: "new-search-folder", account: MailAccount | null } |
  { kind: "customize-search-folder", folder: SavedSearchFolder } |
  { kind: "save-search", search: SearchEMail } |
  { kind: "rule-from-search", search: SearchEMail, account: MailAccount } |
  { kind: "always-move-from", message: EMail } |
  { kind: "search-person", fieldLabel: string, person: Person | null, onPick: (person: Person | null) => void } |
  { kind: "shared-folder", account: MailAccount };

export class MailDialogs {
  static readonly current = writable<MailDialog | null>(null);

  static open(dialog: MailDialog) {
    MailDialogs.current.set(dialog);
  }

  static close() {
    MailDialogs.current.set(null);
  }
}
