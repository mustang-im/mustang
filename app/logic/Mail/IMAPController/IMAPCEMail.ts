import { DelegateEMail } from "../Delegate/DelegateEMail";
import type { IMAPCFolder } from "./IMAPCFolder";
import type { IMAPEMail } from "../IMAP/IMAPEMail";

export class IMAPCEMail extends DelegateEMail {
  base: IMAPEMail;
  folder: IMAPCFolder;

  constructor(folder: IMAPCFolder, base: IMAPEMail) {
    super(folder);
    this.base = base;
  }
}
