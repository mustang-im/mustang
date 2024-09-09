import type { MailAccountStorage, MailAccount } from "../MailAccount";
import { SQLMailAccount } from "./SQLMailAccount";
import type { EMail } from "../EMail";
import { SQLEMail } from "./SQLEMail";
import type { Folder } from "../Folder";
import { SQLFolder } from "./SQLFolder";

export class SQLStorage implements MailAccountStorage {
  async saveAccount(account: MailAccount): Promise<void> {
    await SQLMailAccount.save(account);
  }
  async deleteAccount(account: MailAccount): Promise<void> {
    await SQLMailAccount.deleteIt(account);
  }

  async readFolderHierarchy(account: MailAccount): Promise<void> {
    await SQLFolder.readAllHierarchy(account);
  }
  async saveFolder(folder: Folder): Promise<void> {
    await SQLFolder.save(folder);
  }
  async saveFolderProperties(folder: Folder): Promise<void> {
    await SQLFolder.saveProperties(folder);
  }
  async deleteFolder(folder: Folder): Promise<void> {
    await SQLFolder.deleteIt(folder);
  }

  async readMessage(email: EMail): Promise<void> {
    await SQLEMail.save(email);
  }
  async readAllMessages(folder: Folder, limit?: number, startWith?: number): Promise<void> {
    await SQLEMail.readAll(folder, limit, startWith);
  }
  async readMessageBody(email: EMail): Promise<void> {
    await SQLEMail.readBody(email);
  }
  async readMessageWritableProps(email: EMail): Promise<void> {
    await SQLEMail.readWritableProps(email);
  }
  async saveMessage(email: EMail): Promise<void> {
    await SQLEMail.save(email);
  }
  async saveMessageWritableProps(email: EMail): Promise<void> {
    await SQLEMail.saveWritableProps(email);
  }
  async saveMessageTags(email: EMail): Promise<void> {
    await SQLEMail.saveTags(email);
  }
  async deleteMessage(email: EMail): Promise<void> {
    await SQLEMail.deleteIt(email);
  }
}
