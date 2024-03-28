import type { Attachment } from "../Attachment";
import type { EMail } from "../EMail";
import { appGlobal } from "../../app";

/** Save email attachments as files in the local disk filesystem */
export class RawFilesAttachment {
  static async save(attachment: Attachment, email: EMail) {
    if (!attachment.content) {
      return;
    }
    let filepath = await this.getFilePath(attachment, email);
    let fileHandle = await appGlobal.remoteApp.openFile(filepath, true);
    await fileHandle.write(new Uint8Array(await attachment.content.arrayBuffer()));
    await appGlobal.remoteApp.closeFile(fileHandle);
    attachment.filepathLocal = filepath;
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
    let configDir = await appGlobal.remoteApp.getConfigDir();
    let dir = `${configDir}/files/email/${cleanFilename(email.from.emailAddress.replace("@", "-"))}/${cleanFilename(email.subject)}-${email.dbID}`;
    let fs = await appGlobal.remoteApp.fs;
    await fs.mkdir(dir, { recursive: true }); // TODO mode = only user read
    return `${dir}/${cleanFilename(attachment.filename)}`;
  }
}

/** Replace funny or dangerous characters and strings from the filename */
export function cleanFilename(filename: string): string {
  return filename.replace(/[\<\>\@\:]/g, "");
}
