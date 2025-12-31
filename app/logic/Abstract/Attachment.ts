import { File as FileEntry } from "../Files/File";
import { appGlobal } from "../app";
import { Observable, notifyChangedProperty } from "../util/Observable";
import { saveURLAsFile } from "../../frontend/Util/util";
import { openOSAppForFile } from "../util/os-integration";
import { NotImplemented, type URLString } from "../util/util";

export class Attachment extends Observable {
  /** filename with extension, as given by the sender of the email */
  @notifyChangedProperty
  filename: string;
  /** Where the attachment is stored on the user's local disk, after download */
  @notifyChangedProperty
  filepathLocal: string;
  @notifyChangedProperty
  mimeType: string;
  /** File size, in bytes
   * null, if the attachment wasn't downloaded yet. */
  @notifyChangedProperty
  size: number | null;
  @notifyChangedProperty
  disposition = ContentDisposition.unknown;
  /** embedded image */
  @notifyChangedProperty
  related: boolean;
  @notifyChangedProperty
  contentID: string;
  /** File contents. Not populated, if we have the attachment saved on disk */
  @notifyChangedProperty
  content: File;
  /** Exists while editing or displaying.
   * Created using `URL.createObjectURL(this.content)`.
   * Must be cleared using `URL.revokeObjectURL()` when the window closes,
   * otherwise we leak the entire attachment. */
  blobURL: URLString;
  /** Exists while editing or displaying. */
  dataURL: URLString;

  static fromFile(file: File): Attachment {
    let attachment = new Attachment();
    attachment.content = file;
    attachment.filename = file.name;
    attachment.mimeType = file.type;
    attachment.size = file.size;
    attachment.disposition = ContentDisposition.attachment;
    return attachment;
  }

  clone(): Attachment {
    let clone = new Attachment();
    Object.assign(clone, this);
    if (this.content) {
      clone.content = new File([this.content], this.content.name);
    }
    return clone;
  }

  asFileEntry(): FileEntry {
    let file = new FileEntry();
    file.setFileName(this.filename);
    file.filepathLocal = this.filepathLocal;
    file.size = this.size;
    file.mimetype = this.mimeType;
    file.contents = this.content;
    file.id = this.contentID;
    return file;
  }

  get ext(): string {
    return this.filename.split(".").pop();
  }

  /** Open the native desktop app with this file */
  async openOSApp() {
    await openOSAppForFile(this.filepathLocal);
  }
  /** Open the native file manager with the folder
   * where this file is, and select this file. */
  async openOSFolder() {
    await appGlobal.remoteApp.showFileInFolder(this.filepathLocal);
  }
  async saveFile() {
    throw new NotImplemented();
    let url = "file://" + this.filepathLocal;
    console.log("url " + url);
    saveURLAsFile(url, this.filename);
  }
  async deleteFile() {
    throw new NotImplemented();
  }

  /** Should not show to end user. This is true for auto-processing attachments
   * like calendar invitations (ICS), vCards, encryption signatures etc. */
  get hidden(): boolean {
    return kHiddenMIMETypes.includes(this.mimeType);
  }
}

export enum ContentDisposition {
  unknown = "unknown",
  inline = "inline",
  attachment = "attachment",
}

const kHiddenMIMETypes = [
  "application/ics", // calendar invitation
  "text/vcard", // vCard
  "text/calendar", // vCard
  "application/pkcs7-signature", // S/MIME signature
  "application/pgp-signature", // PGP signature
  "application/pgp-keys", // Sender announcing his PGP keys
  // "application/pkcs7-mime", // S/MIME encrypted
  // "application/pgp-encrypted", // PGP encrypted
];
