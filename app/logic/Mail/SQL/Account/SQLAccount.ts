import type { Account } from "../../../Abstract/Account";
import { MailAccount } from "../../MailAccount";
import { getDatabase } from "./SQLDatabase";
import { passwordDecrypt, passwordEncrypt } from "../../../Auth/passwordEncrypt";
import { sanitize } from "../../../../../lib/util/sanitizeDatatypes";
import { assert } from "../../../util/util";
import sql from "../../../../../lib/rs-sqlite";

export class SQLAccount {
  static async save(acc: Account, type: AccountType) {
    if (acc instanceof MailAccount && acc.outgoing) {
      acc.outgoing.emailAddress ??= acc.emailAddress;
      await SQLAccount.save(acc.outgoing as any as Account, type);
    }
    let json = acc.toConfigJSON();
    json.passwordEncrypted = await passwordEncrypt(acc.password);
    // acc.oAuth2.refreshToken changes every few minutes, so should not save in configJSON
    let jsonStr = JSON.stringify(json, null, 2);

    let existing = await (await getDatabase()).get(sql`
      SELECT
        protocol
      FROM account
      WHERE
        idStr = ${acc.id}
      `) as any;
    if (!existing) {
      await (await getDatabase()).run(sql`
        INSERT INTO account (
          idStr, type, protocol, mainAccountIDStr, json
        ) VALUES (
          ${acc.id}, ${type}, ${acc.protocol}, ${acc.mainAccount?.id},
          ${jsonStr}
        )`);
    } else {
      assert(existing.protocol == acc.protocol, "Protocol in accounts DB does not match");
      await (await getDatabase()).run(sql`
        UPDATE account SET
          mainAccountIDStr = ${acc.mainAccount?.id},
          json = ${jsonStr}
        WHERE idStr = ${acc.id}
        `);
    }
  }

  /** Also deletes all folders and messages in this account */
  static async deleteIt(account: Account) {
    assert(account.dbID, "Need account DB ID to delete");
    await (await getDatabase()).run(sql`
      DELETE FROM account
      WHERE id = ${account.dbID}
      `);
  }

  static async read(idStr: string, protocol: string, configJSON: string, acc: Account) {
    assert(idStr, "Need account ID to read it");
    assert(protocol == acc.protocol, "Protocol doesn't match between the 2 databases");
    // Note: acc.dbID and acc.storage are not yet set
    let json = sanitize.json(configJSON, {});
    json.id = idStr;
    acc.fromConfigJSON(json);
    acc.password = await passwordDecrypt(json.passwordEncrypted);
    return acc;
  }

  /**
   * Called by SQLMailAccount.readAll() etc.
   */
  static async readAll(type: AccountType): Promise<{ idStr: string, protocol: string, json: string }[]> {
    let rows = await (await getDatabase()).all(sql`
      SELECT
        idStr, protocol, json
      FROM account
      WHERE type = ${type}
      `) as any;
    return rows;
  }
}

export enum AccountType {
  Mail = 1,
  Chat = 2,
  Addressbook = 3,
  Calendar = 4,
  Files = 5,
  Apps = 6,
  Meet = 7,
}
