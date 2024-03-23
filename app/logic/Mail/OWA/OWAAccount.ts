import { MailAccount } from "../MailAccount";
import { OWAFolder } from "./OWAFolder";

export class OWAAccount extends MailAccount {
  readonly protocol: string = "owa";

  newFolder(): OWAFolder {
    return new OWAFolder(this);
  }
}
