import { MailAccount } from "../MailAccount";
import { getDatabase } from "./SQLDatabase";
import { ArrayColl } from "svelte-collections";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import sql from "../../../../lib/rs-sqlite";

export class SQLAccount {
  static async save(acc: MailAccount) {
    // TODO encrypt password
    // `INSERT id = null` will fill the `id` with a new ID value. `id` is a an alias for `rowid`.
    let insert = await (await getDatabase()).run(sql`
      INSERT OR REPLACE INTO emailAccount (
        id, idStr, name, protocol, emailAddress,
        username, passwordButter,
        hostname, port, tls, url,
        userRealname
      ) VALUES (
        ${acc.dbID}, ${acc.id}, ${acc.name}, ${acc.protocol}, ${acc.emailAddress},
        ${acc.username}, ${acc.password},
        ${acc.hostname}, ${acc.port}, ${acc.tls}, ${acc.url},
        ${acc.userRealname}
      )`);
    acc.dbID = insert.lastInsertRowid;
  }

  static async read(dbID: number, acc: MailAccount) {
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
    acc.username = sanitize.string(row.username);
    acc.password = sanitize.string(row.passwordButter);
    acc.hostname = row.hostname ? sanitize.hostname(row.hostname) : undefined;
    acc.port = row.port ? sanitize.portTCP(row.port): undefined;
    acc.tls = sanitize.enum(row.tls, [1, 2, 3], 2);
    acc.url = row.url ? sanitize.url(row.url) : undefined;
    acc.userRealname = sanitize.label(row.userRealname);
    return acc;
  }

  static async readAll(): Promise<ArrayColl<MailAccount>> {
    let rows = await (await getDatabase()).all(sql`
      SELECT
        id
      FROM emailAccount
      `) as any;
    let accounts = new ArrayColl<MailAccount>();
    for (let row of rows) {
      let account = new MailAccount();
      await SQLAccount.read(row.id, account);
      accounts.add(account);
    }
    return accounts;
  }
}
