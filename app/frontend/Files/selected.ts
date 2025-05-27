import type { FileOrDirectory } from "../../logic/Files/FileOrDirectory";
import type { Directory } from "../../logic/Files/Directory";
import type { FileSharingAccount } from "../../logic/Files/FileSharingAccount";
import { writable, type Writable } from "svelte/store";
import { ArrayColl } from "svelte-collections";

export let selectedFile: Writable<FileOrDirectory> = writable(null);
export let selectedFiles = new ArrayColl<FileOrDirectory>();
export let selectedDirectory: Writable<Directory> = writable(null);
export let selectedAccount: Writable<FileSharingAccount> = writable(null);
