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

  fromFlow(folderInfo: any) {
    this.name = folderInfo.name;
    this.path = folderInfo.path;
    this._account.specialUse(this, folderInfo.specialUse);
  }

  async listMessages() {
    let lock;
    try {
      console.log("list messages in folder", this.name);
      let newMessages = new ArrayColl<IMAPEMail>();
      let conn = this._account._connection;
      lock = await conn.getMailboxLock(this.path);
      for await (let msgInfo of await conn.fetch("1:*", {
        size: true,
        threadId: true,
        envelope: true,
      })) {
        let msg = this.getEMailByUID(msgInfo.uid);
        if (!msg) {
          msg = new IMAPEMail(this);
          msg.fromFlow(msgInfo);
          newMessages.add(msg);
        }
      }
      this.messages.addAll(newMessages); // notify only once
    } finally {
      lock.release();
    }
  }

  async downloadMessagesComplete() {
    let lock;
    try {
      console.log("download complete messages in folder", this.name);
      let newMessages = new ArrayColl<IMAPEMail>();
      let conn = this._account._connection;
      lock = await conn.getMailboxLock(this.path);
      for await (let msgInfo of await conn.downloadMany("1:*", {
        size: true,
        threadId: true,
        envelope: true,
      })) {
        let msg = this.getEMailByUID(msgInfo.uid);
        if (msg?.downloadComplete) {
          continue;
        } else if (msg) {
          msg.fromFlow(msgInfo);
        } else {
          msg = new IMAPEMail(this);
          msg.fromFlow(msgInfo);
          newMessages.add(msg);
        }
      }
      this.messages.addAll(newMessages); // notify only once
    } finally {
      lock.release();
    }
  }

  getEMailByUID(uid: number): IMAPEMail {
    return this.messages.find((m: IMAPEMail) => m.uid == uid) as IMAPEMail;
  }

  /* getEMailByUIDOrCreate(uid: number): IMAPEMail {
    return this.getEMailByUID(uid) ?? new IMAPEMail(this);
  }*/
}
