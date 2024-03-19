import { Folder, SpecialFolder } from "../Folder";
import { DelegateEMail } from "./DelegateEMail";
import type { DelegateMailAccount } from "./DelegateMailAccount";
import { ArrayColl, Collection } from "svelte-collections";

export class DelegateFolder extends Folder {
  base: Folder;
  account: DelegateMailAccount;
  parent: DelegateFolder;

  constructor(account: DelegateMailAccount, base: Folder) {
    super(account);
    this.base = base;

    let self = this;
    this.base.messages.registerObserver({
      added(baseMsgs) {
        self.messages.addAll(baseMsgs.map(baseMsg => new DelegateEMail(this, baseMsg)));
      },
      removed(baseMsgs) {
        self.messages.removeAll(baseMsgs.map(baseMsg => new DelegateEMail(this, baseMsg)));
      },
    });
    this.base.subFolders.registerObserver({
      added(baseFolders) {
        self.subFolders.addAll(baseFolders.map(baseFolder => new DelegateFolder(this, baseFolder)) as any as Folder[]);
      },
      removed(baseFolders) {
        self.subFolders.removeAll(baseFolders.map(baseFolder => new DelegateFolder(this, baseFolder)) as any as Folder[]);
      },
    });
  }

  async listMessages() {
    await this.base.listMessages();
  }

  async moveMessagesHere(messages: Collection<DelegateEMail>) {
    await this.base.moveMessagesHere(messages.map(msgC => msgC.base));
  }

  async copyMessagesHere(messages: Collection<DelegateEMail>) {
    await this.base.copyMessagesHere(messages.map(msgC => msgC.base));
  }

  async moveFolderHere(folder: Folder) {
    await this.base.moveFolderHere(folder.base);
  }

  async createSubFolder(name: string): Promise<DelegateFolder> {
    let newFolderBase = await this.base.createSubFolder(name);
    let newDelegateFolder = new DelegateFolder(this.account, newFolderBase);
    this.subFolders.add(newDelegateFolder);
    return newDelegateFolder;
  }

  specialUse(specialUse: string): void {
    this.base.specialUse(specialUse);
  }

  newEMail(): DelegateEMail {
    return new DelegateEMail(this);
  }

  get parent(): DelegateFolder {
    return this.parent;
  }
  set parent(val: DelegateFolder) {
    this.parent = val;
    this.base.parent = val.base;
  }

  get id(): string {
    return this.base.id;
  }
  set id(val: string) {
    this.base.id = val;
  }

  get path(): string {
    return this.base.path;
  }
  set path(val: string) {
    this.base.path = val;
  }

  get name(): string {
    return this.base.name;
  }
  set name(val: string) {
    this.base.name = val;
  }

  get specialFolder(): SpecialFolder {
    return this.base.specialFolder;
  }
  set specialFolder(val: SpecialFolder) {
    this.base.specialFolder = val;
  }

  get countTotal(): number {
    return this.base.countTotal;
  }
  set countTotal(val: number) {
    this.base.countTotal = val;
  }

  get countUnread(): number {
    return this.base.countUnread;
  }
  set countUnread(val: number) {
    this.base.countUnread = val;
  }

  get countNewArrived(): number {
    return this.base.countNewArrived;
  }
  set countNewArrived(val: number) {
    this.base.countNewArrived = val;
  }
}
