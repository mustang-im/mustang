import MailStore from "./mail-store";
import MsgFolder from "../account/MsgFolder";
import { assert } from "../../util/util";
import fs from "fs";
import { promisify } from "util";
fs.existsAsync = promisify(fs.exists);
// <https://github.com/cthackers/adm-zip/wiki/API-Documentation>
// Alternative: <https://www.archiverjs.com/>
import AdmZip from "adm-zip";
AdmZip.readAsTextAsync2 = promisify(AdmZip.readAsTextAsync);
AdmZip.writeFileAsync2 = promisify(AdmZip.writeFile);

/**
 * Implements a mail store that stores emails in a ZIP file.
 * It uses one ZIP file per folder, and stores each message
 * in a separate file inside the ZIP.
 */
export default class MailZIP extends MailStore {
  constructor() {
    super();
    this._writeTimer = null;
    this._currentlyWritingToDisk = false;
  }

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
    let zip = this._getZIP(msgFolder);
    return await zip.readAsTextAsyncP(this._getFilename(msgID));
  }

  /**
   * Saves an email to disk.
   *
   * File will be written physically to disk later, not immediately.
   *
   * @param msgFolder {MsgFolder}
   * @param msgID {string}
   * @param content {String}
   */
  async saveMessage(msgFolder, msgID, content) {
    assert(account instanceof MsgFolder);
    assert(typeof (msgID) == "string");
    let zip = this._getZIP(msgFolder);
    zip.addFile(this._getFilename(msgID), Buffer.alloc(content.length, content), msgID);

    // Write only when there are no new entries for n seconds
    // This makes it faster, and at the same time protects
    // against concurrent writes.
    // TODO Test concurrent writes
    const writeDelayMS = 5000; // ms
    if (this._writeTimer && !this._currentlyWritingToDisk) {
      clearTimeout(this._writeTimer);
    }
    this._writeTimer = setTimeout(() => {
      try {
        this._currentlyWritingToDisk = true;
        await zip.writeFileAsync2(zip.__filename);
        this._currentlyWritingToDisk = false;
      } catch (ex) {
        console.error("Writing messages to disk in ZIP file " + zip.__filename + " failed");
        console.error(ex);
      }
    }, writeDelayMS);
  }

  _getZIP(msgFolder) {
    if (msgFolder._zipFile) {
      return msgFolder._zipFile;
    }
    let zipFilename = baseDir + this._sanitizePath(msgFolder.fullName) + ".mail.zip";
    let zip = new AdmZip(zipFilename)
    zip.__filename = zipFilename;
    return msgFolder._zipFile = zip;
  }

  _getFilename(msgID) {
    return this._sanitizeFilename(msgID) + ".eml";
  }
}
