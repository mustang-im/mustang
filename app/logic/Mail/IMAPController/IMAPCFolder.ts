import { DelegateFolder } from "../Delegate/DelegateFolder";
import type { IMAPFolder } from "../IMAP/IMAPFolder";
import { IMAPCEMail as IMAPCEMail } from "./IMAPCEMail";
import type { IMAPCAccount as IMAPCAccount } from "./IMAPCAccount";
import { IMAPEMail } from "../IMAP/IMAPEMail";

export class IMAPCFolder extends DelegateFolder {
  base: IMAPFolder;
  account: IMAPCAccount;

  constructor(account: IMAPCAccount, base: IMAPFolder) {
    super(account, base);
  }

  async downloadMessagesComplete() {
    await this.base.downloadMessagesComplete();
  }

  newEMail(): IMAPCEMail {
    return new IMAPCEMail(this, new IMAPEMail(this.base));
  }
}
