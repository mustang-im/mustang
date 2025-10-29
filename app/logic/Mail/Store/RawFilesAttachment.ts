import type { MailContentStorage } from "../MailAccount";
import type { Attachment } from "../../Abstract/Attachment";
import type { EMail } from "../EMail";
import { SQLEMail } from "../SQL/SQLEMail";
import { appGlobal } from "../../app";
import { fileExtensionForMIMEType, assert } from "../../util/util";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";

let filesDir: string = null;

/** Save email attachments as files in the local disk filesystem */
export class RawFilesAttachment implements MailContentStorage {
  async save(email: EMail) {
    //await RawFilesAttachment.rmdirWithFiles(await this.getDirPath(email));
    if (email.attachments.hasItems) {
      await Promise.allSettled(email.attachments.contents.map(a =>
        this.saveAttachment(a, email)));
      await RawFilesAttachment.emailFinished(email);
    }
  }

  async saveAttachment(attachment: Attachment, email: EMail) {
    if (!attachment.content) {
      return;
    }
    let filepath = await RawFilesAttachment.getFilePath(attachment, email);
    let contents = new Uint8Array(await attachment.content.arrayBuffer());
    // Permissions: Only user can read the file, but not modify
    await appGlobal.remoteApp.writeFile(filepath, 0o400, contents);
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

  async read(email: EMail): Promise<void> {
    assert(email.dbID, "need email DB ID to read attachments from disk");
    //await email.folder.account.storage.readMessage(email);
    for (let attachment of email.attachments) {
      await this.readAttachment(attachment);
    }
  }

  async readAttachment(attachment: Attachment): Promise<File> {
    assert(attachment.filepathLocal, "need attachment filename");
    let array = await appGlobal.remoteApp.readFile(attachment.filepathLocal);
    let file = new File([array], attachment.filename, { type: attachment.mimeType });
    attachment.content = file;
    return file;
  }

  async deleteIt(email: EMail): Promise<void> {
    let dir = await RawFilesAttachment.getDirPath(email);
    await RawFilesAttachment.rmdirWithFiles(dir);
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
    let filename = fileparts.join(".").substring(0, 40) + "-" + id + "." + ext;
    return `${dir}/${sanitize.filename(filename, "unknownAttachment")}`;
  }

  static async getDirPath(email: EMail): Promise<string> {
    filesDir ??= await appGlobal.remoteApp.getFilesDir();
    return `${filesDir}/files/email/${sanitize.filename(email.from?.emailAddress?.replace("@", "-").substring(0, 30), "unknownPerson")}/${email.dbID}-${sanitize.filename(email.baseSubject.substring(0, 30), "unknownSubject")}`;
  }
}
