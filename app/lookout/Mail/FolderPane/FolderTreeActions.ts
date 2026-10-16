import { type Folder, SpecialFolder, specialFolderNames } from "../../../logic/Mail/Folder";
import type { MailAccount } from "../../../logic/Mail/MailAccount";
import { AllFolders } from "../../../logic/Mail/Virtual/AllFolders";
import { SavedSearchFolder } from "../../../logic/Mail/Virtual/SavedSearchFolder";
import { assert } from "../../../logic/util/util";
import { selectedFolder } from "../../../frontend/Mail/Selected";
import { MessageBox } from "../../Shared/Dialog/MessageBox";
import { getLocalStorage } from "../../../frontend/Util/LocalStorage";
import { derived, get, writable, type Readable } from "svelte/store";
import { gt } from "../../../l10n/l10n";

export enum FolderCountMode {
  Unread = "unread",
  Total = "total",
}

export class FolderTreeActions {
  static readonly renaming = writable<Folder | null>(null);

  static displayName(folder: Folder): string {
    if (!folder.specialFolder || folder.specialFolder == SpecialFolder.Normal || folder.specialFolder == SpecialFolder.Search) {
      return folder.name;
    }
    return specialFolderNames[folder.specialFolder] ?? folder.name;
  }

  static canShare(account: MailAccount | null): boolean {
    return !!account && account.canShareWithPersons() && !account.isDependentAccount;
  }

  static isVirtual(folder: Folder): boolean {
    return folder instanceof AllFolders || folder instanceof SavedSearchFolder;
  }

  static readonly countModes = getLocalStorage<Record<string, FolderCountMode>>("lookout.mail.folderCountModes", {});

  static showsTotalCount(folder: Folder, countModes = FolderTreeActions.countModes.value): boolean {
    let mode = countModes?.[FolderTreeActions.keyOf(folder)];
    if (mode) {
      return mode == FolderCountMode.Total;
    }
    return folder.specialFolder == SpecialFolder.Drafts || folder.specialFolder == SpecialFolder.Outbox;
  }

  static setCountMode(folder: Folder, mode: FolderCountMode) {
    FolderTreeActions.countModes.value = { ...FolderTreeActions.countModes.value, [FolderTreeActions.keyOf(folder)]: mode };
  }

  static keyOf(folder: Folder): string {
    return folder.account?.id + "/" + folder.id;
  }

  static countedFolders(folder: Folder): Folder[] {
    return folder instanceof AllFolders ? folder.folders?.contents ?? [] : [folder];
  }

  static countStore(folder: Folder | null, total: boolean): Readable<number> {
    let folders = folder ? FolderTreeActions.countedFolders(folder) : [];
    return derived(folders, () => folders.reduce((sum, counted) =>
      sum + ((total ? counted.countTotal : counted.countUnread) || 0), 0));
  }

  static isInside(folder: Folder, ancestor: Folder): boolean {
    for (let current = folder; current; current = current.parent) {
      if (current == ancestor) {
        return true;
      }
    }
    return false;
  }

  static async rename(folder: Folder, name: string) {
    name = name?.trim();
    assert(name, gt`Name cannot be empty`);
    if (name == folder.name) {
      return;
    }
    await folder.rename(name);
    await folder.save();
  }

  static async markAllRead(folder: Folder) {
    for (let counted of FolderTreeActions.countedFolders(folder)) {
      await counted.markAllRead();
    }
  }

  static canDeleteAll(folder: Folder): boolean {
    return folder.specialFolder == SpecialFolder.Trash || folder.specialFolder == SpecialFolder.Spam;
  }

  static async deleteAll(folder: Folder) {
    if (!await MessageBox.ask(gt`Delete All`, gt`All items in ${FolderTreeActions.displayName(folder)} will be permanently deleted. Continue?`)) {
      return;
    }
    // <copied from="../../../frontend/Mail/LeftPane/FolderMenu.svelte">
    for (let msg of folder.messages.contents) { // copy: deleting alters `folder.messages`
      await msg.deleteMessage();
    }
    // </copied>
  }

  static async deleteFolder(folder: Folder): Promise<Folder | null> {
    if (!(folder instanceof SavedSearchFolder) &&
        !await MessageBox.ask(gt`Delete Folder`, gt`Are you sure that you want to delete the folder ${folder.name} and all messages in it? This will also delete it on the server.`)) {
      return null;
    }
    // <copied from="../../../frontend/Mail/FolderProperties.svelte">
    let next = folder.parent ?? folder.account.inbox;
    await folder.deleteIt();
    // </copied>
    let selected = get(selectedFolder);
    if (selected && FolderTreeActions.isInside(selected, folder)) {
      selectedFolder.set(next);
    }
    return next;
  }
}
