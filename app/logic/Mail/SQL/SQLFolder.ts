import { Folder, type SpecialFolder } from "../Folder";
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
    await (await getDatabase()).run(sql`
      INSERT OR REPLACE INTO folder (
        id, accountID, name, path, parent, specialUse,
        countTotal, countUnread, countNewArrived,
        uidvalidity, lastSeen
      ) VALUES (
        ${folder.dbID}, ${folder.account.dbID}, ${folder.name}, ${folder.path}, ${folder.parent?.dbID},
        ${folder.countTotal}, ${folder.countUnread}, ${folder.countNewArrived},
        ${folder.specialFolder}, ${folder.uidvalidity}, ${folder.lastSeen}
      )`);
    await (await getDatabase()).run(sql`
      UPDATE folder SET
        countTotal = ${folder.countTotal},
        countUnread = ${folder.countUnread},
        countNewArrived = ${folder.countNewArrived},
        uidvalidity = ${folder.uidvalidity},
        lastSeen = ${folder.lastSeen}
      WHERE id = ${this.dbID}
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
    folder.countTotal = sanitize.integer(row.countTotal);
    folder.countUnread = sanitize.integer(row.countUnread);
    folder.countNewArrived = sanitize.integer(row.countNewArrived);
    folder.specialFolder = sanitize.alphanumdash(row.specialUse) as SpecialFolder;
    folder.uidvalidity = sanitize.integer(row.uidvalidity);
    folder.lastSeen = sanitize.integer(row.lastSeen);
    let accountID = sanitize.integer(row.accountID);
    folder.account = appGlobal.emailAccounts.find(acc => acc.dbID == accountID);
    assert(folder.account, `Account ${accountID} not yet loaded`);
    let parentFolderID = sanitize.integer(row.parent);
    if (parentFolderID) {
      folder.parent = folder.account.findFolder(folder => folder.dbID == parentFolderID);
      assert(folder.parent, `Parent folder ${parentFolderID} not found`);
    }
    return folder;
  }

  /** @returns the root folders */
  static async readAllHierarchy(account: MailAccount): Promise<ArrayColl<Folder>> {
    let rows = await (await getDatabase()).all(sql`
      SELECT
        id, parentFolderID
      FROM folder
      WHERE accountID = ${account.dbID}
      `) as any;
    function readSubFolders(parentFolderID: number | null, resultFolders: ArrayColl<Folder>) {
      for (let row of rows.filter(r => r.parentFolderID = parentFolderID)) {
        let folder = new Folder(account);
        this.read(row.id, folder);
        resultFolders.add(folder);
        readSubFolders(folder.dbID, folder.subFolders);
      }
    }
    let rootFolders = new ArrayColl<Folder>();
    readSubFolders(null, rootFolders);
    return rootFolders;
  }
}
