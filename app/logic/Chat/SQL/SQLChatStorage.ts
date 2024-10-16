import { SQLChatAccount } from "./SQLChatAccount";
import type { ChatAccount, ChatAccountStorage } from "../ChatAccount";
import type { Chat } from "../Chat";
import { SQLChat } from "./SQLChat";
import type { ChatMessage } from "../Message";
import { SQLChatMessage } from "./SQLChatMessage";

export class SQLChatStorage implements ChatAccountStorage {
  async deleteAccount(account: ChatAccount): Promise<void> {
    await SQLChatAccount.deleteIt(account);
  }
  async saveAccount(account: ChatAccount): Promise<void> {
    await SQLChatAccount.save(account);
  }
  async saveMessage(message: ChatMessage): Promise<void> {
    await SQLChatMessage.save(message);
  }
  async saveChat(chat: Chat): Promise<void> {
    await SQLChat.save(chat);
  }
}
