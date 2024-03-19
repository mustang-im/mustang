import { MailAccount } from "../MailAccount";
import { DelegateFolder } from "./DelegateFolder";
import type { Folder } from "../Folder";

export class DelegateMailAccount extends MailAccount {
  readonly protocol: string = "delegate";
  readonly base: MailAccount;

  constructor(base: MailAccount) {
    super();
    this.base = base;

    let self = this;
    this.base.rootFolders.registerObserver({
      added(baseFolders) {
        self.rootFolders.addAll(baseFolders.map(baseFolder => new DelegateFolder(this, baseFolder)) as any as Folder[]);
      },
      removed(baseFolders) {
        self.rootFolders.removeAll(baseFolders.map(baseFolder => new DelegateFolder(this, baseFolder)) as any as Folder[]);
      },
    });
  }

  get isLoggedIn(): boolean {
    return this.base.isLoggedIn;
  }

  async login(interactive: boolean): Promise<void> {
    await this.base.login(interactive);
  }

  async listFolders(): Promise<void> {
    await this.base.listFolders();
  }

  async logout(): Promise<void> {
    await this.base.logout();
  }

  get name(): string {
    return this.base.name;
  }
  set name(val: string) {
    this.base.name = val;
  }

  newFolder(): DelegateFolder {
    return new DelegateFolder(this);
  }
}
