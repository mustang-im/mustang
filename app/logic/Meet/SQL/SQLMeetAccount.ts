// SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>
//
// SPDX-License-Identifier: EUPL-1.2

import type { MeetAccount } from "../MeetAccount";
import { getDatabase } from "./SQLDatabase";
import { newMeetAccountForProtocol } from "../AccountsList/MeetAccounts";
import { getPassword, setPassword, deletePassword } from "../../Auth/passwordStore";
import { appGlobal } from "../../app";
import { backgroundError } from "../../../frontend/Util/error";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assert } from "../../util/util";
import { ArrayColl } from "svelte-collections";
import sql from "../../../../lib/rs-sqlite";

export class SQLMeetAccount {
  static async save(acc: MeetAccount) {
    if (!acc.dbID) {
      let existing = await (await getDatabase()).get(sql`
        SELECT
          id
        FROM meetAccount
        WHERE
          idStr = ${acc.id}
        `) as any;
      if (existing?.id) {
        acc.dbID = existing.id;
      }
    }
    if (!acc.dbID) {
      let insert = await (await getDatabase()).run(sql`
        INSERT INTO meetAccount (
          idStr, name, protocol, url, username,
          workspace
        ) VALUES (
          ${acc.id}, ${acc.name}, ${acc.protocol}, ${acc.url}, ${acc.username},
          ${acc.workspace?.id}
        )`);
      acc.dbID = insert.lastInsertRowid;
    } else {
      await (await getDatabase()).run(sql`
        UPDATE meetAccount SET
          name = ${acc.name}, url = ${acc.url}, username = ${acc.username},
          workspace = ${acc.workspace?.id}
        WHERE id = ${acc.dbID}
        `);
    }
    await setPassword("chat." + acc.id, acc.password);
  }

  /** Also deletes all persons and groups in this address book */
  static async deleteIt(acc: MeetAccount) {
    assert(acc.dbID, "Need meet account DB ID to delete");
    await (await getDatabase()).run(sql`
      DELETE FROM meetAccount
      WHERE id = ${acc.dbID}
      `);
    await deletePassword("meet." + acc.id);
  }

  static async read(dbID: number, acc: MeetAccount) {
    assert(dbID, "Need meet account DB ID to read it");
    let row = await (await getDatabase()).get(sql`
      SELECT
        idStr, name, protocol, url, username,
        workspace
      FROM meetAccount
      WHERE id = ${dbID}
      `) as any;
    acc.dbID = dbID;
    (acc.id as any) = sanitize.alphanumdash(row.idStr);
    acc.name = sanitize.label(row.name);
    assert(acc.protocol == sanitize.alphanumdash(row.protocol), "Meet account object of wrong type passed in");
    acc.username = sanitize.string(row.username, null);
    acc.url = sanitize.url(row.url, null);
    acc.workspace = row.workspace
      ? appGlobal.workspaces.find(w => w.id == sanitize.string(row.workspace, null))
      : null;
    acc.password = await getPassword("chat." + acc.id);
    acc.storage = new SQLMeetAccount();
    return acc;
  }

  static async readAll(): Promise<ArrayColl<MeetAccount>> {
    let rows = await (await getDatabase()).all(sql`
      SELECT
        id, protocol
      FROM meetAccount
      `) as any;
    let accounts = new ArrayColl<MeetAccount>();
    for (let row of rows) {
      try {
        let account = newMeetAccountForProtocol(row.protocol);
        await SQLMeetAccount.read(row.id, account);
        accounts.add(account);
      } catch (ex) {
        backgroundError(ex);
      }
    }
    return accounts;
  }
}
