import { SQLChatAccount } from "./SQLChatAccount";
import type { ChatAccount, ChatAccountStorage } from "../ChatAccount";
import type { ChatRoom } from "../ChatRoom";
import { SQLChatRoom } from "./SQLChatRoom";
import type { RoomMessage } from "../Message";
import { SQLChatMessage } from "./SQLChatMessage";
import type { Collection } from "svelte-collections";
import type { Attachment } from "../../Abstract/Attachment";
import { RawFilesAttachment } from "../../Mail/Store/RawFilesAttachment";

export class SQLChatStorage implements ChatAccountStorage {
  async deleteAccount(account: ChatAccount): Promise<void> {
    await SQLChatAccount.deleteIt(account);
  }
  async saveAccount(account: ChatAccount): Promise<void> {
    await SQLChatAccount.save(account);
  }
  async saveMessage(message: RoomMessage): Promise<void> {
    await SQLChatMessage.save(message);
    for (let attachment of message.attachments) {
      await attachment.save();
    }
  }
  async saveRoom(room: ChatRoom): Promise<void> {
    await SQLChatRoom.save(room);
  }

  static async readChatAccounts(): Promise<Collection<ChatAccount>> {
    return await SQLChatAccount.readAll();
  }

  protected attachmentsStorage = new RawFilesAttachment();
  supportsAttachments = true;
  async readAttachment(attachment: Attachment): Promise<boolean> {
    return await this.attachmentsStorage.readAttachment(attachment);
  }
  async saveAttachment(attachment: Attachment): Promise<void> {
    await this.attachmentsStorage.saveAttachment(attachment);
  }
  async deleteAttachment(attachment: Attachment): Promise<void> {
    await this.attachmentsStorage.deleteAttachment(attachment);
  }
}
