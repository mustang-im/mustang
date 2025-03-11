import type { ChatAccount } from "../ChatAccount";
import { getDatabase } from "./SQLDatabase";
import { newChatAccountForProtocol } from "../AccountsList/ChatAccounts";
import { SQLChatStorage } from "./SQLChatStorage";
import { getPassword, setPassword, deletePassword } from "../../Auth/passwordStore";
import { TLSSocketType } from "../../Mail/MailAccount";
import { getWorkspaceByID } from "../../Abstract/Workspace";
import { appGlobal } from "../../app";
import { backgroundError } from "../../../frontend/Util/error";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assert } from "../../util/util";
import { ArrayColl } from "svelte-collections";
import sql from "../../../../lib/rs-sqlite";

export class SQLChatAccount {
  static async save(acc: ChatAccount) {
    if (!acc.dbID) {
      let existing = await (await getDatabase()).get(sql`
        SELECT
          id
        FROM chatAccount
        WHERE
          idStr = ${acc.id}
        `) as any;
      if (existing?.id) {
        acc.dbID = existing.id;
      }
    }
    if (!acc.dbID) {
      let insert = await (await getDatabase()).run(sql`
        INSERT INTO chatAccount (
          idStr, name, protocol,
          username,
          hostname, port, tls, url,
          userRealname, workspace, configJSON
        ) VALUES (
          ${acc.id}, ${acc.name}, ${acc.protocol},
          ${acc.username},
          ${acc.hostname}, ${acc.port}, ${acc.tls}, ${acc.url},
          ${acc.userRealname}, ${acc.workspace?.id},
          ${JSON.stringify(acc.toConfigJSON(), null, 2)}
        )`);
      acc.dbID = insert.lastInsertRowid;
    } else {
      await (await getDatabase()).run(sql`
        UPDATE chatAccount SET
          name = ${acc.name},
          username = ${acc.username},
          hostname = ${acc.hostname}, port = ${acc.port}, tls = ${acc.tls}, url = ${acc.url},
          userRealname = ${acc.userRealname}, workspace = ${acc.workspace?.id},
          configJSON = ${JSON.stringify(acc.toConfigJSON(), null, 2)}
        WHERE id = ${acc.dbID}
        `);
    }
    await setPassword("chat." + acc.id, acc.password);
  }

  /** Also deletes all folders and messages in this account */
  static async deleteIt(account: ChatAccount) {
    assert(account.dbID, "Need account DB ID to delete");
    await (await getDatabase()).run(sql`
      DELETE FROM chatAccount
      WHERE id = ${account.dbID}
      `);
    await deletePassword("chat." + account.id);
  }

  static async read(dbID: number, acc: ChatAccount) {
    assert(dbID, "Need chat account DB ID to read it");
    let row = await (await getDatabase()).get(sql`
      SELECT
        idStr, name, protocol,
        username,
        hostname, port, tls, url,
        userRealname, workspace, configJSON
      FROM chatAccount
      WHERE id = ${dbID}
      `) as any;
    acc.dbID = dbID;
    (acc.id as any) = sanitize.alphanumdash(row.idStr);
    acc.name = sanitize.label(row.name);
    assert(acc.protocol == sanitize.alphanumdash(row.protocol), "MailAccount object of wrong type passed in");
    acc.username = sanitize.string(row.username, null);
    acc.hostname = sanitize.hostname(row.hostname, null);
    acc.port = sanitize.portTCP(row.port, null);
    acc.tls = sanitize.enum(row.tls, [TLSSocketType.Plain, TLSSocketType.TLS, TLSSocketType.STARTTLS], TLSSocketType.Unknown);
    acc.url = sanitize.url(row.url, null);
    acc.userRealname = sanitize.label(row.userRealname, appGlobal.me.name);
    acc.fromConfigJSON(sanitize.json(row.configJSON, {}));
    acc.workspace = getWorkspaceByID(sanitize.string(row.workspaceID, null));
    acc.password = await getPassword("chat." + acc.id);
    acc.storage = new SQLChatStorage();
    if (!appGlobal.me.name && acc.userRealname) {
      appGlobal.me.name = acc.userRealname;
    }
    return acc;
  }

  static async readAll(): Promise<ArrayColl<ChatAccount>> {
    let rows = await (await getDatabase()).all(sql`
      SELECT
        id, protocol
      FROM chatAccount
      `) as any;
    let accounts = new ArrayColl<ChatAccount>();
    for (let row of rows) {
      try {
        let account = newChatAccountForProtocol(row.protocol);
        await SQLChatAccount.read(row.id, account);
        accounts.add(account);
      } catch (ex) {
        backgroundError(ex);
      }
    }
    return accounts;
  }
}
