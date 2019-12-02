import { assert } from "../../util/util";
import MsgFolder from "../account/MsgFolder";
import RFC822Mail from "../mail/MIME";
import MailSQLDatabase from "../storage/mail-sql";


/**
 * Caches a MsgFolder in MailSQLDatabase
 */
export default class SQLFolder extends MsgFolder {
  constructor(baseFolder) {
    assert(baseFolder instanceof MsgFolder);
    super(baseFolder.name, baseFolder.fullPath, baseFolder.account);

    this.baseFolder = baseFolder;
    this._listenerSourceUs = false;
    this._database = getDatabase(null);
    this._addedFolder = false;
  }

  /**
   * Listen to changes in folder and write them to the DB.
   */
  watch(messages, subfolders) {
    messages.registerObserver({
      added: async msgs => this.addMessages(msgs),
      removed: async msgs => this.removeMessages(msgs),
    })
    subfolders.registerObserver({
      added: async folders => this.addFolders(folders),
      removed: async folders => this.removeFolders(folders),
    })
  }

  /**
   * Gets the cached messages and subfolders from the database.
   * Writes the result into this.messages.
   *
   * The calling baseFolder may use this.messages as its own,
   * so that this.baseFolder.messages === this.messages,
   * but that's up the caller.
   */
  async fetch() {
    // TODO get subfolder list
    let msgs = await this._database.listMessagesInFolder(this.baseFolder);
    this._listenerSourceUs = true;
    for (let msg of msgs) {
      this._messages.set(msg.msgID, msg);
    }
    this._listenerSourceUs = false;
  }

  /**
   * @param msgs {Array of RFC822Mail}
   */
  async addMessages(msgs) {
    try {
      if (!this._addedFolder) { // HACK
        await this._database.addFolder(this);
      }
      if (this._listenerSourceUs) {
        return;
      }
      for (let msg of msgs) {
        await this._database.saveMessage(this.baseFolder, msg);
      }
    } catch (ex) {
      console.error(ex);
    }
  }

  /**
   * @param msgs {Array of RFC822Mail}
   */
  async removeMessages(msgs) {
    try {
      if (this._listenerSourceUs) {
        return;
      }
      for (let msg of msgs) {
        await this._database.deleteMessage(this.baseFolder, msg);
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
   * @param folders {Array of RFC822Mail}
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

// for getDatabase() and openDatabase() only
var gDatabase;

/**
 * @param account {Account} (Optional)
 *     if null, use global databse.
 * @returns {MailSQLDatabase}
 */
function getDatabase(account) {
  assert(gDatabase, "You need to call openDatabase() first and wait for it");
  return gDatabase;
}

/**
 * @param account {Account} (Optional)
 *     if null, use global databse.
 * @returns {MailSQLDatabase}
 */
export async function openDatabase(account) {
  if (gDatabase) {
    return gDatabase;
  }
  let baseDir = getAppDir()
  gDatabase = new MailSQLDatabase();
  await gDatabase.init(account, baseDir);
}
