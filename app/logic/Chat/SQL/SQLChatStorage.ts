import { SQLChatAccount } from "./SQLChatAccount";
import type { ChatAccount, ChatAccountStorage } from "../ChatAccount";
import type { ChatRoom } from "../ChatRoom";
import { SQLChatRoom } from "./SQLChatRoom";
import type { ChatMessage } from "../Message";
import { SQLChatMessage } from "./SQLChatMessage";
import type { Collection } from "svelte-collections";

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
  async saveRoom(room: ChatRoom): Promise<void> {
    await SQLChatRoom.save(room);
  }

  static async readChatAccounts(): Promise<Collection<ChatAccount>> {
    return await SQLChatAccount.readAll();
  }
}
