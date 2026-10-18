import type { ChatAccount } from "../../logic/Chat/ChatAccount";
import type { ChatRoom } from "../../logic/Chat/ChatRoom";
import type { ChatMessage } from "../../logic/Chat/ChatMessage";
import type { Editor } from '@tiptap/core';
import { AppWindow } from "../MainWindow/AppWindow";
import { writable, type Writable } from "svelte/store";

export function getChatSelection(appWindow = AppWindow.current()) {
  return appWindow.uiState(createChatSelection);
}

function createChatSelection() {
  return {
    selectedAccount: writable(null) as Writable<ChatAccount>,
    selectedRoom: writable(null) as Writable<ChatRoom>,
    selectedDraft: writable(null) as Writable<ChatMessage>,
    selectedEditor: writable(null) as Writable<Editor>,
  };
}
