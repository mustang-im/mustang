import type { FileOrDirectory } from "../../logic/Files/FileOrDirectory";
import type { Directory } from "../../logic/Files/Directory";
import type { FileSharingAccount } from "../../logic/Files/FileSharingAccount";
import { isDemo } from "../AppsBar/demo";
import { FilesView } from "./LeftPane/PaneViewSwitcher.svelte";
import { writable, type Writable, get } from "svelte/store";
import { ArrayColl } from "svelte-collections";

export let selectedFile: Writable<FileOrDirectory> = writable(null);
export let selectedFiles = new ArrayColl<FileOrDirectory>();
export let selectedFolder: Writable<Directory> = writable(null);
export let selectedAccount: Writable<FileSharingAccount> = writable(null);
export let selectedLeftTab: Writable<FilesView> = writable(get(isDemo) ? FilesView.Harddrive : FilesView.Person);
