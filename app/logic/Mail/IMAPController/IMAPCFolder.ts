import { DelegateFolder } from "../Delegate/DelegateFolder";
import type { IMAPFolder } from "../IMAP/IMAPFolder";
import { IMAPCEMail as IMAPCEMail } from "./IMAPCEMail";
import type { IMAPCAccount as IMAPCAccount } from "./IMAPCAccount";
import { IMAPEMail } from "../IMAP/IMAPEMail";
import { SQLEMail } from "../SQL/SQLEMail";

export class IMAPCFolder extends DelegateFolder {
  account: IMAPCAccount;
  base: IMAPFolder;

  constructor(account: IMAPCAccount, base: IMAPFolder) {
    super(account, base);
  }

  async listMessages() {
    if (this.messages.isEmpty) {
      await SQLEMail.readAll(this.base);
    }
    await this.base.listMessages();
    for (let email of this.messages.contents.filter(email => !email.dbID)) {
      await SQLEMail.save(email);
    }
  }

  async downloadMessagesComplete() {
    for (let email of this.messages.contents.filter(email => !email.downloadComplete)) {
      email.needSave = true;
    }
    await this.base.downloadMessagesComplete();
    for (let email of this.messages.contents.filter(email => !email.needSave)) {
      await SQLEMail.save(email);
      email.needSave = false;
    }
  }

  newEMail(): IMAPCEMail {
    return new IMAPCEMail(this, new IMAPEMail(this.base));
  }
}
