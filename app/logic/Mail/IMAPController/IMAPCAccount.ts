import { DelegateMailAccount } from "../Delegate/DelegateMailAccount";
import type { IMAPAccount } from "../IMAP/IMAPAccount";
import { IMAPCFolder } from "./IMAPCFolder";
import { IMAPFolder } from "../IMAP/IMAPFolder";
import { SQLFolder } from "../SQL/SQLFolder";

export class IMAPCAccount extends DelegateMailAccount {
  readonly protocol: string = "imap-controller";
  readonly base: IMAPAccount;

  constructor(base: IMAPAccount) {
    super(base);
  }

  async listFolders(): Promise<void> {
    await SQLFolder.readAllHierarchy(this.base);
    await this.base.listFolders();
  }

  newFolder(): IMAPCFolder {
    return new IMAPCFolder(this, new IMAPFolder(this.base));
  }
}
