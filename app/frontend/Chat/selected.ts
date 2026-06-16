import type { ChatAccount } from "../../logic/Chat/ChatAccount";
import type { ChatRoom } from "../../logic/Chat/ChatRoom";
import type { ChatMessage } from "../../logic/Chat/Message";
import type { Editor } from '@tiptap/core';
import { writable, type Writable } from "svelte/store";

export let selectedAccount: Writable<ChatAccount> = writable(null);
export let selectedRoom: Writable<ChatRoom> = writable(null);
export let selectedDraft: Writable<ChatMessage> = writable(null);
export let selectedEditor: Writable<Editor> = writable(null);
