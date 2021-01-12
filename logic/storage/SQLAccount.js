import { assert } from "../../util/util";
import MailAccount from "../mail/MailAccount";
import MsgFolder from "../account/MsgFolder";
import MailSQLDatabase, { getDatabase, openDatabase } from "../storage/mail-sql";

/**
 * Caches an Account in MailSQLDatabase
 */
export default class SQLAccount extends MailAccount {
  /**
   * @param baseAccount {MailAccount} The account which this SQLAccount is caching
   * @param FolderSubtype {Subclass of MsgFolder} The MsgFolder class corresponding to baseAccount, e.g. IMAPFolder
   */
  constructor(baseAccount, FolderSubtype) {
    super(baseAccount.accountID);
    this.baseAccount = baseAccount;
    this._FolderSubtype = FolderSubtype;
    this._listenerSourceUs = false;
    this._database = getDatabase(null);
  }

  static async init() {
    await openDatabase();
  }

  /**
   * Listen to changes in folder and write them to the DB.
   */
  watch(folders) {
    folders.registerObserver({
      added: async folders => this.addFolders(folders),
      removed: async folders => this.removeFolders(folders),
    });
  }

  async findFolders() {
    let folders = await this._database.listFolders(this.baseAccount, this._FolderSubtype);
    this._listenerSourceUs = true;
    for (let folder of folders) {
      this._folders.set(folder.fullPath, folder);
    }
    this._listenerSourceUs = false;
  }

  /**
   * @param folders {Array of MsgFolder}
   */
  async addFolders(folders) {
    try {
      if (this._listenerSourceUs) {
        return;
      }
      for (let folder of folders) {
        await this._database.addFolder(folder);
      }
    } catch (ex) {
      console.error(ex);
    }
  }

  /**
   * @param folders {Array of EMail}
   */
  async removeFolders(folders) {
    try {
      if (this._listenerSourceUs) {
        return;
      }
      for (let folder of folders) {
        await this._database.deleteFolder(folder);
      }
    } catch (ex) {
      console.error(ex);
    }
  }
}
