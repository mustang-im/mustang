import { Observable, notifyChangedProperty } from "../util/Observable";

export class Attachment extends Observable {
  @notifyChangedProperty
  content: File;
  /** filename with extension, as given by the sender of the email */
  @notifyChangedProperty
  filename: string;
  /** Where the attachment is stored on the user's local disk, after download */
  @notifyChangedProperty
  filepathLocal: string;
  @notifyChangedProperty
  mimeType: string;
  @notifyChangedProperty
  disposition = ContentDisposition.unknown;
  /** embedded image */
  @notifyChangedProperty
  related: boolean;
  @notifyChangedProperty
  contentID: string;

  static fromFile(file: File): Attachment {
    let attachment = new Attachment();
    attachment.content = file;
    attachment.filename = file.name;
    attachment.disposition = ContentDisposition.attachment;
    return attachment;
  }
}

export enum ContentDisposition {
  unknown = "unknown",
  inline = "inline",
  attachment = "attachment",
}
