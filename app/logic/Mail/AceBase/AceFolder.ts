import { Folder } from "../Folder";
import type { MailAccount } from "../MailAccount";
import { JSONFolder } from "../JSON/JSONFolder";
import { getDatabase } from "./AceDatabase";
import { appGlobal } from "../../app";
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
    if (folder.dbID) {
      await appGlobal.remoteApp.aceSet(await getDatabase(), this.ref(folder), json);
    } else {
      folder.dbID = await appGlobal.remoteApp.acePush(await getDatabase(), this.refBranch, json);
    }
  }

  static async saveProperties(folder: Folder) {
    let json: any = {};
    await appGlobal.remoteApp.aceUpdate(await getDatabase(), this.ref(folder), json);
  }

  /** Also deletes all messages in this folder */
  static async deleteIt(folder: Folder) {
    await appGlobal.remoteApp.aceRemove(await getDatabase(), this.ref(folder));
  }

  static async read(dbID: number, folder: Folder): Promise<Folder> {
    assert(dbID, "Need account ID to read it");
    let json = await appGlobal.remoteApp.aceGet(await getDatabase(), this.ref(folder));
    JSONFolder.read(folder, json);
    return folder;
  }

  /** @returns the root folders */
  static async readAllHierarchy(account: MailAccount): Promise<void> {
    let rows = await appGlobal.remoteApp.aceQuery(await getDatabase(),
      this.refBranch,
      [{ column: 'accountID', op: '==', value: account.id }]);
    async function readSubFolders(parentFolderID: string | null, resultFolders: Collection<Folder>) {
      for (let row of rows.filter(r => r.parent == parentFolderID)) {
        if (account.findFolder(folder => folder.dbID == row.id)) {
          continue;
        }
        let folder = account.newFolder();
        await JSONFolder.read(folder, row);
        resultFolders.add(folder);
        await readSubFolders(folder.id, folder.subFolders);
      }
    }
    await readSubFolders(null, account.rootFolders);
  }
}
