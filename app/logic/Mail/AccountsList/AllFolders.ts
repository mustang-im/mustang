import { Folder, SpecialFolder } from "../Folder";
import type { MailAccount } from "../MailAccount";
import type { AllAccounts } from "./AllAccounts";
import type { EMail } from "../EMail";
import { assert } from "../../util/util";
import { mergeColls, Collection } from "svelte-collections";

export class AllFolders extends Folder {
  account: AllAccounts;
  /** `this` folder shows the sum of all messages in these `folders` */
  _folders: Collection<Folder>;

  constructor(account: AllAccounts) {
    super(account as any as MailAccount);
  }

  get folders(): Collection<Folder> {
    return this._folders;
  }
  set folders(val: Collection<Folder>) {
    this._folders = val;
    (this as any).messages = mergeColls(this.folders.map(folder => folder.messages));
  }

  followSpecialFolder(specialFolder: SpecialFolder) {
    this.specialFolder = specialFolder;
    this.folders = this.account.allRootFolders.filter(folder =>
      folder.specialFolder == specialFolder);
  }

  async listMessages() {
    await Promise.all(this._folders.contents.map(folder =>
        folder.listMessages()));
  }

  async moveMessagesHere(messages: Collection<EMail>) {
    throw new Error("Select an account first, to move emails into a specific folder");
  }

  async copyMessagesHere(messages: Collection<EMail>) {
    throw new Error("Select an account first, to copy emails into a specific folder");
  }

  async moveFolderHere(folder: Folder) {
    throw new Error("Select an account first, to move a folder");
  }

  async createSubFolder(name: string): Promise<Folder> {
    throw new Error("Select a folder in a specific account first, to create a subfolder");
  }

  newEMail(): EMail {
    let account = this.account.accounts.first;
    assert(account, "Setup and select email account first");
    let folder = account.getSpecialFolder(SpecialFolder.Sent);
    assert(folder, `No folder found in account ${account.name}`);
    return folder.newEMail();
  }
}
