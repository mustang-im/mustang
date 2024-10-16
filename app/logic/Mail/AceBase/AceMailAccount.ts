import type { MailAccount } from "../MailAccount";
import { getDatabase } from "./AceDatabase";
import { JSONMailAccount } from "../JSON/JSONMailAccount";
import { setStorage } from "../Store/setStorage";
import { newAccountForProtocol } from "../AccountsList/MailAccounts";
import { SMTPAccount } from "../SMTP/SMTPAccount";
import { getPassword, setPassword, deletePassword } from "../../Auth/passwordStore";
import { backgroundError } from "../../../frontend/Util/error";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { ensureArray, assert } from "../../util/util";
import { ArrayColl } from "svelte-collections";

export class AceMailAccount {
  static readonly refBranch = "mail/account";
  static ref(acc: MailAccount): string {
    assert(acc.id, "Need account.id");
    return this.refBranch + "/" + acc.id;
  }

  static async save(acc: MailAccount) {
    if (acc.outgoing) {
      acc.outgoing.emailAddress ??= acc.emailAddress;
      await AceMailAccount.save(acc.outgoing);
    }
    acc.dbID = acc.id;
    let json = JSONMailAccount.save(acc);
    let db = await getDatabase();
    await db.set(this.ref(acc), json);
    await setPassword("mail." + acc.id, acc.password);
    setStorage(acc);
  }

  /** Also deletes all folders and messages in this account */
  static async deleteIt(acc: MailAccount) {
    assert(acc.id, "Need account ID to delete");
    let db = await getDatabase();
    await db.remove(this.ref(acc));
    await deletePassword("mail." + acc.id);
  }

  static async read(accID: string, acc: MailAccount, json?: any) {
    assert(accID, "Need account ID to read it");
    if (!json) {
      let db = await getDatabase();
      json = await db.get(this.ref(acc));
    }
    assert(accID == json.id, "Account reference ID doesn't match saved account ID");
    JSONMailAccount.read(acc, json);
    acc.dbID = acc.id;
    acc.password = await getPassword("mail." + acc.id);
    setStorage(acc);
    let outgoingAccountID = sanitize.alphanumdash(json.outgoingAccountID, null);
    if (outgoingAccountID) {
      acc.outgoing = new SMTPAccount() as any as MailAccount;
      await AceMailAccount.read(outgoingAccountID, acc.outgoing);
    }
    return acc;
  }

  static async readAll(): Promise<ArrayColl<MailAccount>> {
    let db = await getDatabase();
    let jsonMap = await db.get(this.refBranch);
    let accounts = new ArrayColl<MailAccount>();
    if (!jsonMap) {
      return accounts;
    }
    let jsonRows = [];
    for (let id in jsonMap) {
      let acc = jsonMap[id];
      acc.dbID = id;
      jsonRows.push(acc);
    }
    for (let json of jsonRows) {
      try {
        console.log("read mail account json", json);
        if (json.protocol == "smtp") {
          continue;
        }
        let account = newAccountForProtocol(json.protocol);
        await AceMailAccount.read(json.id, account, json);
        accounts.add(account);
      } catch (ex) {
        backgroundError(ex);
      }
    }
    return accounts;
  }
}
