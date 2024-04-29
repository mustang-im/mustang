import { DelegateFolder } from "../Delegate/DelegateFolder";
import type { IMAPFolder } from "../IMAP/IMAPFolder";
import { IMAPCEMail as IMAPCEMail } from "./IMAPCEMail";
import type { IMAPCAccount as IMAPCAccount } from "./IMAPCAccount";
import { IMAPEMail } from "../IMAP/IMAPEMail";
import { SQLEMail } from "../SQL/SQLEMail";
import { EMail } from "../EMail";
import { Collection } from "svelte-collections";

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
  }

  async downloadMessages() {
    for (let email of this.messages.contents.filter(email => !email.downloadComplete)) {
      email.needSave = true;
    }
    let result = await this.base.downloadMessages();
    for (let email of this.messages.contents.filter(email => !email.needSave)) {
      await SQLEMail.save(email);
      email.needSave = false;
    }
    return result as any as Collection<EMail>;
  }

  newEMail(): IMAPCEMail {
    return new IMAPCEMail(this, new IMAPEMail(this.base));
  }
}
