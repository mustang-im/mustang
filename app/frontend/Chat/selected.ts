import type { ChatAccount } from "../../logic/Chat/ChatAccount";
import type { Chat } from "../../logic/Chat/Chat";
import { writable, type Writable } from "svelte/store";

export let selectedAccount: Writable<ChatAccount> = writable(null);
export let selectedChat: Writable<Chat> = writable(null);
