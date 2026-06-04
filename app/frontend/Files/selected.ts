import type { FileOrDirectory } from "../../logic/Files/FileOrDirectory";
import type { File } from "../../logic/Files/File";
import type { Directory } from "../../logic/Files/Directory";
import type { FileSharingAccount } from "../../logic/Files/FileSharingAccount";
import type { WebAppListed } from "../../logic/WebApps/WebAppListed";
import { isDemo } from "../AppsBar/demo";
import { FilesView } from "./LeftPane/PaneViewSwitcher.svelte";
import { writable, type Writable, get } from "svelte/store";
import { ArrayColl } from "svelte-collections";

export let selectedFile: Writable<FileOrDirectory> = writable(null);
export let selectedFiles = new ArrayColl<FileOrDirectory>();
export let selectedFolder: Writable<Directory> = writable(null);
export let selectedAccount: Writable<FileSharingAccount> = writable(null);
export let selectedLeftTab: Writable<FilesView> = writable(get(isDemo) ? FilesView.Harddrive : FilesView.Person);

/** If set, this file will be display as on the right pane, full page.
 * Only for some supported file types.
 * Will override the other UI. Normally null. */
export let viewFile: Writable<File> = writable(null);
/** Web app to use for opening `$viewFile`.
 * null = preview */
export let fileViewer: Writable<WebAppListed | null> = writable(null);
export let isRightSidebarExpanded: Writable<boolean> = writable(true);
