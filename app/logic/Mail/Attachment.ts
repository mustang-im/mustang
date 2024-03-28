import { Observable, notifyChangedProperty } from "../util/Observable";

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

  static fromFile(file: File): Attachment {
    let attachment = new Attachment();
    attachment.content = file;
    attachment.filename = file.name;
    attachment.mimeType = file.type;
    attachment.size = file.size;
    attachment.disposition = ContentDisposition.attachment;
    return attachment;
  }
}

export enum ContentDisposition {
  unknown = "unknown",
  inline = "inline",
  attachment = "attachment",
}
