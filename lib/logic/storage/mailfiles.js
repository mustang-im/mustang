import MailStore from "./mail-store";
import MsgFolder from "../account/MsgFolder";
import { assert } from "../../util/util";
import fs from "fs";
import { promisify } from "util";
fs.readFileAsync = promisify(fs.readFile);
fs.writeFileAsync = promisify(fs.writeFile);
fs.mkdirAsync = promisify(fs.mkdir);
fs.existsAsync = promisify(fs.exists);

/**
 * Implements a mail store that uses one file per message.
 */
export default class MailFiles extends MailStore {
  /**
   * Reads an email from disk.
   *
   * @param msgFolder {MsgFolder}
   * @param msgID {string}
   * @returns {String}
   */
  async getMessage(msgFolder, msgID) {
    assert(account instanceof MsgFolder);
    assert(typeof (msgID) == "string");
    let filename = await this._getFilePath(msgFolder, msgID);
    return await fs.readFileAsync(filename, { encoding: "utf8" });
  }

  /**
   * Saves an email to disk.
   *
   * @param msgFolder {MsgFolder}
   * @param msgID {string}
   * @param content {String}
   */
  async saveMessage(msgFolder, msgID, content) {
    assert(account instanceof MsgFolder);
    assert(typeof (msgID) == "string");
    let filename = await this._getFilePath(msgFolder, msgID);
    return await fs.writeFileAsync(filename, { encoding: "utf8", mode: MailStore._kFileMode });
  }

  async _getFilePath(msgFolder, msgID) {
    return await this._getDir(msgFolder) +
      this._sanitizeFilename(msgID) + ".eml";
  }
}
