import { MailAccount, MsgFolder } from "../account/account-base";
import { assert, ImplementThis } from "../../util/util";
import fs from "fs";
import util from "util";
fs.mkdirAsync = util.promisify(fs.mkdir);


/**
 * Allows to store entire RFC822 messages on disk, and read them back.
 * Does not implement a meta-data store, just the raw messages.
 */
export default class MailStore {

  /**
   * Must be called before the other functions.
   *
   * @param account {MailAccount}
   * @param baseDir {string} The base directory where all messages should be stored.
   *    This does not depend on the account. The store implementation will create
   *    subdirectories for the account and folders as appropriate.
   *    The baseDir must already exist as directory on disk.
   *    The sub dirs will be created automatically.
   * @param options {object} other store-specific options
   */
  async init(account, baseDir, options) {
    assert(account instanceof MailAccount);
    assert(typeof(baseDir) == "string" && baseDir);
    this._baseDir = baseDir + "/" + account.accountID + "/";
    if (!await fs.existsAsync(this._baseDir)) {
      await fs.mkdirAsync(this._baseDir, MailStore._kDefaultModeDir);
    }
    this._options = options;
  }

  /**
   * Reads an email from disk.
   *
   * @param msgFolder {MsgFolder}
   * @param msgID {string}
   * @returns {Buffer}
   */
  async getMessage(msgFolder, msgID) {
    assert(account instanceof MsgFolder);
    assert(typeof(msgID) == "string");
    throw new ImplementThis();
  }

  /**
   * Saves an email to disk.
   *
   * @param msgFolder {MsgFolder}
   * @param msgID {string}
   * @param content {Buffer}
   */
  async saveMessage(msgFolder, msgID, content) {
    assert(account instanceof MsgFolder);
    assert(typeof(msgID) == "string");
    throw new ImplementThis();
  }

  _getDir(msgFolder) {
    let dir = baseDir + this._sanitizePath(msgFolder.fullName) + "/";
    if (!await fs.existsAsync(dir)) {
      await fs.mkdirAsync(dir, MailStore._kDirMode);
    }
    return dir;
  }

  _sanitizeFilename(filename) {
    return filename.replace(/^[a-zA-Z0-9]/g, "-");
  }

  /**
   * Sanitize msgFolder.fullName,
   * because it comes from the network and
   * can contain dangerous special chars like ".." and "CON:".
   */
  _sanitizePath(path) {
     /*
      * Directory separators:
      * / (Unix)
      * \ (Windows)
      * : (Mac)
      * . (IMAP)
      */
    return path.split(/\/\\\.\:/)
        .map(name => this._sanitizeFilename(name))
        .join("/");
  }
}

MailStore._kDirMode = 0700; // Only the user can read and write
MailStore._kFileMode = 0600; // Ditto
