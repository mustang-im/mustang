import { EMail } from "../EMail";
import type { DelegateFolder } from "./DelegateFolder";
import type { Folder } from "../Folder";

export class DelegateEMail extends EMail {
  base: EMail;
  folder: DelegateFolder;

  constructor(folder: DelegateFolder, base: EMail) {
    super(folder as any as Folder);
    this.base = base;
  }

  async download() {
    await this.base.download();
  }

  async markRead(read = true) {
    await this.base.markRead(read);
  }

  async markStarred(starred = true) {
    await this.base.markStarred(starred);
  }

  async markSpam(spam = true) {
    await this.base.markSpam(spam);
  }

  async markReplied() {
    await this.base.markReplied();
  }

  async markDraft() {
    await this.base.markDraft();
  }

  /**
   * Set read/starred etc. flag on the message
   *
   * @param name -- the flag, e.g. "\Seen", "\Recent", "\Junk" etc.
   * @param set -- true = add the flag, false = remove the flag
   */
  async setFlag(name: string, set = true) {
    await this.base.setFlag(name, set);
  }

  async deleteMessage() {
    await super.deleteMessage();
    await this.base.deleteMessage();
  }
}
