import type { EMail } from "../EMail";
import { appGlobal } from "../../app";
import { sanitizeFilename, assert } from "../../util/util";
import type { Folder } from "../Folder";
import { ArrayColl, SetColl } from "svelte-collections";

/** Save all emails of a mail folder in a folder in the local disk filesystem.
 * Each email is saved as original RFC822 MIME message, one file per email.
 * The email filename is the unique `dbID` of the email.
 * (It's also an option to use the msgID as filename, but mailing lists are terrible
 * and rewrite messages in various ways, but keep the msgID...).
 * This is similar to, but not the same as the standard "MailDir" from qmail. */
export class MailDir {
  static async save(email: EMail) {
    assert(email.mime, "Need MIME source to save the email in maildir");
    let filepath = await this.getFilePath(email);
    // Permissions: Only user can read the file, but not modify
    await appGlobal.remoteApp.writeFile(filepath, 0o400, email.mime);
  }

  static async read(email: EMail): Promise<void> {
    await this._read(email, await this.getFilePath(email));
  }

  static async _read(email: EMail, filepath: string): Promise<void> {
    email.mime = await appGlobal.remoteApp.readFile(filepath);
    await email.parseMIME();
    await email.save();
  }

  static async readAll(folder: Folder): Promise<ArrayColl<EMail>> {
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

  static async getFolderDir(folder: Folder): Promise<string> {
    filesDir = filesDir ?? await appGlobal.remoteApp.getFilesDir();
    let dir = `${filesDir}/backup/email/individual/${sanitizeFilename(folder.account.emailAddress.replace("@", "-"))}-${sanitizeFilename(folder.account.id)}`;
    if (folder.parent) {
      dir += `/${sanitizeFilename(folder.parent.path)}`;
    }
    dir += `/${sanitizeFilename(folder.name)}`;
    if (!haveDirs.contains(dir)) {
      // Permissions: Only user can read and write the dir.
      await appGlobal.remoteApp.fs.mkdir(dir, { recursive: true, mode: 0o700 });
      haveDirs.add(dir);
    }
    return dir;
  }

  static async getFilePath(email: EMail): Promise<string> {
    assert(email.dbID, "Please save the email first in the database, so that we can use the dbID as filename");
    let dir = await this.getFolderDir(email.folder);
    return `${dir}/${sanitizeFilename(email.dbID + "")}.eml`;
  }
}

let filesDir: string | null = null;
let haveDirs = new SetColl<string>(); // Check dir only once per app session
