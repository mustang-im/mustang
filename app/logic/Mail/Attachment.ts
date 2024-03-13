import { Observable } from "../util/Observable";

export class Attachment extends Observable {
  content: File;
  filename: string;
  mimeType: string;
  disposition = ContentDisposition.unknown;
  /** embedded image */
  related: boolean;
  contentID: string;
}

export enum ContentDisposition {
  unknown = "unknown",
  inline = "inline",
  attachment = "attachment",
}
