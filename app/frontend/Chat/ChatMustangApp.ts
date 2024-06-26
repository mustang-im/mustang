import { MustangApp } from "../AppsBar/MustangApp";
import ChatApp from "../Chat/ChatApp.svelte";
import chatIcon from '../asset/icon/appBar/chat.svg?raw';
import { gt } from "../../l10n/l10n";

export class ChatMustangApp extends MustangApp {
  id = "chat";
  name = gt`Chat`;
  icon = chatIcon;
  mainWindow = ChatApp;
}

export const chatMustangApp = new ChatMustangApp();
