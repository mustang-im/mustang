import { MailAccount } from "../MailAccount";
import { POP3Folder } from "./POP3Folder";
import type { EMail } from "../EMail";
import { assert } from "../../util/util";

export class POP3Account extends MailAccount {
  readonly protocol: string = "pop3";

  async send(email: EMail): Promise<void> {
    assert(this.outgoing, "SMTP server is not set up for POP3 account " + this.name);
    await this.outgoing.send(email);
  };

  newFolder(): POP3Folder {
    return new POP3Folder(this);
  }
}
