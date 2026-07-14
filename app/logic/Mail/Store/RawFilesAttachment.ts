import type { MailContentStorage } from "../MailAccount";
import type { Attachment } from "../../Abstract/Attachment";
import type { Message } from "../../Abstract/Message";
import { EMail } from "../EMail";
import { ChatMessage } from "../../Chat/ChatMessage";
import { ChatPersonUID } from "../../Chat/ChatPersonUID";
import { SQLChatMessage } from "../../Chat/SQL/SQLChatMessage";
import { SQLEMail } from "../SQL/SQLEMail";
import { getFilesDir } from "../../util/backend-wrapper";
import { appGlobal } from "../../app";
import { PromiseAllDone } from "../../util/flow/PromiseAllDone";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { fileExtensionForMIMEType, NotReached } from "../../util/util";

let filesDir: string = null;

/** Save email attachments as files in the local disk filesystem */
export class RawFilesAttachment implements MailContentStorage {
  async save(message: Message) {
    if (!message.dbID || !message.attachments.hasItems) {
      return;
    }
    let saves = new PromiseAllDone();
    for (let attachment of message.attachments) {
      saves.add(this.saveAttachment(attachment));
    }
    try {
      // Throws when a file could not be written, so that the caller
      // knows that the message is not complete on disk.
      await saves.wait();
    } finally {
      await this.messageFinished(message);
    }
  }

  async saveAttachment(attachment: Attachment) {
    let message = attachment.message;
    if (!attachment.content || attachment.filepathLocal || !message.dbID) {
      return;
    }
    let filepath = await this.getFilePath(attachment, message);
    let contents = new Uint8Array(await attachment.content.arrayBuffer());
    // Permissions: Only user can read the file, but not modify
    await appGlobal.remoteApp.writeFile(filepath, 0o400, contents);
    attachment.filepathLocal = filepath;
    // Save the local file path in the message DB
    if (message instanceof EMail) {
      await SQLEMail.saveAttachmentFilename(message, attachment);
    } else if (message instanceof ChatMessage) {
      await SQLChatMessage.saveAttachmentFilename(message, attachment);
    }
  }

  /** Call this when you finished writing all attachments for this message.
   * It will make the dir read-only, so that the user doesn't modify or move the
   * attachment files. */
  protected async messageFinished(message: Message): Promise<void> {
    let dir = await this.getDirPath(message);
    // Permissions: Only user can list and read files, but not remove them
    await appGlobal.remoteApp.fs.chmod(dir, 0o500);
  }

  async read(message: Message): Promise<void> {
    for (let attachment of message.attachments) {
      await this.readAttachment(attachment);
    }
  }

  async readAttachment(attachment: Attachment): Promise<boolean> {
    if (!attachment.filepathLocal) {
      return false;
    }
    let array = await appGlobal.remoteApp.readFile(attachment.filepathLocal);
    let file = new File([array], attachment.filename, { type: attachment.mimeType });
    attachment.content = file;
    return true;
  }

  async deleteIt(message: Message): Promise<void> {
    let dir = await this.getDirPath(message);
    await RawFilesAttachment.rmdirWithFiles(dir);
  }

  async deleteAttachment(attachment: Attachment): Promise<void> {
    if (attachment.filepathLocal) {
      await appGlobal.remoteApp.deleteFile(attachment.filepathLocal);
    }
  }
  supportsAttachments = true;

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

  async getFilePath(attachment: Attachment, message: Message): Promise<string> {
    let dir = await this.getDirPath(message);
    // Permissions: Only user can read and write the dir. Permissions later changed in `messageFinished()`
    await appGlobal.remoteApp.fs.mkdir(dir, { recursive: true, mode: 0o700 });
    let id = message.attachments.getKeyForValue(attachment) ?? Math.floor(Math.random() * 100) + 100;
    let fileparts = attachment.filename.split(".");
    let ext = fileparts.length > 1 ? fileparts.pop() : fileExtensionForMIMEType(attachment.mimeType);
    let filename = fileparts.join(".").substring(0, 40) + "-" + id + "." + ext;
    return `${dir}/${sanitize.filename(filename, "unknownAttachment")}`;
  }

  async getDirPath(message: Message): Promise<string> {
    filesDir ??= await getFilesDir();
    if (message instanceof EMail) {
      return `${filesDir}/files/email/${sanitize.filename(message.from?.emailAddress?.replace("@", "-").substring(0, 30), "unknownPerson")}/${message.dbID}-${sanitize.filename(message.baseSubject.substring(0, 30), "unknownSubject")}`;
    } else if (message instanceof ChatMessage) {
      let chatID = (message.contact instanceof ChatPersonUID ? message.contact : message.from).chatID;
      return `${filesDir}/files/chat/${sanitize.filename(chatID?.replace("@", "-").substring(0, 30), "unknownPerson")}/${message.dbID}`;
    } else {
      throw new NotReached();
    }
  }
}
