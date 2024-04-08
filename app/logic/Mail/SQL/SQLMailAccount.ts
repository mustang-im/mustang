import type { MailAccount, MailAccountStorage } from "../MailAccount";
import { getDatabase } from "./SQLDatabase";
import { newAccountForProtocol } from "../AccountsList/MailAccounts";
import type { EMail } from "../EMail";
import { SQLEMail } from "./SQLEMail";
import type { Folder } from "../Folder";
import { SQLFolder } from "./SQLFolder";
import { appGlobal } from "../../app";
import { backgroundError } from "../../../frontend/Util/error";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assert } from "../../util/util";
import { ArrayColl } from "svelte-collections";
import sql from "../../../../lib/rs-sqlite";

export class SQLMailAccount implements MailAccountStorage {
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
          userRealname, workspace
        ) VALUES (
          ${acc.id}, ${acc.name}, ${acc.protocol}, ${acc.emailAddress},
          ${acc.username}, ${acc.password},
          ${acc.hostname}, ${acc.port}, ${acc.tls}, ${acc.url},
          ${acc.userRealname}, ${acc.workspace}
        )`);
      acc.dbID = insert.lastInsertRowid;
    } else {
      await (await getDatabase()).run(sql`
        UPDATE emailAccount SET
          name = ${acc.name}, emailAddress = ${acc.emailAddress},
          username = ${acc.username}, passwordButter = ${acc.password},
          hostname = ${acc.hostname}, port = ${acc.port}, tls = ${acc.tls}, url = ${acc.url},
          userRealname = ${acc.userRealname}, workspace = ${acc.workspace}
        WHERE id = ${acc.dbID}
        `);
    }
    if (!acc.storage) {
      acc.storage = new SQLMailAccount();
    }
  }

  /** Also deletes all folders and messages in this account */
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
        userRealname, workspace
      FROM emailAccount
      WHERE id = ${dbID}
      `) as any;
    acc.dbID = dbID;
    (acc.id as any) = sanitize.alphanumdash(row.idStr);
    acc.name = sanitize.label(row.name);
    assert(acc.protocol == sanitize.alphanumdash(row.protocol), "MailAccount object of wrong type passed in");
    acc.emailAddress = sanitize.emailAddress(row.emailAddress);
    acc.username = sanitize.stringOrNull(row.username);
    acc.password = sanitize.stringOrNull(row.passwordButter);
    acc.hostname = row.hostname ? sanitize.hostname(row.hostname) : null;
    acc.port = row.port ? sanitize.portTCP(row.port) : null;
    acc.tls = sanitize.enum(row.tls, [1, 2, 3], 0);
    acc.url = row.url ? sanitize.url(row.url) : null;
    acc.userRealname = sanitize.label(row.userRealname);
    acc.workspace = row.workspace
      ? appGlobal.workspaces.find(w => w.id == sanitize.string(row.workspace))
      : null;
    if (!acc.storage) {
      acc.storage = new SQLMailAccount();
    }
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
        await SQLMailAccount.read(row.id, account);
        accounts.add(account);
      } catch (ex) {
        backgroundError(ex);
      }
    }
    return accounts;
  }

  async deleteAccount(account: MailAccount): Promise<void> {
    SQLMailAccount.deleteIt(account);
  }
  async saveAccount(account: MailAccount): Promise<void> {
    SQLMailAccount.save(account);
  }
  async saveMessage(email: EMail): Promise<void> {
    SQLEMail.save(email);
  }
  async saveFolder(folder: Folder): Promise<void> {
    SQLFolder.save(folder);
  }
}
