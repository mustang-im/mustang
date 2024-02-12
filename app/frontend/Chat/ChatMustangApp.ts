import { MustangApp } from "../AppsBar/MustangApp";
import ChatApp from "../Chat/ChatApp.svelte";
import chatIcon from '../asset/icon/appBar/chat.svg?raw';

export class ChatMustangApp extends MustangApp {
  id = "chat";
  name = "Chat";
  icon = chatIcon;
  mainWindow = ChatApp;
}

export const chatMustangApp = new ChatMustangApp();
