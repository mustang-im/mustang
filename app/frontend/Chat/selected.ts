import type { ChatAccount } from "../../logic/Chat/ChatAccount";
import type { ChatRoom } from "../../logic/Chat/ChatRoom";
import { writable, type Writable } from "svelte/store";

export let selectedAccount: Writable<ChatAccount> = writable(null);
export let selectedChat: Writable<ChatRoom> = writable(null);
