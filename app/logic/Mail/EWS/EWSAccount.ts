import { MailAccount } from "../MailAccount";
import { EWSFolder } from "./EWSFolder";

export class EWSAccount extends MailAccount {
  readonly protocol: string = "ews";

  newFolder(): EWSFolder {
    return new EWSFolder(this);
  }
}
