import { Folder } from "../Folder";
import type { MailAccount } from "../MailAccount";
import { JSONFolder } from "../JSON/JSONFolder";
import { getDatabase } from "./AceDatabase";
import type { Collection } from "svelte-collections";
import { assert } from "../../util/util";

export class AceFolder extends Folder {
  static readonly refBranch = "mail/folder";
  static ref(folder: Folder): string {
    assert(folder.dbID, "Need folder.dbID");
    return this.refBranch + "/" + folder.dbID;
  }

  static async save(folder: Folder) {
    let json = JSONFolder.save(folder);
    let db = await getDatabase();
    if (!folder.dbID) {
      let keys = await db.queryKey(this.refBranch,
        [
          { column: "id", op: "==", value: folder.id },
          { column: "accountID", op: "==", value: folder.account.id },
        ]
      )
      folder.dbID = keys[0];
    }
    if (folder.dbID) {
      await db.set(this.ref(folder), json);
    } else {
      folder.dbID = await db.push(this.refBranch, json);
    }
  }

  static async saveProperties(folder: Folder) {
    let json: any = {};
    let db = await getDatabase();
    await db.update(this.ref(folder), json);
  }

  /** Also deletes all messages in this folder */
  static async deleteIt(folder: Folder) {
    let db = await getDatabase();
    await db.remove(this.ref(folder));
  }

  static async read(dbID: number, folder: Folder): Promise<Folder> {
    assert(dbID, "Need account ID to read it");
    let db = await getDatabase();
    let json = await db.get(this.ref(folder));
    JSONFolder.read(folder, json);
    return folder;
  }

  /** @returns the root folders */
  static async readAllHierarchy(account: MailAccount): Promise<void> {
    let db = await getDatabase();
    let rows = await db.query(
      this.refBranch,
      [{ column: 'accountID', op: '==', value: account.id }],
      {});
    async function readSubFolders(parentFolderID: string | null, resultFolders: Collection<Folder>) {
      for (let row of rows.filter(r => r.parentID == parentFolderID)) {
        if (account.findFolder(folder => folder.id == row.id)) {
          continue;
        }
        let folder = account.newFolder();
        JSONFolder.read(folder, row);
        resultFolders.add(folder);
        await readSubFolders(folder.id, folder.subFolders);
      }
    }
    await readSubFolders(null, account.rootFolders);
  }
}
