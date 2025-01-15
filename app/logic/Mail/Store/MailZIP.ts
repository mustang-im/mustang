import type { MailContentStorage } from "../MailAccount";
import type { EMail } from "../EMail";
import { appGlobal } from "../../app";
import type { Folder } from "../Folder";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { assert } from "../../util/util";
import { ArrayColl, MapColl, SetColl } from "svelte-collections";
import { Buffer } from "buffer";
import type Zip from "adm-zip";
import { Lock, type Locked } from "../../util/Lock";

/** Save all emails of a folder in a ZIP file in the local disk filesystem.
 * Each folder has its own ZIP file, in the form `AccountID/Parent/Path/Folder Name.zip`.
 * Each email is saved as original RFC822 MIME message,
 * one file inside the ZIP per email.
 * The email filename inside the ZIP is the unique `dbID` of the email, with ".eml" ext.
 * The email file comment in the ZIP is the RFC822 `Message-ID`.
 * (It's also an option to use the msgID as filename, but mailing lists are terrible
 * and rewrite messages in various ways, but keep the msgID...) */
export class MailZIP implements MailContentStorage {
  async save(email: EMail) {
    assert(email.mime, "Need MIME source to save the email as mail.zip");
    let zip = await this.getFolderZIP(email.folder);
    let filename = this.getEMailFilename(email);
    if (zip.getEntry(filename)) {
      return;
    }
    // https://github.com/cthackers/adm-zip/wiki/ADM-ZIP-Introduction
    // https://github.com/cthackers/adm-zip/wiki/ADM-ZIP
    // TODO The whole library is synchronous. That's of course a major problem.
    // Alternative: https://www.npmjs.com/package/cross-zip (but requires zip to be installed)
    // We need to `await` here, because of JPC. This is particularly important here,
    // because we're writing many emails at the same time, and each re-writes the ZIP file.
    // Without `await`, we risk a race condition that overwrites the recently changed ZIP file.
    await zip.addFile(filename, Buffer.from(email.mime), email.id);
    this.writeZipDelayed(zip, filename, email.folder.account.errorCallback);
  }

  /** Write the file to disk n seconds after the last call to this function */
  protected writeZipDelayed(zip: Zip, filename: string, errorCallback: (ex) => void) {
    if (zip.writeTimer) {
      clearTimeout(zip.writeTimer);
    }
    zip.writeTimer = setTimeout(async () => {
      try {
        await this.writeZip(zip, filename);
      } catch (ex) {
        errorCallback(ex);
      }
    }, 3000);
  }

  protected async writeZip(zip: Zip, filename: string) {
    let lock = await MailZIP.lockForFile(filename);
    try {
      await zip.writeZip();
    } finally {
      lock.release();
      haveZips.removeKey(haveZips.getKeyForValue(zip));
    }
  }

  protected static locks = new MapColl<string, Lock>();
  protected static async lockForFile(filename: string): Promise<Locked> {
    let lock = MailZIP.locks.get(filename);
    if (!lock) {
      lock = new Lock();
      MailZIP.locks.set(filename, lock);
    }
    return await lock.lock();
  }

  async deleteIt(email: EMail): Promise<void> {
    let zip = await this.getFolderZIP(email.folder);
    await zip.deleteEntry(this.getEMailFilename(email));
  }

  async read(email: EMail) {
    let zip = await this.getFolderZIP(email.folder);
    let file = await zip.getEntry(this.getEMailFilename(email));
    email.mime = await zip.readFile(file) as Uint8Array;
    console.log("Read MIME source of email", email.subject, email.mime);
  }

  async readAll(folder: Folder): Promise<ArrayColl<EMail>> {
    let emails = new ArrayColl<EMail>();
    let zip = await this.getFolderZIP(folder);
    let files = await zip.getEntries();
    for (let file of files) {
      try {
        let email = folder.newEMail();
        email.mime = await zip.readFile(file) as Uint8Array;
        console.log("email.mime (should be Uint8array)", email.mime);
        await email.parseMIME();
        await email.saveCompleteMessage();
      } catch (ex) {
        folder.account.errorCallback(ex);
      }
    }
    return emails;
  }

  async getFolderZIP(folder: Folder): Promise<Zip> {
    let filename = await this.getFolderZIPFilePath(folder);
    let lock = await MailZIP.lockForFile(filename);
    try {
      let zip = haveZips.get(filename);
      if (zip) {
        return zip;
      }
      // Opens the existing ZIP file, or creates it when it doesn't exist.
      zip = await appGlobal.remoteApp.newAdmZIP(filename);
      haveZips.set(filename, zip);
      return zip;
    } finally {
      lock.release();
    }
  }

  filesDir: string | null = null;
  haveDirs = new SetColl<string>(); // Check dir only once per app session

  async getFolderZIPFilePath(folder: Folder): Promise<string> {
    this.filesDir = this.filesDir ?? await appGlobal.remoteApp.getFilesDir();
    let dir = `${this.filesDir}/backup/email/${sanitize.filename(folder.account.emailAddress.replace("@", "-"))}-${sanitize.filename(folder.account.id)}`;
    if (folder.parent) {
      dir += `/${sanitize.filename(folder.parent.path, "unknownFolder")}`;
    }
    if (!this.haveDirs.contains(dir)) {
      // Permissions: Only user can read and write the dir.
      await appGlobal.remoteApp.fs.mkdir(dir, { recursive: true, mode: 0o700 });
      this.haveDirs.add(dir);
    }
    return `${dir}/${sanitize.filename(folder.name, "unknownFolder")}.zip`;
  }

  getEMailFilename(email: EMail): string {
    assert(email.dbID, "Please read or save the email first in the database, so that we can use the dbID as filename in the as mail.zip");
    return email.dbID + ".eml";
  }
}

let haveZips = new MapColl<string, Zip>(); // Currently open ZIP files
