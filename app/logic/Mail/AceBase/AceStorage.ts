import type { MailAccountStorage, MailAccount } from "../MailAccount";
import { AceMailAccount } from "./AceMailAccount";
import type { EMail } from "../EMail";
import { AceEMail } from "./AceEMail";
import type { Folder } from "../Folder";
import { AceFolder } from "./AceFolder";

export class AceStorage implements MailAccountStorage {
  async saveAccount(account: MailAccount): Promise<void> {
    await AceMailAccount.save(account);
  }
  async deleteAccount(account: MailAccount): Promise<void> {
    await AceMailAccount.deleteIt(account);
  }

  async readFolderHierarchy(account: MailAccount): Promise<void> {
    await AceFolder.readAllHierarchy(account);
  }
  async saveFolder(folder: Folder): Promise<void> {
    await AceFolder.save(folder);
  }
  async saveFolderProperties(folder: Folder): Promise<void> {
    await AceFolder.saveProperties(folder);
  }
  async deleteFolder(folder: Folder): Promise<void> {
    await AceFolder.deleteIt(folder);
  }

  async readMessage(email: EMail): Promise<void> {
    await AceEMail.read(email.dbID, email);
  }
  async readAllMessages(folder: Folder, limit?: number, startWith?: number): Promise<void> {
    await AceEMail.readAll(folder, limit, startWith);
  }
  async readAllMessagesMainProperties(folder: Folder, limit?: number, startWith?: number): Promise<void> {
    await AceEMail.readAllMainProperties(folder, limit, startWith);
  }
  async readMessageBody(email: EMail): Promise<void> {
    await AceEMail.readBody(email);
  }
  async readMessageWritableProps(email: EMail): Promise<void> {
    await AceEMail.readWritableProps(email);
  }
  async saveMessage(email: EMail): Promise<void> {
    await AceEMail.save(email);
  }
  async saveMessageWritableProps(email: EMail): Promise<void> {
    await AceEMail.saveWritableProps(email);
  }
  async saveMessageTags(email: EMail): Promise<void> {
    await AceEMail.saveTags(email);
  }
  async deleteMessage(email: EMail): Promise<void> {
    await AceEMail.deleteIt(email);
  }
}
