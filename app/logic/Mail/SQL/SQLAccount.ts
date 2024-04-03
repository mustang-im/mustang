import type { MailAccount } from "../MailAccount";
import { getDatabase } from "./SQLDatabase";
import { newAccountForProtocol } from "../AccountsList/MailAccounts";
import { backgroundError } from "../../../frontend/Util/error";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assert } from "../../util/util";
import { ArrayColl } from "svelte-collections";
import sql from "../../../../lib/rs-sqlite";

export class SQLAccount {
  static async save(acc: MailAccount) {
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
      // TODO encrypt password
      let insert = await (await getDatabase()).run(sql`
        INSERT INTO emailAccount (
          idStr, name, protocol, emailAddress,
          username, passwordButter,
          hostname, port, tls, url,
          userRealname
        ) VALUES (
          ${acc.id}, ${acc.name}, ${acc.protocol}, ${acc.emailAddress},
          ${acc.username}, ${acc.password},
          ${acc.hostname}, ${acc.port}, ${acc.tls}, ${acc.url},
          ${acc.userRealname}
        )`);
      acc.dbID = insert.lastInsertRowid;
    } else {
      await (await getDatabase()).run(sql`
        UPDATE emailAccount SET
          name = ${acc.name}, emailAddress = ${acc.emailAddress},
          username = ${acc.username}, passwordButter = ${acc.password},
          hostname = ${acc.hostname}, port = ${acc.port}, tls = ${acc.tls}, url = ${acc.url},
          userRealname = ${acc.userRealname}
        WHERE id = ${acc.dbID}
        `);
    }
  }

  static async deleteIt(account: MailAccount) {
    assert(account.dbID, "Need account DB ID to delete");
    await (await getDatabase()).run(sql`
      DELETE FROM emailAccount
      WHERE id = ${account.dbID}
      `);
  }

  static async read(dbID: number, acc: MailAccount) {
    assert(dbID, "Need account DB ID to read it");
    let row = await (await getDatabase()).get(sql`
      SELECT
        idStr, name, protocol, emailAddress,
        username, passwordButter,
        hostname, port, tls, url,
        userRealname
      FROM emailAccount
      WHERE id = ${dbID}
      `) as any;
    acc.dbID = dbID;
    (acc.id as any) = sanitize.alphanumdash(row.idStr);
    acc.name = sanitize.label(row.name);
    (acc.protocol as any) = sanitize.alphanumdash(row.protocol);
    acc.emailAddress = sanitize.emailAddress(row.emailAddress);
    acc.username = sanitize.stringOrNull(row.username);
    acc.password = sanitize.stringOrNull(row.passwordButter);
    acc.hostname = row.hostname ? sanitize.hostname(row.hostname) : null;
    acc.port = row.port ? sanitize.portTCP(row.port) : null;
    acc.tls = sanitize.enum(row.tls, [1, 2, 3], 2);
    acc.url = row.url ? sanitize.url(row.url) : null;
    acc.userRealname = sanitize.label(row.userRealname);
    return acc;
  }

  static async readAll(): Promise<ArrayColl<MailAccount>> {
    let rows = await (await getDatabase()).all(sql`
      SELECT
        id, protocol
      FROM emailAccount
      `) as any;
    let accounts = new ArrayColl<MailAccount>();
    for (let row of rows) {
      try {
        let account = newAccountForProtocol(row.protocol);
        await SQLAccount.read(row.id, account);
        accounts.add(account);
      } catch (ex) {
        backgroundError(ex);
      }
    }
    return accounts;
  }
}
