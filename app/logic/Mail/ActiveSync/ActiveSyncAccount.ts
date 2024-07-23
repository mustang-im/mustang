import { MailAccount } from "../MailAccount";
import { NotImplemented } from "../../util/util";

export class ActiveSyncAccount extends MailAccount {
  readonly protocol: string = "activesync";
  async login(interactive: boolean): Promise<void> {
    throw new NotImplemented("ActiveSync is coming soon. For now, use EWS instead.");
  }
}
