import { Folder, type SpecialFolder } from "../Folder";
import type { IMAPFolder } from "../IMAP/IMAPFolder";
import type { MailAccount } from "../MailAccount";
import { getDatabase } from "./SQLDatabase";
import type { Collection } from "svelte-collections";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assert } from "../../util/util";
import sql from "../../../../lib/rs-sqlite";

export class SQLFolder extends Folder {
  static async save(folder: Folder) {
    let lock = await folder.storageLock.lock();
    try {
      if (!folder.dbID) {
        let existing = await (await getDatabase()).get(sql`
          SELECT
            id
          FROM folder
          WHERE
            path = ${folder.id} AND
            accountID = ${folder.account.dbID}
          `) as any;
        if (existing?.id) {
          folder.dbID = existing.id;
        }
      }
      if (!folder.dbID) {
        let insert = await (await getDatabase()).run(sql`
          INSERT INTO folder(
            accountID, name, path,
            parent, specialUse
          ) VALUES(
            ${folder.account.dbID}, ${folder.name}, ${folder.id},
            ${folder.parent?.dbID}, ${folder.specialFolder}
          )`);
        folder.dbID = insert.lastInsertRowid;
      } else {
        await (await getDatabase()).run(sql`
          UPDATE folder SET
            name = ${folder.name}, path = ${folder.id},
            parent = ${folder.parent?.dbID}, specialUse = ${folder.specialFolder}
          WHERE id = ${folder.dbID}
          `);
      }

      await this.saveProperties(folder, false);

    } finally {
      lock.release();
    }
  }

  static async saveProperties(folder: Folder, doLock = true) {
    let lock = doLock ? await folder.storageLock.lock() : null;
    try {
      await (await getDatabase()).run(sql`
        UPDATE folder SET
          countTotal = ${folder.countTotal},
          countUnread = ${folder.countUnread},
          countNewArrived = ${folder.countNewArrived},
          uidvalidity = ${(folder as IMAPFolder).uidvalidity},
          syncState = ${folder.syncState}
        WHERE id = ${folder.dbID}
        `);
    } finally {
      lock?.release();
    }
  }

  /** Also deletes all messages in this folder */
  static async deleteIt(folder: Folder) {
    assert(folder.dbID, "Need folder DB ID to delete");
    let lock = await folder.storageLock.lock();
    try {
      let dbID = folder.dbID;
      folder.dbID = null;
      await (await getDatabase()).run(sql`
        DELETE FROM folder
        WHERE id = ${dbID}
        `);
    } finally {
      lock.release();
    }
  }

  static async read(dbID: number, folder: Folder): Promise<Folder> {
    assert(folder.account, `Account not set for folder`);
    let row = await (await getDatabase()).get(sql`
      SELECT
        accountID, name, path, parent,
        countTotal, countUnread, countNewArrived,
        specialUse, uidvalidity, syncState
      FROM folder
      WHERE id = ${dbID}
      `) as any;
    folder.dbID = sanitize.integer(dbID);
    folder.name = sanitize.label(row.name);
    folder.id = sanitize.label(row.path);
    folder.countTotal = sanitize.integer(row.countTotal, 0);
    folder.countUnread = sanitize.integer(row.countUnread, 0);
    folder.countNewArrived = sanitize.integer(row.countNewArrived, 0);
    folder.specialFolder = sanitize.alphanumdash(row.specialUse, null) as SpecialFolder;
    (folder as any as IMAPFolder).uidvalidity = sanitize.integer(row.uidvalidity, 0);
    folder.syncState = typeof(row.syncState) == "number"
      ? sanitize.integer(row.syncState, null)
      : sanitize.string(row.syncState, null);
    let accountID = sanitize.integer(row.accountID);
    assert(folder.account.dbID == accountID, "Folder: Account does not match");
    if (row.parent) {
      let parentFolderID = sanitize.integer(row.parent);
      folder.parent = folder.account.findFolder(folder => folder.dbID == parentFolderID);
      assert(folder.parent, `Parent folder ${parentFolderID} not found`);
    }
    return folder;
  }

  /** @returns the root folders */
  static async readAllHierarchy(account: MailAccount): Promise<void> {
    let rows = await (await getDatabase()).all(sql`
      SELECT
        id, parent
      FROM folder
      WHERE accountID = ${account.dbID}
      `) as any;
    async function readSubFolders(parentFolderID: number | string | null, resultFolders: Collection<Folder>) {
      for (let row of rows.filter(r => r.parent == parentFolderID)) {
        if (account.findFolder(folder => folder.dbID == row.id)) {
          continue;
        }
        let folder = account.newFolder();
        await SQLFolder.read(row.id, folder);
        resultFolders.add(folder);
        await readSubFolders(folder.dbID, folder.subFolders);
      }
    }
    await readSubFolders(null, account.rootFolders);
  }
}
