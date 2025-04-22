import { MailAccount } from "../MailAccount";
import { POP3Folder } from "./POP3Folder";
import type { EMail } from "../EMail";
import { SpecialFolder } from "../Folder";
import { assert, NotImplemented } from "../../util/util";

export class POP3Account extends MailAccount {
  readonly protocol: string = "pop3";

  async login(interactive: boolean): Promise<void> {
    super.login(interactive);
    throw new NotImplemented("POP3 is coming soon. For now, use IMAP instead.");
  }

  async send(email: EMail): Promise<void> {
    assert(this.outgoing, "SMTP server is not set up for POP3 account " + this.name);
    if (this.oAuth2 && !this.oAuth2.isLoggedIn) {
      await this.oAuth2.login(true);
    }
    await this.outgoing.send(email);
    await this.saveSent(email);
  };

  protected async saveSent(email: EMail): Promise<void> {
    let sentFolder = email.folder ?? this.getSpecialFolder(SpecialFolder.Sent);
    await sentFolder.addMessage(email);
  }

  newFolder(): POP3Folder {
    return new POP3Folder(this);
  }
}
