import { File as FileEntry } from "../Files/File";
import { Message } from "./Message";
import { appGlobal } from "../app";
import { Observable, notifyChangedProperty } from "../util/Observable";
import { saveBlobAsFile } from "../../frontend/Util/util";
import { openOSAppForFile } from "../util/os-integration";
import { NotImplemented, type URLString } from "../util/util";
import type { Collection } from "svelte-collections";
import { RunOnce } from "../util/flow/RunOnce";

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
  protected _blobURL: URLString;
  /** Exists while editing or displaying. */
  dataURL: URLString;
  message: Message;
  storage: Collection<AttachmentStorage>;
  storageRunOnce = new RunOnce<void>();

  protected static urlFinalizer = new FinalizationRegistry((url: URLString) => {
    URL.revokeObjectURL(url);
  });

  /** Exists while attachment is alive in memory.
    * Don't `URL.revokeObjectURL()` manually because
    * it will make the URL invalid somewhere else
    * the FinalizationRegistry will take care of it.
    */
  get blobURL(): URLString {
    if (this._blobURL) {
      return this._blobURL;
    }
    if (!this.content) {
      return null;
    }
    this._blobURL = URL.createObjectURL(this.content);
    Attachment.urlFinalizer.register(this, this._blobURL, this);
    return this._blobURL;
  }

  fromFile(file: File) {
    this.content = file;
    this.filename = file.name;
    this.mimeType = file.type;
    this.size = file.size;
    this.disposition = ContentDisposition.attachment;
  }

  cloneTo(to: Message): Attachment {
    let clone = to.newAttachment();
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
    saveBlobAsFile(this.content);
  }
  async deleteFile() {
    await this.storageRunOnce.runOnce(async () => {
      for (let storage of this.storage) {
        await storage.deleteAttachment(this);
      }
    });
    this.filepathLocal = null;
    await this.save();
  }
  async read() {
    await this.storageRunOnce.runOnce(async () => {
      for (let storage of this.storage) {
        if (await storage.readAttachment(this)) {
          break;
        }
      }
    });
  }
  async save() {
    await this.storageRunOnce.runOnce(async () => {
      for (let storage of this.storage) {
        await storage.saveAttachment(this);
      }
    });
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
  "application/ld+json", // SML
  "application/ics", // calendar invitation
  "text/vcard", // vCard
  "text/calendar", // vCard
  "application/pkcs7-signature", // S/MIME signature
  "application/pgp-signature", // PGP signature
  "application/pgp-keys", // Sender announcing his PGP keys
  // "application/pkcs7-mime", // S/MIME encrypted
  // "application/pgp-encrypted", // PGP encrypted
];

export interface AttachmentStorage {
  /** Whether this class can save and read attachment content at all */
  supportsAttachments: boolean;
  /** @returns whether this storage was able to read this concrete attachment
   * and has written the the content (and optionally metadata) to its variables. */
  readAttachment(attachment: Attachment): Promise<boolean>;
  /** May be a no-op, if this storage provider cannot save attachments individually,
   * but only e.g. as part of an email */
  saveAttachment(attachment: Attachment): Promise<void>;
  /** @see save, same limitations */
  deleteAttachment(attachment: Attachment): Promise<void>;
}
