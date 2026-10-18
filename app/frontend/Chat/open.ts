import type { ChatRoom } from "../../logic/Chat/ChatRoom";
import { getChatSelection } from "./selected";
import { chatMustangApp } from "./ChatMustangApp";
import { getNavigation } from "../AppsBar/selectedApp";
import type { AppWindow } from "../MainWindow/AppWindow";
import { appGlobal } from "../../logic/app";

export function openChatRoomFromOtherApp(room: ChatRoom, appWindow: AppWindow) {
  let { selectedAccount, selectedRoom } = getChatSelection(appWindow.mainWindow);
  let { goTo, openApp, bringAppToFront } = getNavigation(appWindow);
  selectedRoom.set(room);
  selectedAccount.set(room.account);
  if (appGlobal.isMobile) {
    goTo("/chat/room", { room });
  } else {
    openApp(chatMustangApp, {});
  }
  if (appWindow.mainWindow != appWindow) {
    bringAppToFront();
  }
}
