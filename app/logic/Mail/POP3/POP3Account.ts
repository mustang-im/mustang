import { MailAccount } from "../MailAccount";
import { POP3Folder } from "./POP3Folder";

export class POP3Account extends MailAccount {
  readonly protocol: string = "pop3";

  newFolder(): POP3Folder {
    return new POP3Folder(this);
  }
}
