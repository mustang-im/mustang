import { Folder } from "../Folder";
import type { IMAPAccount } from "./IMAPAccount";

export class IMAPFolder extends Folder {
  _account: IMAPAccount;
  path: string;

  constructor(account: IMAPAccount) {
    super();
    this._account = account;
  }

  async fetch() {
    console.log("fetch folder", this.name);
  }
}
