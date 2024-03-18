import { MailAccount } from "../MailAccount";
import { getDatabase } from "./SQLDatabase";
import { ArrayColl } from "svelte-collections";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import sql from "../../../../lib/rs-sqlite";

export class SQLAccount {
  static async save(acc: MailAccount) {
    // `INSERT id = null` will fill the `id` with a new ID value. `id` is a an alias for `rowid`.
    await (await getDatabase()).run(sql`
      INSERT OR REPLACE INTO emailAccount (
        id, idStr, protocol, name, emailAddress,
        hostname, port, tls, url,
        username, passwordButter
      ) VALUES (
        ${acc.dbID}, ${acc.id}, ${acc.name}, ${acc.protocol}, ${acc.emailAddress},
        ${acc.hostname}, ${acc.port}, ${acc.tls}, ${acc.url},
        ${acc.username}, ${acc.password}
      )`);
  }

  static async read(dbID: number, acc: MailAccount) {
    let row = await (await getDatabase()).get(sql`
      SELECT
        protocol, idStr, name, emailAddress,
        hostname, port, tls, url,
        username, password
      FROM emailAccount
      WHERE accountID = ${dbID}
      `) as any;
    (acc.id as any) = sanitize.alphanumdash(row.idStr);
    acc.name = sanitize.label(row.name);
    (acc.protocol as any) = sanitize.alphanumdash(row.protocol);
    acc.emailAddress = sanitize.emailAddress(row.emailAddress);
    acc.hostname = sanitize.hostname(row.hostname);
    acc.port = sanitize.portTCP(row.port);
    acc.tls = sanitize.enum(row.tls, [1, 2, 3], 2);
    acc.url = sanitize.url(row.url);
    acc.username = sanitize.string(row.username);
    acc.password = sanitize.string(row.passwordButter);
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
      this.read(row.id, account);
      accounts.add(account);
    }
    return accounts;
  }
}
