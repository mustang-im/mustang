import type { ChatAccount, ChatAccountStorage } from "../ChatAccount";
import type { ChatRoom } from "../ChatRoom";
import type { ChatMessage } from "../Message";
import { ArrayColl, type Collection } from "svelte-collections";

export class DummyChatStorage implements ChatAccountStorage {
  async deleteAccount(account: ChatAccount): Promise<void> {
  }
  async saveAccount(account: ChatAccount): Promise<void> {
  }
  async saveMessage(message: ChatMessage): Promise<void> {
  }
  async saveChat(chat: ChatRoom): Promise<void> {
  }
  static async readChatAccounts(): Promise<Collection<ChatAccount>> {
    return new ArrayColl<ChatAccount>();
  }
}
