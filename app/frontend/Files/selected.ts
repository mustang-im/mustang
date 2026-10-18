import type { FileOrDirectory } from "../../logic/Files/FileOrDirectory";
import type { File } from "../../logic/Files/File";
import type { Directory } from "../../logic/Files/Directory";
import type { FileSharingAccount } from "../../logic/Files/FileSharingAccount";
import type { WebAppListed } from "../../logic/WebApps/WebAppListed";
import { FilesView } from "./LeftPane/PaneViewSwitcher.svelte";
import { AppWindow } from "../MainWindow/AppWindow";
import { writable, type Writable } from "svelte/store";
import { ArrayColl } from "svelte-collections";
import { appGlobal } from "../../logic/app";

export function getFilesSelection(appWindow = AppWindow.current()) {
  return appWindow.uiState(createFilesSelection);
}

function createFilesSelection() {
  return {
    selectedFile: writable(null) as Writable<FileOrDirectory>,
    selectedFiles: new ArrayColl<FileOrDirectory>(),
    selectedFolder: writable(null) as Writable<Directory>,
    selectedAccount: writable(null) as Writable<FileSharingAccount>,
    selectedLeftTab: writable(appGlobal.fileSharingAccounts.hasItems ? FilesView.CloudStorage : FilesView.Person) as Writable<FilesView>,
    /** If set, this file will be display as on the right pane, full page.
     * Only for some supported file types.
     * Will override the other UI. Normally null. */
    viewFile: writable(null) as Writable<File>,
    /** Web app to use for opening `$viewFile`.
     * null = preview */
    fileViewer: writable(null) as Writable<WebAppListed | null>,
    isRightSidebarExpanded: writable(true) as Writable<boolean>,
  };
}
