import { Observable } from "../util/Observable";

export class Attachment extends Observable {
  content: File;
  filename: string;
  mimeType: string;
  disposition = ContentDisposition.unknown;
  /** embedded image */
  related: boolean;
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
