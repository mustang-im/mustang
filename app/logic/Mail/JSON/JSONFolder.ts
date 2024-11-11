import { Folder, type SpecialFolder } from "../Folder";
import type { IMAPFolder } from "../IMAP/IMAPFolder";
import type { MailAccount } from "../MailAccount";
import { appGlobal } from "../../app";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assert, ensureArray } from "../../util/util";
import type { Collection } from "svelte-collections";

export class JSONFolder extends Folder {
  static save(folder: Folder): any {
    let json: any = {};
    json.id = folder.id;
    json.name = folder.name;
    json.accountID = folder.account.id;
    json.parentID = folder.parent?.id;
    json.specialFolder = folder.specialFolder;
    this.saveProperties(folder, json);
    return json;
  }

  static saveProperties(folder: Folder, json: any) {
    json.countTotal = folder.countTotal;
    json.countUnread = folder.countUnread;
    json.countNewArrived = folder.countNewArrived;
    json.uidvalidity = (folder as any as IMAPFolder).uidvalidity;
    json.syncState = folder.syncState;
  }

  static read(folder: Folder, json: any): Folder {
    folder.id = sanitize.alphanumdash(json.id);
    folder.name = sanitize.label(json.name);
    folder.countTotal = sanitize.integer(json.countTotal, 0);
    folder.countUnread = sanitize.integer(json.countUnread, 0);
    folder.countNewArrived = sanitize.integer(json.countNewArrived, 0);
    folder.specialFolder = sanitize.alphanumdash(json.specialFolder, null) as SpecialFolder;
    if (json.uidvalidity !== undefined) {
      (folder as any as IMAPFolder).uidvalidity = sanitize.integer(json.uidvalidity, 0);
    }
    folder.syncState = typeof(json.syncState) == "number"
      ? sanitize.integer(json.syncState, null)
      : sanitize.string(json.syncState, null);
    let accountID = sanitize.alphanumdash(json.accountID);
    folder.account = appGlobal.emailAccounts.find(acc => acc.id == accountID);
    assert(folder.account, `Account ${accountID} not yet loaded`);
    if (json.parentID) {
      let parentFolderID = sanitize.alphanumdash(json.parentID);
      folder.parent = folder.account.findFolder(folder => folder.id == parentFolderID);
      assert(folder.parent, `Parent folder ${parentFolderID} not found`);
    }
    return folder;
  }

  /** @returns the root folders */
  static readAllHierarchy(account: MailAccount, jsonAll: any[]): void {
    function readSubFolders(parentFolderID: string | null, resultFolders: Collection<Folder>) {
      for (let json of ensureArray(jsonAll).filter(r => r.parent == parentFolderID)) {
        if (account.findFolder(folder => folder.id == json.id)) {
          continue;
        }
        let folder = account.newFolder();
        this.read(json.id, folder);
        resultFolders.add(folder);
        readSubFolders(folder.dbID as string | null, folder.subFolders);
      }
    }
    readSubFolders(null, account.rootFolders);
  }
}
