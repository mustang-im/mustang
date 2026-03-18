import type { ChatRoom } from "../../logic/Chat/ChatRoom";
import { selectedAccount, selectedRoom } from "./selected";
import { chatMustangApp } from "./ChatMustangApp";
import { goTo, openApp } from "../AppsBar/selectedApp";
import { appGlobal } from "../../logic/app";

export function openChatRoomFromOtherApp(room: ChatRoom) {
  selectedRoom.set(room);
  selectedAccount.set(room.account);
  if (appGlobal.isMobile) {
    goTo("/chat/room", { room });
  } else {
    openApp(chatMustangApp, {});
  }
}
