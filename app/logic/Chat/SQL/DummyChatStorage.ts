import type { ChatAccount, ChatAccountStorage } from "../ChatAccount";
import type { Chat } from "../Chat";
import type { ChatMessage } from "../Message";
import { ArrayColl, type Collection } from "svelte-collections";

export class DummyChatStorage implements ChatAccountStorage {
  async deleteAccount(account: ChatAccount): Promise<void> {
  }
  async saveAccount(account: ChatAccount): Promise<void> {
  }
  async saveMessage(message: ChatMessage): Promise<void> {
  }
  async saveChat(chat: Chat): Promise<void> {
  }
  static async readChatAccounts(): Promise<Collection<ChatAccount>> {
    return new ArrayColl<ChatAccount>();
  }
}
