import type { FileOrDirectory } from "../../logic/Files/File";
import { writable, type Writable } from "svelte/store";

export let selectedFile: Writable<FileOrDirectory> = writable(null);
