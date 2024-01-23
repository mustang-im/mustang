import MailDatabase from "./mail-database";
import MsgFolder from "../account/MsgFolder";
import EMail from "../mail/EMail";
import { getAppDir, assert } from "../../util/util";
import sqlite from "sqlite";
import sqlite3 from "sqlite3";
import SQL from "sql-template-strings";

/**
 * Keeps metadata about emails in a SQLite database.
 */
export default class MailSQLDatabase extends MailDatabase {
  constructor() {
    super();
    this._db = null;
  }

  /**
   * Must be called before the other functions.
   *
   * @param account {MailAccount} (Optional) Pass null, if you want the same DB for all accounts.
   * @param baseDir {string} The base directory where all messages should be stored.
   *    This does not depend on the account. The store implementation will create
   *    subdirectories for the account and folders as appropriate.
   *    The baseDir must already exist as directory on disk.
   *    The sub dirs will be created automatically.
   * @param options {object} other store-specific options
   */
  async init(account, baseDir, options) {
    await super.init(account, baseDir, options);
    let filename = baseDir + "email-database.sqlite";
    console.log("Mail database", filename);
    this._db = await sqlite.open({ filename, driver: sqlite3.Database });
    await this._db.migrate({
      migrationsPath: __dirname + "/mail-sql/",
    });
  }

  /**
   * Saves a folder to the database.
   *
   * @param folder {MsgFolder}
   */
  async addFolder(folder) {
    assert(folder instanceof MsgFolder, "need folder");
    await this._db.run(SQL`INSERT OR IGNORE INTO folder (name, fullPath, parentPath, accountID) VALUES (${folder.name}, ${folder.fullPath}, ${folder.parentFolder ? folder.parentFolder.fullPath : null}, ${folder.account.accountID})`);
  }

  /**
   * Deletes a folder from the database.
   *
   * @param folder {MsgFolder}
   */
  async deleteFolder(folder) {
    assert(folder instanceof MsgFolder, "need folder");
    await this._db.run(SQL`DELETE FROM folder WHERE name = ${folder.name} AND fullPath = ${folder.fullPath} AND accountID = ${folder.account.accountID}`);
    // TODO body
  }

  /**
   * Saves an email to the database.
   *
   * @param folder {MsgFolder}
   * @param msg {EMail}
   */
  async saveMessage(folder, msg) {
    assert(folder instanceof MsgFolder, "need folder");
    assert(msg instanceof EMail, "Need email");
    if (!folder._dbID) {
      folder._dbID = (await this._db.get(SQL`SELECT id FROM folder WHERE fullPath = ${folder.fullPath} AND accountID = ${folder.account.accountID} LIMIT 1`)).id;
    }
    let fromID;
    await this._db.run(SQL`INSERT OR IGNORE INTO person (emailAddress, name) VALUES (${msg.authorEmailAddress}, ${msg.authorRealname})`); // TODO update realname, if it was empty
    let fromResult = await this._db.get(SQL`SELECT id FROM person WHERE emailAddress = ${msg.authorEmailAddress}`);
    if (fromResult) {
      fromID = fromResult.id;
    }
    let toID;
    await this._db.run(SQL`INSERT OR IGNORE INTO person (emailAddress, name) VALUES (${msg.recipientEmailAddress}, ${msg.recipientRealname})`);
    let toResult = await this._db.get(SQL`SELECT id FROM person WHERE emailAddress = ${msg.recipientEmailAddress}`);
    if (toResult) {
      toID = toResult.id;
    }
    await this._db.run(SQL`INSERT OR IGNORE INTO email (folder, msgID, parentMsgID, UID, firstFrom, firstTo, subject, dateSent, dateReceived) VALUES (${folder._dbID}, ${msg.msgID}, ${msg.parentMsgID}, ${msg.UID}, ${fromID}, ${toID}, ${msg.subject}, ${msg.date}, ${Date.now()})`);

    // Body
    if (msg.haveBody) {
      let plaintext = await msg.bodyPlaintext();
      await this._db.run(SQL`INSERT OR IGNORE INTO emailBody (folder, UID, plaintext) VALUES (${folder._dbID}, ${msg.UID}, ${plaintext})`);
    }
  }

  /**
   * Deletes an old email from the database.
   *
   * @param folder {MsgFolder}
   * @param msg {EMail}
   */
  async deleteMessage(folder, msg) {
    assert(folder instanceof MsgFolder, "need folder");
    assert(msg instanceof EMail, "need email");
    await this._db.run(SQL`DELETE FROM email WHERE msgID = ${msg.msgID} AND folder = (SELECT id AND UID = ${msg.UID} FROM folder WHERE fullPath = ${folder.fullPath} AND accountID = ${folder.account.accountID} LIMIT 1)`);
    // TODO body
  }

  /**
   * Returns all known folder.
   *
   * @param account {Account} e.g. IMAPAccount
   * @param newFolder {Function(name, fullPath, account, parentFolder)} creates a folder object corresponding to the account
   * @returns {Array of MsgFolder}
   */
  async listFolders(account, newFolder) {
    let results = await this._db.all(SQL`SELECT id, name, fullPath, parentPath, accountID FROM folder WHERE accountID = ${account.accountID}`);
    let folders = results.map(result => {
      let folder = newFolder(result.name, result.fullPath, account, null);
      folder._parentPath = result.parentPath;
      return folder;
    });
    // create hierarchy
    for (let folder of folders) {
      if (folder._parentPath) {
        folder.parentFolder = folders.find(f => f.fullPath == folder._parentPath);
        folder.parentFolder.folders.add(folder);
      }
      delete folder._parentPath;
    }
    return folders;
  }
  /**
   * Returns all known emails in a folder.
   *
   * @param folder {MsgFolder}
   * @param newEMail {Function(folder)} creates an email object corresponding to the account
   * @returns {Array of EMail}
   */
  async listMessagesInFolder(folder, newEMail) {
    assert(folder instanceof MsgFolder, "need folder");
    if (!folder._dbID) {
      let result = await this._db.get(SQL`SELECT id FROM folder WHERE fullPath = ${folder.fullPath} AND accountID = ${folder.account.accountID} LIMIT 1`);
      if (result) {
        folder._dbID = result.id;
      } else {
        return [];
      };
    }
    let results = await this._db.all(SQL`SELECT UID, msgID, parentMsgID, subject, dateSent, dateReceived, fromT.emailAddress as fromEmailAddress, fromT.name as fromName, toT.emailAddress as toEmailAddress, toT.name as toName FROM email LEFT JOIN person AS fromT ON firstFrom = fromT.id LEFT JOIN person AS toT ON firstTo = toT.id WHERE folder = ${folder._dbID}`);
    return results.map(result => {
      let email = newEMail(folder);
      email.UID = result.UID;
      email.msgID = result.msgID;
      email.subject = result.subject;
      email.date = new Date(result.dateSent);
      email.dateReceived = new Date(result.dateReceived);
      email.authorEmailAddress = result.fromEmailAddress;
      email.authorRealname = result.fromName;
      email.recipientEmailAddress = result.toEmailAddress;
      email.recipientRealname = result.toName;
      (async () => {
        try {
          let body = await this._db.get(SQL`SELECT plaintext, html FROM emailBody WHERE folder = ${folder._dbID} and UID = ${email.UID} LIMIT 1`);
          if (body) {
            email._bodyPlaintext = body.plaintext;
            email._bodyHTML = body.html;
          }
        } catch (ex) {
          console.error(ex);
        }
      })();
      return email;
    });
  }
}


// for getDatabase() and openDatabase() only
var gDatabase;

/**
 * @param account {Account} (Optional)
 *     if null, use global databse.
 * @returns {MailSQLDatabase}
 */
export function getDatabase(account) {
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
  return gDatabase;
}
