import type { MailAccount } from "../MailAccount";
import { getDatabase } from "./SQLDatabase";
import { AccountType, SQLAccount, type AccountDBRow } from "./Account/SQLAccount";
import { newAccountForProtocol } from "../AccountsList/MailAccounts";
import { SQLMailStorage } from "./SQLMailStorage";
import { backgroundError } from "../../../frontend/Util/error";
import { ArrayColl } from "svelte-collections";
import sql from "../../../../lib/rs-sqlite";

export class SQLMailAccount {
  static async save(acc: MailAccount) {
    await SQLAccount.save(acc, AccountType.Mail);

    if (!acc.dbID) {
      let existing = await (await getDatabase()).get(sql`
        SELECT
          id
        FROM emailAccount
        WHERE
          idStr = ${acc.id}
        `) as any;
      if (existing?.id) {
        acc.dbID = existing.id;
      }
    }
    if (!acc.dbID) {
      let insert = await (await getDatabase()).run(sql`
        INSERT INTO emailAccount (
          idStr, protocol
        ) VALUES (
          ${acc.id}, ${acc.protocol}
        )`);
      acc.dbID = insert.lastInsertRowid;
    }
  }

  /** Also deletes all folders and messages in this account */
  static async deleteIt(acc: MailAccount) {
    await SQLAccount.deleteIt(acc);
    await (await getDatabase()).run(sql`
      DELETE FROM emailAccount
      WHERE id = ${acc.dbID}
      `);
  }

  static async read(accountRow: AccountDBRow, acc: MailAccount) {
    await SQLAccount.read(accountRow, acc);

    let row = await (await getDatabase()).get(sql`
      SELECT
        id, protocol
      FROM emailAccount
      WHERE idStr = ${accountRow.idStr}
      `) as any;
    if (row.id) {
      acc.dbID = row.id;
    } else {
      // When the type-specific (e.g. mail) DB has been deleted, but not the accounts DB.
      await SQLMailAccount.save(acc);
    }
    acc.storage = new SQLMailStorage();
    return acc;
  }

  static async readAll(): Promise<ArrayColl<MailAccount>> {
    let rows = await SQLAccount.readAll(AccountType.Mail);
    let accounts = new ArrayColl<MailAccount>();
    let smtpAccounts = new ArrayColl<MailAccount>();
    for (let row of rows) {
      try {
        let account = newAccountForProtocol(row.protocol);
        await SQLMailAccount.read(row, account);
        if (row.protocol == "smtp") {
          smtpAccounts.add(account);
        } else {
          accounts.add(account);
        }
      } catch (ex) {
        backgroundError(ex);
      }
    }
    for (let smtp of smtpAccounts) {
      smtp.mainAccount = accounts.find(acc => acc.id == smtp._mainAccountID);
    }
    if (accounts.isEmpty) {
      await getDatabase(); // for migration only
    }
    return accounts;
  }
}
