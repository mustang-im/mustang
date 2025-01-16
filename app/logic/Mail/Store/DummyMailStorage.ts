import type { MailAccountStorage, MailAccount } from "../MailAccount";
import type { EMail } from "../EMail";
import type { Folder } from "../Folder";
import { ArrayColl, type Collection } from "svelte-collections";

/** Does not save. Not even account config. Useful for tests. */
export class DummyMailStorage implements MailAccountStorage {
  async saveAccount(account: MailAccount): Promise<void> {
  }
  async deleteAccount(account: MailAccount): Promise<void> {
  }
  async readFolderHierarchy(account: MailAccount): Promise<void> {
  }
  async saveFolder(folder: Folder): Promise<void> {
  }
  async saveFolderProperties(folder: Folder): Promise<void> {
  }
  async deleteFolder(folder: Folder): Promise<void> {
  }
  async readMessage(email: EMail): Promise<void> {
  }
  async readAllMessages(folder: Folder, limit?: number, startWith?: number): Promise<void> {
  }
  async readAllMessagesMainProperties(folder: Folder, limit?: number, startWith?: number): Promise<void> {
  }
  async readMessageBody(email: EMail): Promise<void> {
  }
  async readMessageWritableProps(email: EMail): Promise<void> {
  }
  async saveMessage(email: EMail): Promise<void> {
  }
  async saveMessages(emails: Collection<EMail>): Promise<void> {
  }
  async saveMessageWritableProps(email: EMail): Promise<void> {
  }
  async saveMessageTags(email: EMail): Promise<void> {
  }
  async deleteMessage(email: EMail): Promise<void> {
  }
  static async readMailAccounts(): Promise<Collection<MailAccount>> {
    return new ArrayColl();
  }
}
