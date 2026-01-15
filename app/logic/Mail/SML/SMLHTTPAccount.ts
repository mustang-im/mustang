import { Account } from "../../Abstract/Account";
import type { MailAccount } from "../MailAccount";
import { sanitize } from "../../../../lib/util/sanitizeDatatypes";
import { notifyChangedProperty } from "../../util/Observable";
import { ArrayColl } from "svelte-collections";

export class SMLHTTPAccount extends Account {
  @notifyChangedProperty
  accessToken: string | null = null;

  get emailAddress(): string | null {
    return this.username;
  };
  set emailAddress(val: string) {
    this.username = sanitize.emailAddress(val);
  };
  get isLoggedIn(): boolean {
    return !!this.accessToken;
  }

  // TODO store the access token and URL in the email account `toConfigJSON()`, and read it back from there

  /**
   * Registers with the server, which sends us an email.
   * This will wait for the email to arrive.
   * `RegisterSMLProcessor` will process it automatically.
   *
   * @warning This will easily take minutes, or even likely hang entirely.
   */
  async login(): Promise<void> {
    this.accessToken = null;
    console.log("Registering", this.emailAddress, "for SML HTTP");
    fetch(this.url + "/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        name: this.realname,
        emailAddress: this.emailAddress,
      }, null, 2),
    });
    // The server sends us a registration email, which we then process automatically.
    // Control continues in `RegisterSMLProcessor`, which will set `this.accessToken`.
    return new Promise(resolve => {
      let poller = this.pollForNewEMails();
      let unsubscribe = this.subscribe(() => {
        if (this.accessToken) {
          unsubscribe();
          if (poller) {
            clearInterval(poller);
          }
          resolve();
          console.log("SML HTTP registration complete");
        }
      });
    });
  }

  mailAccount: MailAccount;
  protected pollForNewEMails(): NodeJS.Timeout | null {
    if (!this.mailAccount) {
      return null;
    }
    const pollFrequency = 3; // in seconds
    return setInterval(() => {
      this.checkForNewEMails()
        .catch(console.error);
    }, pollFrequency * 1000);
  }
  protected async checkForNewEMails() {
    console.log("Check messages for", this.mailAccount.name, "for registration");
    let newMessages = await this.mailAccount.inbox.listMessages();
    for (let msg of newMessages) {
      await msg.download();
    }
  }

  protected static accounts = new ArrayColl<SMLHTTPAccount>;
  static getAccount(emailAddress: string): SMLHTTPAccount {
    return SMLHTTPAccount.accounts.find(acc => acc.emailAddress == emailAddress);
  }
  static getOrCreateAccount(emailAddress: string, realname: string): SMLHTTPAccount {
    let acc = SMLHTTPAccount.getAccount(emailAddress);
    if (acc) {
      return acc;
    }
    acc = SMLHTTPAccount.createDefaultServer(emailAddress, realname);
    SMLHTTPAccount.accounts.add(acc);
    return acc;
  }
  static createDefaultServer(emailAddress: string, realname: string): SMLHTTPAccount {
    let acc = new SMLHTTPAccount();
    // TODO Support provider servers in Autoconfig file
    acc.url = "https://sml.mustang.im";
    acc.emailAddress = emailAddress;
    acc.realname = realname;
    return acc;
  }
}
