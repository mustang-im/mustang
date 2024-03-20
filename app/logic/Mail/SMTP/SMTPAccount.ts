import { MailAccount } from "../MailAccount";

export class SMTPAccount extends MailAccount {
  readonly protocol: string = "smtp";
}
