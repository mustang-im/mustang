import type { EMail } from "../EMail";
import { appGlobal } from "../../app";
import { sanitizeFilename, assert } from "../../util/util";
import type { Folder } from "../Folder";
import { ArrayColl, MapColl, SetColl } from "svelte-collections";
import { Buffer } from "buffer"; // https://github.com/feross/buffer
import type Zip from "adm-zip";

/** Save all emails of a folder in a ZIP file in the local disk filesystem.
 * Each folder has its own ZIP file, in the form `AccountID/Parent/Path/Folder Name.zip`.
 * Each email is saved as original RFC822 MIME message,
 * one file inside the ZIP per email.
 * The email filename inside the ZIP is the unique `dbID` of the email, with ".eml" ext.
 * The email file comment in the ZIP is the RFC822 `Message-ID`.
 * (It's also an option to use the msgID as filename, but mailing lists are terrible
 * and rewrite messages in various ways, but keep the msgID...) */
export class MailZIP {
  static async save(email: EMail) {
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
    MailZIP.writeZip(zip, email.folder.account.errorCallback);
  }

  /** Write the file to disk n seconds after the last call to this function */
  static writeZip(zip: Zip, errorCallback: (ex) => void) {
    if (zip.writeTimer) {
      clearTimeout(zip.writeTimer);
    }
    zip.writeTimer = setTimeout(async () => {
      try {
        await zip.writeZip();
        haveZips.removeKey(haveZips.getKeyForValue(zip));
      } catch (ex) {
        errorCallback(ex);
      }
    }, 3000);
  }

  static async read(email: EMail) {
    let zip = await this.getFolderZIP(email.folder);
    let file = await zip.getEntry(this.getEMailFilename(email));
    email.mime = await zip.readFile(file) as Uint8Array;
    console.log("Read MIME source of email", email.subject, email.mime);
  }

  static async readAll(folder: Folder): Promise<ArrayColl<EMail>> {
    let emails = new ArrayColl<EMail>();
    let zip = await this.getFolderZIP(folder);
    let files = await zip.getEntries();
    for (let file of files) {
      try {
        let email = folder.newEMail();
        email.mime = await zip.readFile(file) as Uint8Array;
        console.log("email.mime (should be Uint8array)", email.mime);
        await email.parseMIME();
        await email.save();
      } catch (ex) {
        folder.account.errorCallback(ex);
      }
    }
    return emails;
  }

  static async getFolderZIP(folder: Folder): Promise<Zip> {
    let filename = await this.getFolderZIPFilePath(folder);
    let zip = haveZips.get(filename);
    if (zip) {
      return zip;
    }
    try {
      // Opens the existing ZIP file. Throws when the file doesn't exist.
      zip = await appGlobal.remoteApp.newAdmZIP(filename);
    } catch (ex) {
      // Create a new ZIP file.
      zip = await appGlobal.remoteApp.newAdmZIP();
      await zip.writeZip(filename);
      zip = await appGlobal.remoteApp.newAdmZIP(filename);
    }
    haveZips.set(filename, zip);
    return zip;
  }

  static async getFolderZIPFilePath(folder: Folder): Promise<string> {
    filesDir = filesDir ?? await appGlobal.remoteApp.getFilesDir();
    let dir = `${filesDir}/backup/email/${sanitizeFilename(folder.account.emailAddress.replace("@", "-"))}-${sanitizeFilename(folder.account.id)}`;
    if (folder.parent) {
      dir += `/${sanitizeFilename(folder.parent.path)}`;
    }
    if (!haveDirs.contains(dir)) {
      // Permissions: Only user can read and write the dir.
      await appGlobal.remoteApp.fs.mkdir(dir, { recursive: true, mode: 0o700 });
      haveDirs.add(dir);
    }
    return `${dir}/${sanitizeFilename(folder.name)}.zip`;
  }

  static getEMailFilename(email: EMail): string {
    assert(email.dbID, "Please read or save the email first in the database, so that we can use the dbID as filename in the as mail.zip");
    return email.dbID + ".eml";
  }
}

let filesDir: string | null = null;
let haveDirs = new SetColl<string>(); // Check dir only once per app session
let haveZips = new MapColl<string, Zip>(); // Currently open ZIP files
