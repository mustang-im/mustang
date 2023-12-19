import { assert } from "../../util/util";
import MsgFolder from "../account/MsgFolder";
import { getDatabase } from "../storage/mail-sql";


/**
 * Caches a MsgFolder in MailSQLDatabase
 */
export default class SQLFolder extends MsgFolder {
  /**
   * @param baseFolder {MsgFolder} The corresponding folder that this one caches, e.g. IMAPFolder
   * @param newEMail {Function(folder)} creates an email object corresponding to the account
   */
  constructor(baseFolder, newEMail) {
    assert(baseFolder instanceof MsgFolder);
    assert(typeof (newEMail) == "function");
    super(baseFolder.name, baseFolder.fullPath, baseFolder.account);

    this._newEMail = newEMail;
    this._listenerSourceUs = false;
    this._database = getDatabase(null);
    this._addToDB().catch(console.error);
  }

  async _addToDB() {
    if (!this._addedFolder) {
      await this._database.addFolder(this);
      this._addedFolder = true;
    }
  }

  /**
   * Gets the cached messages and subfolders from the database.
   * Writes the result into this.messages.
   */
  async fetch() {
    // TODO get subfolder list
    let msgs = await this._database.listMessagesInFolder(this, this._newEMail);
    this._listenerSourceUs = true;
    for (let msg of msgs) {
      this._messages.set(msg.msgID, msg);
    }
    this._listenerSourceUs = false;
  }

  /**
   * @param msgs {Array of EMail}
   */
  async addMessages(msgs) {
    try {
      if (this._listenerSourceUs) {
        return;
      }
      if (!this._addedFolder) {
        await this._addToDB();
      }
      for (let msg of msgs) {
        await this._database.saveMessage(this, msg);
      }
    } catch (ex) {
      console.error(ex);
    }
  }

  /**
   * @param msgs {Array of EMail}
   */
  async removeMessages(msgs) {
    try {
      if (this._listenerSourceUs) {
        return;
      }
      for (let msg of msgs) {
        await this._database.deleteMessage(this, msg);
      }
    } catch (ex) {
      console.error(ex);
    }
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
