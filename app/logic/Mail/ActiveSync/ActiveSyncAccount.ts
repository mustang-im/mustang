import { MailAccount } from "../MailAccount";

export class ActiveSyncAccount extends MailAccount {
  readonly protocol: string = "activesync";
}
