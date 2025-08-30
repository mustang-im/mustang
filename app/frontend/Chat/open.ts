import type { Chat } from "../../logic/Chat/Chat";
import { selectedAccount, selectedChat } from "./selected";
import { chatMustangApp } from "./ChatMustangApp";
import { goTo, openApp } from "../AppsBar/selectedApp";
import { appGlobal } from "../../logic/app";

export function openChatFromOtherApp(chat: Chat) {
  selectedChat.set(chat);
  selectedAccount.set(chat.account);
  if (appGlobal.isMobile) {
    goTo("/chat/chat", { chat });
  } else {
    openApp(chatMustangApp, {});
  }
}
