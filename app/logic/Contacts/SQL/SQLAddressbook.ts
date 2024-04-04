import type { Addressbook } from "../Addressbook";
import { getDatabase } from "./SQLDatabase";
import { newAddressbookForProtocol } from "../AccountsList/Addressbooks";
import { appGlobal } from "../../app";
import { backgroundError } from "../../../frontend/Util/error";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assert } from "../../util/util";
import { ArrayColl } from "svelte-collections";
import sql from "../../../../lib/rs-sqlite";

export class SQLAddressbook {
  static async save(acc: Addressbook) {
    if (!acc.dbID) {
      let existing = await (await getDatabase()).get(sql`
        SELECT
          id
        FROM addressbook
        WHERE
          idStr = ${acc.id}
        `) as any;
      if (existing?.id) {
        acc.dbID = existing.id;
      }
    }
    if (!acc.dbID) {
      // TODO save password separately
      let insert = await (await getDatabase()).run(sql`
        INSERT INTO addressbook (
          idStr, name, protocol, url, username,
          userRealname, workspace
        ) VALUES (
          ${acc.id}, ${acc.name}, ${acc.protocol}, ${acc.url}, ${acc.username},
          ${acc.userRealname}, ${acc.workspace}
        )`);
      acc.dbID = insert.lastInsertRowid;
    } else {
      await (await getDatabase()).run(sql`
        UPDATE addressbook SET
          name = ${acc.name}, url = ${acc.url}, username = ${acc.username},
          userRealname = ${acc.userRealname}, workspace = ${acc.workspace}
        WHERE id = ${acc.dbID}
        `);
    }
  }

  /** Also deletes all persons and groups in this address book */
  static async deleteIt(account: Addressbook) {
    assert(account.dbID, "Need addressbook DB ID to delete");
    await (await getDatabase()).run(sql`
      DELETE FROM addressbook
      WHERE id = ${account.dbID}
      `);
  }

  static async read(dbID: number, acc: Addressbook) {
    assert(dbID, "Need addressbook DB ID to read it");
    let row = await (await getDatabase()).get(sql`
      SELECT
        idStr, name, protocol, url, username,
        userRealname, workspace
      FROM addressbook
      WHERE id = ${dbID}
      `) as any;
    acc.dbID = dbID;
    (acc.id as any) = sanitize.alphanumdash(row.idStr);
    acc.name = sanitize.label(row.name);
    assert(acc.protocol == sanitize.alphanumdash(row.protocol), "Addressbook object of wrong type passed in");
    acc.username = sanitize.stringOrNull(row.username);
    acc.url = row.url ? sanitize.url(row.url) : null;
    acc.userRealname = sanitize.label(row.userRealname);
    acc.workspace = row.workspace
      ? appGlobal.workspaces.find(w => w.id == sanitize.string(row.workspace))
      : null;
    return acc;
  }

  static async readAll(): Promise<ArrayColl<Addressbook>> {
    let rows = await (await getDatabase()).all(sql`
      SELECT
        id, protocol
      FROM addressbook
      `) as any;
    let accounts = new ArrayColl<Addressbook>();
    for (let row of rows) {
      try {
        let account = newAddressbookForProtocol(row.protocol);
        await SQLAddressbook.read(row.id, account);
        accounts.add(account);
      } catch (ex) {
        backgroundError(ex);
      }
    }
    return accounts;
  }
}
