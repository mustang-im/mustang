import type { Attachment } from "../Attachment";
import type { EMail } from "../EMail";
import { appGlobal } from "../../app";
import { sanitizeFilename } from "../../util/util";

let configDir: string = null;

/** Save email attachments as files in the local disk filesystem */
export class RawFilesAttachment {
  static async saveEMail(email: EMail) {
    if (email.attachments.hasItems) {
      await Promise.all(email.attachments.contents.map(a =>
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
  }

  /** Call this when you finished writing all attachments for this email.
   * It will make the dir read-only, so that the user doesn't modify or move the
   * attachment files. */
  static async emailFinished(email: EMail): Promise<void> {
    let dir = await this.getDirPath(email);
    let fs = await appGlobal.remoteApp.fs;
    // Permissions: Only user can list and read files, but not remove them
    await fs.chmod(dir, 0o500);
  }

  static async read(attachment: Attachment, email: EMail): Promise<File> {
    let filepath = await this.getFilePath(attachment, email);
    let fileHandle = await appGlobal.remoteApp.openFile(filepath, false);
    let array = new Uint8Array(attachment.size);
    await fileHandle.read(array);
    await appGlobal.remoteApp.closeFile(fileHandle);
    let file = new File([array], attachment.filename, { type: attachment.mimeType });
    attachment.content = file;
    return file;
  }

  static async getFilePath(attachment: Attachment, email: EMail): Promise<string> {
    let dir = await this.getDirPath(email);
    let fs = await appGlobal.remoteApp.fs;
    // Permissions: Only user can read and write the dir. Permissions later changed in `emailFinished()`
    await fs.mkdir(dir, { recursive: true, mode: 0o700 });
    return `${dir}/${sanitizeFilename(attachment.filename)}`;
  }

  static async getDirPath(email: EMail): Promise<string> {
    configDir = configDir ?? await appGlobal.remoteApp.getFilesDir();
    return `${configDir}/files/email/${sanitizeFilename(email.from.emailAddress.replace("@", "-"))}/${email.dbID}-${sanitizeFilename(email.subject)}`;
  }
}
