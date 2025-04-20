import type { Account } from "../../../Abstract/Account";
import { MailAccount } from "../../MailAccount";
import { getDatabase } from "./SQLDatabase";
import { getPassword, setPassword, deletePassword } from "../../../Auth/passwordStore";
import { sanitize } from "../../../../../lib/util/sanitizeDatatypes";
import { assert } from "../../../util/util";
import sql from "../../../../../lib/rs-sqlite";

export class SQLAccount {
  static async save(acc: Account, type: AccountType): Promise<number> {
    if (acc instanceof MailAccount && acc.outgoing) {
      acc.outgoing.emailAddress ??= acc.emailAddress;
      await SQLAccount.save(acc.outgoing as any as Account, type);
    }
    if (!acc.dbID) {
      let existing = await (await getDatabase()).get(sql`
        SELECT
          id
        FROM account
        WHERE
          idStr = ${acc.id}
        `) as any;
      if (existing?.id) {
        acc.dbID = existing.id;
      }
    }
    if (!acc.dbID) {
      let insert = await (await getDatabase()).run(sql`
        INSERT INTO account (
          idStr, type, protocol, configJSON
        ) VALUES (
          ${acc.id}, ${type}, ${acc.protocol},
          ${JSON.stringify(acc.toConfigJSON(), null, 2)}
        )`);
      acc.dbID = insert.lastInsertRowid;
    } else {
      await (await getDatabase()).run(sql`
        UPDATE account SET
          configJSON = ${JSON.stringify(acc.toConfigJSON(), null, 2)}
        WHERE id = ${acc.dbID}
        `);
    }
    await setPassword("account." + acc.id, acc.password);
    return acc.dbID as number;
  }

  /** Also deletes all folders and messages in this account */
  static async deleteIt(account: Account) {
    assert(account.dbID, "Need account DB ID to delete");
    await (await getDatabase()).run(sql`
      DELETE FROM account
      WHERE id = ${account.dbID}
      `);
    await deletePassword("account." + account.id);
  }

  static async read(idStr: string, protocol: string, configJSON: string, acc: Account) {
    assert(idStr, "Need account ID to read it");
    assert(protocol == acc.protocol, "Protocol doesn't match between the 2 databases");
    // Note: acc.dbID and acc.storage are not yet set
    let json = sanitize.json(configJSON, {});
    (json as any).id = idStr;
    acc.fromConfigJSON(json);
    acc.password = await getPassword("account." + acc.id);
    return acc;
  }

  /**
   * Called by SQLMailAccount.readAll() etc.
   */
  static async readAll(type: AccountType): Promise<{ idStr: string, protocol: string, configJSON: string }[]> {
    let rows = await (await getDatabase()).all(sql`
      SELECT
        idStr, protocol, configJSON
      FROM account
      WHERE type = ${type}
      `) as any;
    return rows;
  }
}

export enum AccountType {
  Mail = 1,
  Chat = 2,
  Contacts = 3,
  Calendar = 4,
  Files = 5,
  Apps = 6,
  Meet = 7,
}
