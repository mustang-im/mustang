import type { Attachment } from "../../Abstract/Attachment";
import type { ChatAccount, ChatAccountStorage } from "../ChatAccount";
import type { ChatRoom } from "../ChatRoom";
import type { RoomMessage } from "../Message";
import { ArrayColl, type Collection } from "svelte-collections";

export class DummyChatStorage implements ChatAccountStorage {
  async deleteAccount(account: ChatAccount): Promise<void> {
  }
  async saveAccount(account: ChatAccount): Promise<void> {
  }
  async saveMessage(message: RoomMessage): Promise<void> {
  }
  async deleteMessage(message: RoomMessage): Promise<void> {
  }
  async saveRoom(chat: ChatRoom): Promise<void> {
  }
  async deleteRoom(room: ChatRoom): Promise<void> {
  }

  static async readChatAccounts(): Promise<Collection<ChatAccount>> {
    return new ArrayColl<ChatAccount>();
  }

  supportsAttachments = true;
  async readAttachment(attachment: Attachment): Promise<boolean> {
    return true; // not really, but pretending is the whole point of this dummy
  }
  async saveAttachment(attachment: Attachment): Promise<void> {
  }
  async deleteAttachment(attachment: Attachment): Promise<void> {
  }
}
