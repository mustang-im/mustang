import type { ChatRoom } from "../../logic/Chat/ChatRoom";
import { selectedAccount, selectedChat } from "./selected";
import { chatMustangApp } from "./ChatMustangApp";
import { goTo, openApp } from "../AppsBar/selectedApp";
import { appGlobal } from "../../logic/app";

export function openChatFromOtherApp(chat: ChatRoom) {
  selectedChat.set(chat);
  selectedAccount.set(chat.account);
  if (appGlobal.isMobile) {
    goTo("/chat/chat", { chat });
  } else {
    openApp(chatMustangApp, {});
  }
}
