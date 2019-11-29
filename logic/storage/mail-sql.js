import MailDatabase from "./mail-database";
import sqlite from "sqlite";
import SQL from "sql-template-strings";

/**
 * Keeps metadata about emails in a SQLite database.
 */
export default class MailSQLDatabase {
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
    let filename =  this.baseDir + "email-database.sqlite";
    this._db = await sqlite.open(filename);
    await this._db.migrate();
  }

  /**
   * Saves an email to the database.
   *
   * @param msgFolder {MsgFolder}
   * @param msg {RFC822Mail}
   */
  async saveMessage(msgFolder, msg) {
    assert(msgFolder instanceof MsgFolder);
    assert(msg instanceof RFC822Mail);
    this._db.run(SQL`INSERT OR IGNORE INTO person (emailAddress, name) VALUES (${msg.authorEmailAddress}, ${msg.authorRealname})`); // TODO update realname, if it was empty
    let fromID = this._db.get(SQL`SELECT id FROM person WHERE emailAddress = ${msg.authorEmailAddress}`);
    this._db.run(SQL`INSERT INTO emails (folder, msgID, firstFrom, subject, dateSent, dateReceived) VALUES ((SELECT id FROM folder WHERE fullPath = ${msgFolder.fullPath} AND accountID = ${ msgFolder.account.accountID} LIMIT 1), ${msg.msgID}, ${fromID}, ${msg.subject}, ${msg.date}, NOW())`);
    // TODO to
    // TODO body
  }

  /**
   * Returns all known emails in a folder.
   *
   * @param msgFolder {MsgFolder}
   * @returns {Array of RFC822Mail}
   */
  async listMessagesInFolder(msgFolder) {
    assert(msgFolder instanceof MsgFolder);
    let resuls = this._db.all(SQL`SELECT *, fromT.emailAddress as fromEmailAddress, fromT.name as fromName  FROM emails LEFT JOIN person AS fromT ON firstFrom = fromT.id WHERE folder = (SELECT id FROM folder WHERE fullPath = ${msgFolder.fullPath} AND accountID = ${ msgFolder.account.accountID} LIMIT 1)`);
    return results.map(result => {
      let email = new RFC822Mail();
      email.msgID = result.msgID;
      email.subject = result.subject;
      email.date = new Date(result.dateSent);
      email.dateReceived = new Date(result.dateReceived);
      email.authorEmailAddress = result.fromemailAddress;
      email.authorRealname = result.fromName;
      return email;
    });
  }
}
