import MailDatabase from "./mail-database";
import MsgFolder from "../account/MsgFolder";
import EMail from "../mail/EMail";
import sqlite from "sqlite";
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
    super.init(account, baseDir, options);
    let filename =  baseDir + "email-database.sqlite";
    this._db = await sqlite.open(filename);
    await this._db.migrate({
      migrationsPath: "./logic/storage/mail-sql/",
    });
  }

  /**
   * Saves a folder to the database.
   *
   * @param folder {MsgFolder}
   */
  async addFolder(folder) {
    assert(folder instanceof MsgFolder);
    await this._db.run(SQL`INSERT OR IGNORE INTO folder (name, fullPath, accountID) VALUES (${folder.name}, ${folder.fullPath}, ${folder.account.accountID})`);
  }

  /**
   * Deletes a folder from the database.
   *
   * @param folder {MsgFolder}
   */
  async deleteFolder(folder) {
    assert(folder instanceof MsgFolder);
    await this._db.run(SQL`DELETE FROM folder WHERE name = ${folder.name} AND fullPath = ${folder.fullPath} AND accountID = ${folder.account.accountID})`);
    // TODO body
  }

  /**
   * Saves an email to the database.
   *
   * @param folder {MsgFolder}
   * @param msg {EMail}
   */
  async saveMessage(folder, msg) {
    assert(folder instanceof MsgFolder);
    assert(msg instanceof EMail);
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
    await this._db.run(SQL`INSERT OR IGNORE INTO email (folder, msgID, parentMsgID, UID, firstFrom, firstTo, subject, dateSent, dateReceived) VALUES ((SELECT id FROM folder WHERE fullPath = ${folder.fullPath} AND accountID = ${folder.account.accountID} LIMIT 1), ${msg.msgID}, ${msg.parentMsgID}, ${msg.UID}, ${fromID}, ${toID}, ${msg.subject}, ${msg.date}, ${Date.now()})`);
    // TODO body
  }

  /**
   * Deletes an old email from the database.
   *
   * @param folder {MsgFolder}
   * @param msg {EMail}
   */
  async deleteMessage(folder, msg) {
    assert(folder instanceof MsgFolder);
    assert(msg instanceof EMail);
    await this._db.run(SQL`DELETE FROM email WHERE msgID = ${msg.msgID} AND folder = (SELECT id AND UID = ${msg.UID} FROM folder WHERE fullPath = ${folder.fullPath} AND accountID = ${folder.account.accountID} LIMIT 1)`);
    // TODO body
  }

  /**
   * Returns all known emails in a folder.
   *
   * @param folder {MsgFolder}
   * @returns {Array of EMail}
   */
  async listMessagesInFolder(folder) {
    assert(folder instanceof MsgFolder);
    let results = await this._db.all(SQL`SELECT UID, msgID, parentMsgID, subject, dateSent, dateReceived, fromT.emailAddress as fromEmailAddress, fromT.name as fromName, toT.emailAddress as toEmailAddress, toT.name as toName FROM email LEFT JOIN person AS fromT ON firstFrom = fromT.id LEFT JOIN person AS toT ON firstTo = toT.id WHERE folder = (SELECT id FROM folder WHERE fullPath = ${folder.fullPath} AND accountID = ${folder.account.accountID} LIMIT 1)`);
    return results.map(result => {
      let email = new EMail(folder);
      email.UID = result.UID;
      email.msgID = result.msgID;
      email.subject = result.subject;
      email.date = new Date(result.dateSent);
      email.dateReceived = new Date(result.dateReceived);
      email.authorEmailAddress = result.fromEmailAddress;
      email.authorRealname = result.fromName;
      email.recipientEmailAddress = result.toEmailAddress;
      email.recipientRealname = result.toName;
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
