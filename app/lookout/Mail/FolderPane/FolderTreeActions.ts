import { type Folder, SpecialFolder, specialFolderNames } from "../../../logic/Mail/Folder";
import type { MailAccount } from "../../../logic/Mail/MailAccount";
import { AllFolders } from "../../../logic/Mail/Virtual/AllFolders";
import { SavedSearchFolder } from "../../../logic/Mail/Virtual/SavedSearchFolder";
import { assert } from "../../../logic/util/util";
import { selectedFolder } from "../../../frontend/Mail/Selected";
import { derived, get, writable, type Readable } from "svelte/store";
import { gt } from "../../../l10n/l10n";

export class FolderTreeActions {
  static readonly renaming = writable<Folder | null>(null);
  protected static draggedFolder: Folder | null = null;

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

  static showsTotalCount(folder: Folder): boolean {
    return folder.specialFolder == SpecialFolder.Drafts || folder.specialFolder == SpecialFolder.Outbox;
  }

  static countedFolders(folder: Folder): Folder[] {
    return folder instanceof AllFolders ? folder.folders?.contents ?? [] : [folder];
  }

  static countStore(folder: Folder | null, total: boolean): Readable<number> {
    let folders = folder ? FolderTreeActions.countedFolders(folder) : [];
    return derived(folders, () => folders.reduce((sum, counted) =>
      sum + ((total ? counted.countTotal : counted.countUnread) || 0), 0));
  }

  static disableMove(folder: Folder): string | false {
    if (FolderTreeActions.isVirtual(folder)) {
      return gt`This is not a real folder`;
    }
    if (folder.specialFolder && folder.specialFolder != SpecialFolder.Normal) {
      return gt`You cannot move this folder, because it has a special use. See Use As.`;
    }
    return false;
  }

  static isInside(folder: Folder, ancestor: Folder): boolean {
    for (let current = folder; current; current = current.parent) {
      if (current == ancestor) {
        return true;
      }
    }
    return false;
  }

  static canMoveFolderInto(folder: Folder, target: Folder): boolean {
    return !!folder && !!target &&
      !FolderTreeActions.disableMove(folder) &&
      !FolderTreeActions.isVirtual(target) &&
      folder.account == target.account &&
      folder.parent != target &&
      !FolderTreeActions.isInside(target, folder) &&
      !target.disableSubfolders();
  }

  static async moveFolder(folder: Folder, target: Folder) {
    assert(FolderTreeActions.canMoveFolderInto(folder, target), gt`You cannot move the folder ${folder.name} into ${target.name}`);
    await target.moveFolderHere(folder);
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
    if (!confirm(gt`All items in ${FolderTreeActions.displayName(folder)} will be permanently deleted. Continue?`)) {
      return;
    }
    // <copied from="../../../frontend/Mail/LeftPane/FolderMenu.svelte">
    for (let msg of folder.messages.contents) { // copy: deleting alters `folder.messages`
      await msg.deleteMessage();
    }
    // </copied>
  }

  static async deleteFolder(folder: Folder): Promise<Folder | null> {
    // <copied from="../../../frontend/Mail/FolderProperties.svelte">
    if (!(folder instanceof SavedSearchFolder)) {
      let confirmed = confirm(gt`Are you sure that you want to delete the folder ${folder.name} and all messages in it? This will also delete it on the server.`);
      if (!confirmed) {
        return null;
      }
    }
    let next = folder.parent ?? folder.account.inbox;
    await folder.deleteIt();
    // </copied>
    let selected = get(selectedFolder);
    if (selected && FolderTreeActions.isInside(selected, folder)) {
      selectedFolder.set(next);
    }
    return next;
  }

  static startDrag(event: DragEvent, folder: Folder) {
    if (FolderTreeActions.disableMove(folder)) {
      event.preventDefault();
      return;
    }
    FolderTreeActions.draggedFolder = folder;
    event.dataTransfer.setData("lookout/folder", folder.id);
    event.dataTransfer.effectAllowed = "move";
  }

  static endDrag() {
    FolderTreeActions.draggedFolder = null;
  }

  static isFolderDrag(event: DragEvent): boolean {
    return !!FolderTreeActions.draggedFolder && event.dataTransfer?.types.includes("lookout/folder");
  }

  static canDropFolder(target: Folder): boolean {
    return FolderTreeActions.canMoveFolderInto(FolderTreeActions.draggedFolder, target);
  }

  static async dropFolder(target: Folder) {
    let folder = FolderTreeActions.draggedFolder;
    FolderTreeActions.draggedFolder = null;
    await FolderTreeActions.moveFolder(folder, target);
  }
}
