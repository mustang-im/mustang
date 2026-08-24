import { File as FileEntry } from "../Files/File";
import { EMail } from "../Mail/EMail";
import { appGlobal } from "../app";
import { Observable, notifyChangedProperty } from "../util/Observable";
import { saveBlobAsFile } from "../../frontend/Util/util";
import { openOSAppForFile } from "../util/os-integration";
import { blobToBase64, NotImplemented, UserError, type URLString } from "../util/util";
import type { ArrayColl, Collection } from "svelte-collections";
import { RunOnce } from "../util/flow/RunOnce";
import { gt } from "../../l10n/l10n";

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
  /** Protocol-specific ID of this attachment on the server, e.g. the EWS `AttachmentId`.
   * null, if the attachment isn't on the server yet. */
  @notifyChangedProperty
  pID: string | null = null;
  /** File contents. Not populated, if we have the attachment saved on disk */
  @notifyChangedProperty
  content: File;
  /** Override the default hidden state.
   * Currently not saved to DB. */
  @notifyChangedProperty
  protected _hidden: boolean | null = null;
  protected _blobURL: URLString;
  /** Exists while editing or displaying. */
  dataURL: URLString;
  /** The email, chat message or calendar event that this attachment is part of */
  message: MessageWithAttachments;
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

  /** Creates a copy that belongs to the email, chat message or event `to`.
   * The copy isn't saved yet, so it must not point to the original's
   * file on disk nor to its attachment on the server. */
  cloneTo(to: MessageWithAttachments): Attachment {
    let clone = to.newAttachment();
    let { message, storage, storageRunOnce } = clone;
    Object.assign(clone, this, { message, storage, storageRunOnce, filepathLocal: null, pID: null, _blobURL: null });
    if (this.content) {
      clone.content = new File([this.content], this.filename, { type: this.mimeType });
    }
    return clone;
  }

  asFileEntry(): FileEntry {
    let file = new AttachmentFile();
    file.attachment = this;
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

  async load() {
    if (this.content) {
      return;
    }
    await this.message.loadAttachments?.();
  }

  /** The file contents, base64-encoded, to send it to the server */
  async contentAsBase64(): Promise<string> {
    try {
      return await blobToBase64(this.content);
    } catch (ex) {
      throw new UserError(gt`Could not read the attachment ${this.filename}. The file may have been moved, deleted or changed on disk.`);
    }
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
    await this.load();
    await saveBlobAsFile(this.content);
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
    return this._hidden != null
      ? this._hidden
      : kHiddenMIMETypes.includes(this.mimeType);
  }
  set hidden(val: boolean) {
    this._hidden = val;
  }
}

/** A `File` view of an email `Attachment`, so the Files UI (contact history,
 * person files pane) can open and preview it. Fetching the bytes delegates to
 * the `Attachment`, which knows how to get them from disk or the email. */
export class AttachmentFile extends FileEntry {
  attachment: Attachment;

  async download() {
    if (this.contents) {
      return;
    }
    await this.downloadRunOnce.runOnce(async () => {
      if (this.contents) {
        return;
      }
      let attachment = this.attachment;
      let message = attachment.message;
      if (!attachment.filepathLocal && message instanceof EMail) {
        await message.loadMIME(); // downloads the email, if not already on disk
        // `parseMIME()` may have replaced the attachment objects
        attachment = message.attachments.find(a => a.contentID == attachment.contentID) ?? attachment;
        this.attachment = attachment;
      }
      await attachment.load(); // read `content` from disk (or MIME)
      if (attachment.content && !attachment.filepathLocal) {
        await attachment.save(); // write to disk, so `openOSApp()` has a file path
      }
      this.contents = attachment.content;
      this.filepathLocal = attachment.filepathLocal;
    });
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
  "application/x-pkcs7-signature", // S/MIME signature, legacy type name
  "application/pgp-signature", // PGP signature
  "application/pgp-keys", // Sender announcing his PGP keys
  // "application/pkcs7-mime", // S/MIME encrypted
  // "application/pgp-encrypted", // PGP encrypted
];

/** An email, chat message or calendar event that can have attachments */
export interface MessageWithAttachments {
  dbID: number | string;
  readonly attachments: ArrayColl<Attachment>;
  newAttachment(): Attachment;
  /** Fetches the attachment contents, for messages that don't have them in memory */
  loadAttachments?(): Promise<void>;
}

/** Attaches files that the user picked or dropped */
export function addFilesAsAttachments(message: MessageWithAttachments, files: File[]): void {
  for (let file of files) {
    let attachment = message.newAttachment();
    attachment.fromFile(file);
    message.attachments.add(attachment);
  }
}

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
