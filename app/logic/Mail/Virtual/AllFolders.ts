import { Folder, SpecialFolder } from "../Folder";
import type { MailAccount } from "../MailAccount";
import type { AllAccounts } from "./AllAccounts";
import type { EMail } from "../EMail";
import { UserError, assert } from "../../util/util";
import { mergeColls, mergeColl, Collection, ArrayColl } from "svelte-collections";
import { gt } from "../../../l10n/l10n";

export class AllFolders extends Folder {
  declare account: AllAccounts;
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
    this.messages.subscribe(() => {
      this.countTotal = this.messages.length;
    });
  }

  followSpecialFolder(specialFolder: SpecialFolder) {
    this.specialFolder = specialFolder;
    this.folders = this.account.allRootFolders.filterObservable(folder =>
      folder.specialFolder == specialFolder);
  }

  async listMessages(): Promise<Collection<EMail>> {
    let results = await Promise.all(this._folders.contents.map(folder =>
      folder.listMessages()));
    // return new ArrayColl(results.map(arrayColl => arrayColl.contents).flat());
    return mergeColl(...results);
  }

  async getNewMessages(): Promise<Collection<EMail>> {
    let results = await Promise.all(this._folders.contents.map(folder =>
      folder.getNewMessages()));
    return mergeColl(...results);
  }

  async downloadMessages(emails: Collection<EMail>): Promise<Collection<EMail>> {
    let results = await Promise.all(this._folders.contents.map(folder =>
      folder.downloadMessages(emails.filterOnce(email => email.folder == folder))));
    return mergeColl(...results);
  }

  async downloadAllMessages(): Promise<Collection<EMail>> {
    let results = await Promise.all(this._folders.contents.map(folder =>
      folder.downloadAllMessages()));
    return mergeColl(...results);
  }

  async moveMessagesHere(messages: Collection<EMail>) {
    throw new UserError(gt`Select an account first, to move emails into a specific folder`);
  }

  async copyMessagesHere(messages: Collection<EMail>) {
    throw new UserError(gt`Select an account first, to copy emails into a specific folder`);
  }

  async moveFolderHere(folder: Folder) {
    throw new UserError(gt`Select an account first, to move a folder`);
  }

  async createSubFolder(name: string): Promise<Folder> {
    throw new UserError(gt`Select a folder in a specific account first, to create a subfolder`);
  }

  disableChangeSpecial(): string | false {
    return gt`You cannot change an All accounts special folder.`;
  }

  newEMail(): EMail {
    let account = this.account.accounts.first;
    if (!account) {
      throw new UserError(gt`Setup and select email account first`);
    }
    let folder = account.getSpecialFolder(SpecialFolder.Sent);
    assert(folder, gt`No folder found in account ${account.name}`);
    return folder.newEMail();
  }
}
