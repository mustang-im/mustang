import type { Folder } from "../../logic/Mail/Folder";
import type { InlineReply, InlineRibbon } from "./Composer/InlineReplies";
import { ArrayColl } from "svelte-collections";
import { writable } from "svelte/store";

export const updatingFolders = writable<Folder[]>([]);

export const inlineReplies = new ArrayColl<InlineReply>();

export const inlineRibbon = writable<InlineRibbon | null>(null);
