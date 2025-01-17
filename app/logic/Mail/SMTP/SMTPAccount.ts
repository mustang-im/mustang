import { MailAccount, TLSSocketType, AuthMethod, NMUtils } from "../MailAccount";
import type { EMail } from "../EMail";
import { appGlobal } from "../../app";
import { assert } from "../../util/util";
import type { ArrayColl } from "svelte-collections";

export class SMTPAccount extends MailAccount {
  readonly protocol: string = "smtp";

  protected getTransportOptions() {
    // Auth method
    let usePassword = [
      AuthMethod.Password,
      AuthMethod.NTLM,
    ].includes(this.authMethod);
    let useOAuth2 = [
      AuthMethod.OAuth2,
    ].includes(this.authMethod);
    if (useOAuth2) {
      assert(this.oAuth2?.accessToken, `${this.name} SMTP: Need OAuth2 login from IMAP`);
    }
    let noAuth = this.authMethod == AuthMethod.None;

    return {
      host: this.hostname,
      port: this.port,
      secure: this.tls == TLSSocketType.TLS,
      requireTLS: this.tls == TLSSocketType.STARTTLS,
      ignoreTLS: this.tls == TLSSocketType.Plain,
      tls: {
        //minVersion: this.acceptOldTLS ? 'TLSv1' : undefined,
        rejectUnauthorized: !this.acceptBrokenTLSCerts,
      },
      auth: noAuth ? undefined : {
        user: this.username,
        pass: usePassword ? this.password : undefined,
        accessToken: useOAuth2 ? this.oAuth2.accessToken : null,
        type: useOAuth2 ? "OAuth2" : undefined,
      },
      dnsTimeout: 5000,
      connectionTimeout: 5000,
      greetingTimeout: 20000,
      logger: true,
      disableFileAccess: true,
      disableUrlAccess: true,
    };
  }

  async send(email: EMail): Promise<void> {
    try {
      let mail = await NMUtils.getNMMail(email);
      let result = await appGlobal.remoteApp.sendMailNodemailer(
        this.getTransportOptions(), mail);
      email.sent = new Date();
      email.received = email.sent;
      email.mime = await appGlobal.remoteApp.getMIMENodemailer(mail); // to save the Sent mail
    } catch (ex) {
      if (ex.code == "EAUTH") {
        ex.message = "Check your login, username, and password.\n" + ex.message;
        ex.authFail = true;
      }
      throw ex;
    }
  }

  async verifyLogin(): Promise<void> {
    try {
      await appGlobal.remoteApp.verifyServerNodemailer(this.getTransportOptions());
    } catch (ex) {
      if (ex.code == "EAUTH") {
        ex.message = "Check your login, username, and password:\n" + ex.message;
        ex.authFail = true;
      }
      throw ex;
    }
  }
}
