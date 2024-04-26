import type { EMail } from "../EMail";
import { appGlobal } from "../../app";
import { sanitizeFilename, assert } from "../../util/util";
import type { Folder } from "../Folder";
import { ArrayColl, MapColl, SetColl } from "svelte-collections";
import JSZip from "jszip";

/** Save all emails of a folder in a ZIP file in the local disk filesystem.
 * Each folder has its own ZIP file, in the form `AccountID/Parent/Path/Folder Name.zip`.
 * Each email is saved as original RFC822 MIME message,
 * one file inside the ZIP per email.
 * The email filename inside the ZIP is the unique `dbID` of the email.
 * The email file comment in the ZIP is the RFC822 `Message-ID`.
 * (It's also an option to use the msgID as filename, but mailing lists are terrible
 * and rewrite messages in various ways, but keep the msgID...) */
export class MailZIP {
  static async save(email: EMail) {
    assert(email.mime, "Need MIME source to save the email as mail.zip");
    assert(email.dbID, "Please save the email first in the database, so that we can use the dbID as filename in the as mail.zip");
    let zip = await this.getFolderZIP(email.folder);
    // https://stuk.github.io/jszip/documentation/api_jszip.html
    zip.file("" + email.dbID, email.mime, {
      binary: true,
      comment: email.id,
      date: email.sent,
    });
    MailZIP.writeZip(zip, email.folder.account.errorCallback);
  }

  /** Write the file to disk n seconds after the last call to this function */
  static writeZip(zip: JSZip, errorCallback: (ex) => void) {
    let zipHelper = zip as any;
    if (zipHelper.writeTimer) {
      clearTimeout(zipHelper.writeTimer);
    }
    zipHelper.writeTimer = setTimeout(async () => {
      try {
        let blob = await zip.generateAsync({ type: "blob" });
        let fileHandle = zipHelper.fileHandle;
        await fileHandle.write(new Uint8Array(await blob.arrayBuffer()));
        await appGlobal.remoteApp.closeFile(fileHandle);
        haveZips.removeKey(haveZips.getKeyForValue(zip));
      } catch (ex) {
        errorCallback(ex);
      }
    }, 3000);
  }

  static async readAll(folder: Folder): Promise<ArrayColl<EMail>> {
    let emails = new ArrayColl<EMail>();
    let zip = await this.getFolderZIP(folder);
    let files = [];
    zip.forEach(file => files.push(file));
    for (let file of files) {
      try {
        let email = folder.newEMail();
        email.mime = await file.async("uint8array") as Uint8Array;
        await email.parseMIME();
        await email.save();
      } catch (ex) {
        folder.account.errorCallback(ex);
      }
    }
    return emails;
  }

  static async getFolderZIP(folder: Folder): Promise<JSZip> {
    let filename = await this.getFolderZIPFilePath(folder);
    let zip = haveZips.get(filename);
    if (zip) {
      return zip;
    }
    zip = new JSZip();
    haveZips.set(filename, zip);
    try {
      // open existing
      let fileHandle = await appGlobal.remoteApp.openFile(filename, true);
      let array = new Uint8Array();
      await fileHandle.read(array);
      await zip.loadAsync(array);
      let zipHelper = zip as any;
      zipHelper.fileHandle = fileHandle;
    } catch (ex) {
    }
    return zip;
  }

  static async getFolderZIPFilePath(folder: Folder): Promise<string> {
    filesDir = filesDir ?? await appGlobal.remoteApp.getFilesDir();
    let dir = `${filesDir}/backup/email/${sanitizeFilename(folder.account.emailAddress.replace("@", "-"))}-${sanitizeFilename(folder.account.id)}`;
    if (folder.parent) {
      dir += `/${sanitizeFilename(folder.parent.path)}`;
    }
    if (!haveDirs.contains(dir)) {
      let fs = await appGlobal.remoteApp.fs;
      // Permissions: Only user can read and write the dir.
      await fs.mkdir(dir, { recursive: true, mode: 0o700 });
      haveDirs.add(dir);
    }
    return `${dir}/${sanitizeFilename(folder.name)}.zip`;
  }
}

let filesDir: string | null = null;
let haveDirs = new SetColl<string>(); // Check dir only once per app session
let haveZips = new MapColl<string, JSZip>(); // Currently open ZIP files
