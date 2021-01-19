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
   * @param newFolder {Function(name, fullPath, account, parentFolder)} creates a folder object corresponding to the account
   */
  constructor(baseAccount, newFolder) {
    assert(baseAccount instanceof MailAccount)
    assert(typeof(newFolder) == "function");
    super(baseAccount.accountID);
    this._baseAccount = baseAccount;
    this._newFolder = newFolder;

    this._inbox = null;
    this._listenerSourceUs = false;
  }

  async init() {
    this._database = await openDatabase(); // from mail-sql.js
    await this.findFolders();
  }

  get emailAddress() {
    return this._baseAccount.emailAddress;
  }

  /**
   * {SQLFolder}
   */
  get inbox() {
    return this._inbox;
  }

  async findFolders() {
    let folders = await this._database.listFolders(this._baseAccount, this._newFolder);
    this._listenerSourceUs = true;
    for (let folder of folders) {
      this._folders.set(folder.fullPath, folder);
      if (folder.name.toUpperCase() == "INBOX" && !folder.parentFolder) {
        this._inbox = folder;
      }
    }
    this._listenerSourceUs = false;

    // TODO check new folders on server
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
