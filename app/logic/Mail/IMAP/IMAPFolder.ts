import { Folder } from "../Folder";
import { IMAPEMail } from "./IMAPEMail";
import type { IMAPAccount } from "./IMAPAccount";
import { ArrayColl } from "svelte-collections";

export class IMAPFolder extends Folder {
  _account: IMAPAccount;
  path: string;

  constructor(account: IMAPAccount) {
    super();
    this._account = account;
  }

  async fetch() {
    let lock;
    try {
      console.log("fetch folder", this.name);
      let newMessages = new ArrayColl<IMAPEMail>();
      let conn = this._account._connection;
      lock = await conn.getMailboxLock(this.path);
      for await (let msgInfo of await conn.fetch("1:*", {
        size: true,
        threadId: true,
        envelope: true,
      })) {
        let msg = new IMAPEMail(this._account);
        msg.fromFlow(msgInfo);
        newMessages.add(msg);
      }
      this.messages.addAll(newMessages); // TODO add only the new ones
    } finally {
      lock.release();
    }
  }
}
