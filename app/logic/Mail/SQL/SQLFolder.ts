import { Folder, type SpecialFolder } from "../Folder";
import type { IMAPFolder } from "../IMAP/IMAPFolder";
import type { MailAccount } from "../MailAccount";
import { getDatabase } from "./SQLDatabase";
import { appGlobal } from "../../app";
import { ArrayColl } from "svelte-collections";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assert } from "../../util/util";
import sql from "../../../../lib/rs-sqlite";

export class SQLFolder extends Folder {
  static async save(folder: Folder) {
    // `INSERT id = null` will fill the `id` with a new ID value. `id` is a an alias for `rowid`.
    let insert = await (await getDatabase()).run(sql`
      INSERT OR REPLACE INTO folder (
        id, accountID, name, path,
        parent, specialUse,
        countTotal, countUnread, countNewArrived,
        uidvalidity, lastSeen
      ) VALUES (
        ${folder.dbID}, ${folder.account.dbID}, ${folder.name}, ${folder.path},
        ${folder.parent?.dbID}, ${folder.specialFolder},
        ${folder.countTotal}, ${folder.countUnread}, ${folder.countNewArrived},
        ${folder.uidvalidity}, ${folder.lastSeen}
      )`);
    folder.dbID = insert.lastInsertRowid;
    await (await getDatabase()).run(sql`
      UPDATE folder SET
        countTotal = ${folder.countTotal},
        countUnread = ${folder.countUnread},
        countNewArrived = ${folder.countNewArrived},
        uidvalidity = ${folder.uidvalidity},
        lastSeen = ${folder.lastSeen}
      WHERE id = ${folder.dbID}
      `);
  }

  static async read(dbID: number, folder: Folder): Promise<Folder> {
    let row = await (await getDatabase()).get(sql`
      SELECT
        accountID, name, path, parent,
        countTotal, countUnread, countNewArrived,
        specialUse, uidvalidity, lastSeen
      FROM folder
      WHERE id = ${dbID}
      `) as any;
    folder.dbID = sanitize.integer(dbID);
    folder.name = sanitize.label(row.name);
    folder.path = sanitize.label(row.path);
    folder.countTotal = sanitize.integer(row.countTotal);
    folder.countUnread = sanitize.integer(row.countUnread);
    folder.countNewArrived = sanitize.integer(row.countNewArrived);
    folder.specialFolder = sanitize.alphanumdash(row.specialUse) as SpecialFolder;
    (folder as any as IMAPFolder).uidvalidity = sanitize.integer(row.uidvalidity ?? 0);
    (folder as any as IMAPFolder).lastSeen = sanitize.integer(row.lastSeen ?? 0);
    let accountID = sanitize.integer(row.accountID);
    folder.account = appGlobal.emailAccounts.find(acc => acc.dbID == accountID);
    assert(folder.account, `Account ${accountID} not yet loaded`);
    if (row.parent) {
      let parentFolderID = sanitize.integer(row.parent);
      folder.parent = folder.account.findFolder(folder => folder.dbID == parentFolderID);
      assert(folder.parent, `Parent folder ${parentFolderID} not found`);
    }
    return folder;
  }

  /** @returns the root folders */
  static async readAllHierarchy(account: MailAccount): Promise<ArrayColl<Folder>> {
    let rows = await (await getDatabase()).all(sql`
      SELECT
        id, parent
      FROM folder
      WHERE accountID = ${account.dbID}
      `) as any;
    async function readSubFolders(parentFolderID: number | null, resultFolders: ArrayColl<Folder>) {
      for (let row of rows.filter(r => r.parent == parentFolderID)) {
        let folder = account.newFolder();
        await SQLFolder.read(row.id, folder);
        resultFolders.add(folder);
        await readSubFolders(folder.dbID, folder.subFolders);
      }
    }
    let rootFolders = new ArrayColl<Folder>();
    await readSubFolders(null, rootFolders);
    return rootFolders;
  }
}