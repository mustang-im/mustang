import type { MailAccount } from "../MailAccount";
import { getDatabase } from "./SQLDatabase";
import { JSONMailAccount } from "../JSON/JSONMailAccount";
import { newAccountForProtocol } from "../AccountsList/MailAccounts";
import { SQLMailStorage } from "./SQLMailStorage";
import { SMTPAccount } from "../SMTP/SMTPAccount";
import { getPassword, setPassword, deletePassword } from "../../Auth/passwordStore";
import { backgroundError } from "../../../frontend/Util/error";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assert } from "../../util/util";
import { ArrayColl } from "svelte-collections";
import sql from "../../../../lib/rs-sqlite";

export class SQLMailAccount {
  static async save(acc: MailAccount) {
    if (acc.outgoing) {
      acc.outgoing.emailAddress ??= acc.emailAddress;
      await SQLMailAccount.save(acc.outgoing);
    }
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
          idStr, name, protocol, emailAddress,
          username,
          hostname, port, tls, authMethod, url,
          outgoingAccountID, userRealname, workspace, configJSON
        ) VALUES (
          ${acc.id}, ${acc.name}, ${acc.protocol}, ${acc.emailAddress},
          ${acc.username},
          ${acc.hostname}, ${acc.port}, ${acc.tls}, ${acc.authMethod}, ${acc.url},
          ${acc.outgoing?.dbID}, ${acc.userRealname}, ${acc.workspace?.id},
          ${JSON.stringify(acc.toConfigJSON(), null, 2)}
        )`);
      acc.dbID = insert.lastInsertRowid;
    } else {
      await (await getDatabase()).run(sql`
        UPDATE emailAccount SET
          name = ${acc.name}, emailAddress = ${acc.emailAddress},
          username = ${acc.username},
          hostname = ${acc.hostname}, port = ${acc.port}, tls = ${acc.tls}, url = ${acc.url},
          authMethod = ${acc.authMethod}, outgoingAccountID = ${acc.outgoing?.dbID},
          userRealname = ${acc.userRealname}, workspace = ${acc.workspace?.id},
          configJSON = ${JSON.stringify(acc.toConfigJSON(), null, 2)}
        WHERE id = ${acc.dbID}
        `);
    }
    await setPassword("mail." + acc.id, acc.password);
  }

  /** Also deletes all folders and messages in this account */
  static async deleteIt(account: MailAccount) {
    assert(account.dbID, "Need account DB ID to delete");
    await (await getDatabase()).run(sql`
      DELETE FROM emailAccount
      WHERE id = ${account.dbID}
      `);
    await deletePassword("mail." + account.id);
  }

  static async read(dbID: number, acc: MailAccount) {
    assert(dbID, "Need account DB ID to read it");
    let row = await (await getDatabase()).get(sql`
      SELECT
        idStr, name, protocol, emailAddress,
        username,
        hostname, port, tls, authMethod, url,
        outgoingAccountID,
        userRealname, workspace, configJSON
      FROM emailAccount
      WHERE id = ${dbID}
      `) as any;
    acc.dbID = dbID;
    row.id = row.idStr;
    row.config = sanitize.json(row.configJSON, {});
    JSONMailAccount.read(acc, row);
    acc.password = await getPassword("mail." + acc.id);
    acc.storage = new SQLMailStorage();
    let outgoingAccountID = sanitize.integer(row.outgoingAccountID, null);
    if (outgoingAccountID) {
      acc.outgoing = new SMTPAccount();
      await SQLMailAccount.read(outgoingAccountID, acc.outgoing);
    }
    return acc;
  }

  static async readAll(): Promise<ArrayColl<MailAccount>> {
    let rows = await (await getDatabase()).all(sql`
      SELECT
        id, protocol
      FROM emailAccount
      WHERE protocol <> 'smtp'
      `) as any;
    let accounts = new ArrayColl<MailAccount>();
    for (let row of rows) {
      try {
        let account = newAccountForProtocol(row.protocol);
        await SQLMailAccount.read(row.id, account);
        accounts.add(account);
      } catch (ex) {
        backgroundError(ex);
      }
    }
    return accounts;
  }
}
