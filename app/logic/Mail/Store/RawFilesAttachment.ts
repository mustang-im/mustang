import type { Attachment } from "../Attachment";
import type { EMail } from "../EMail";
import { SQLEMail } from "../SQL/SQLEMail";
import { appGlobal } from "../../app";
import { sanitizeFilename, fileExtensionForMIMEType, assert } from "../../util/util";

let configDir: string = null;

/** Save email attachments as files in the local disk filesystem */
export class RawFilesAttachment {
  static async saveEMail(email: EMail) {
    //await RawFilesAttachment.rmdirWithFiles(await this.getDirPath(email));
    if (email.attachments.hasItems) {
      await Promise.allSettled(email.attachments.contents.map(a =>
        RawFilesAttachment.save(a, email)));
      await RawFilesAttachment.emailFinished(email);
    }
  }

  static async save(attachment: Attachment, email: EMail) {
    if (!attachment.content) {
      return;
    }
    let filepath = await this.getFilePath(attachment, email);
    // Permissions: Only user can read the file, but not modify
    let fileHandle = await appGlobal.remoteApp.openFile(filepath, true, 0o400);
    await fileHandle.write(new Uint8Array(await attachment.content.arrayBuffer()));
    await appGlobal.remoteApp.closeFile(fileHandle);
    attachment.filepathLocal = filepath;
    await SQLEMail.saveAttachmentFile(email, attachment);
  }

  /** Call this when you finished writing all attachments for this email.
   * It will make the dir read-only, so that the user doesn't modify or move the
   * attachment files. */
  static async emailFinished(email: EMail): Promise<void> {
    let dir = await this.getDirPath(email);
    // Permissions: Only user can list and read files, but not remove them
    await appGlobal.remoteApp.fs.chmod(dir, 0o500);
  }

  static async readEMail(email: EMail): Promise<void> {
    assert(email.dbID, "need email DB ID to read attachments from disk");
    SQLEMail.read(email.dbID, email);
    for (let attachment of email.attachments) {
      await this.read(attachment);
    }
  }

  static async read(attachment: Attachment): Promise<File> {
    assert(attachment.filepathLocal, "need attachment filename");
    let fileHandle = await appGlobal.remoteApp.openFile(attachment.filepathLocal, false);
    let array = new Uint8Array(attachment.size);
    await fileHandle.read(array);
    await appGlobal.remoteApp.closeFile(fileHandle);
    let file = new File([array], attachment.filename, { type: attachment.mimeType });
    attachment.content = file;
    return file;
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

  static async getFilePath(attachment: Attachment, email: EMail): Promise<string> {
    let dir = await this.getDirPath(email);
    // Permissions: Only user can read and write the dir. Permissions later changed in `emailFinished()`
    await appGlobal.remoteApp.fs.mkdir(dir, { recursive: true, mode: 0o700 });
    let id = email.attachments.getKeyForValue(attachment) ?? Math.floor(Math.random() * 100) + 100;
    let fileparts = attachment.filename.split(".");
    let ext = fileparts.length > 1 ? fileparts.pop() : fileExtensionForMIMEType(attachment.mimeType);
    let filename = fileparts.join(".") + "-" + id + "." + ext;
    return `${dir}/${sanitizeFilename(filename)}`;
  }

  static async getDirPath(email: EMail): Promise<string> {
    if (!configDir) {
      configDir = await appGlobal.remoteApp.getFilesDir();
    }
    return `${configDir}/files/email/${sanitizeFilename(email.from.emailAddress.replace("@", "-"))}/${email.dbID}-${sanitizeFilename(email.subject)}`;
  }
}
