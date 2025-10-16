import type { MailContentStorage } from "../MailAccount";
import type { EMail } from "../EMail";
import { appGlobal } from "../../app";
import type { Folder } from "../Folder";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assert } from "../../util/util";
import { ArrayColl, SetColl } from "svelte-collections";
import { getFilesDir } from "../../util/backend-wrapper";

/** Save all emails of a mail folder in a folder in the local disk filesystem.
 * Each email is saved as original RFC822 MIME message, one file per email.
 * The email filename is the unique `dbID` of the email.
 * (It's also an option to use the msgID as filename, but mailing lists are terrible
 * and rewrite messages in various ways, but keep the msgID...).
 * This is similar to, but not the same as the standard "MailDir" from qmail. */
export class MailDir implements MailContentStorage {
  async save(email: EMail) {
    assert(email.mime, "Need MIME source to save the email in maildir");
    let filepath = await this.getFilePath(email);
    // Permissions: Only user can read the file, but not modify
    await appGlobal.remoteApp.writeFile(filepath, 0o400, email.mime);
  }

  async read(email: EMail): Promise<void> {
    let dir = await this.getFilePath(email);
    await this._read(email, dir);
  }

  async _read(email: EMail, filepath: string): Promise<void> {
    email.mime = await appGlobal.remoteApp.readFile(filepath);
    await email.parseMIME();
    await email.save();
  }

  async readAll(folder: Folder): Promise<ArrayColl<EMail>> {
    let emails = new ArrayColl<EMail>();
    let dir = await this.getFolderDir(folder);
    let files = await appGlobal.remoteApp.fs.readdir() as string[];
    for (let file of files) {
      try {
        await this._read(folder.newEMail(), dir + "/" + file);
      } catch (ex) {
        folder.account.errorCallback(ex);
      }
    }
    return emails;
  }

  async deleteIt(email: EMail): Promise<void> {
    let dir = await this.getFilePath(email);
    MailDir.rmdirWithFiles(dir);
  }

  static async rmdirWithFiles(dir: string) {
    try {
      let files = await appGlobal.remoteApp.fs.readdir(dir);
      for (let file of files) {
        await appGlobal.remoteApp.fs.rm(dir + "/" + file);
      }
      await appGlobal.remoteApp.fs.rmdir(dir);
    } catch (ex) {
    }
  }

  filesDir: string | null = null;
  haveDirs = new SetColl<string>(); // Check dir only once per app session

  async getFolderDir(folder: Folder): Promise<string> {
    this.filesDir = this.filesDir ?? await getFilesDir();
    let dir = `${this.filesDir}/backup/email/individual/${sanitize.filename(folder.account.emailAddress.replace("@", "-"))}-${sanitize.filename(folder.account.id)}`;
    if (folder.parent) {
      dir += `/${sanitize.filename(folder.parent.path, "unknownFolder")}`;
    }
    dir += `/${sanitize.filename(folder.name, "unknownFolder")}`;
    if (!this.haveDirs.contains(dir)) {
      // Permissions: Only user can read and write the dir.
      await appGlobal.remoteApp.fs.mkdir(dir, { recursive: true, mode: 0o700 });
      this.haveDirs.add(dir);
    }
    return dir;
  }

  async getFilePath(email: EMail): Promise<string> {
    assert(email.dbID, "Please save the email first in the database, so that we can use the dbID as filename");
    let dir = await this.getFolderDir(email.folder);
    return `${dir}/${sanitize.filename(email.dbID + "")}.eml`;
  }
}
