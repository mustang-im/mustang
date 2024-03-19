import { MailAccount } from "../MailAccount";

export class POP3Account extends MailAccount {
  readonly protocol: string = "pop3";
}
