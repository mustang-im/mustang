import type { MailAccount } from "../MailAccount";
import { fillConfig } from "./saveConfig";

export async function checkConfig(config: MailAccount, emailAddress: string, password: string): Promise<void> {
  fillConfig(config, emailAddress, password);
  console.log("Checking new mail account", config);
  try {
    await config.verifyLogin();
  } catch (ex) {
    config.fatalError = ex;
    throw ex;
  }
  if (config.outgoing) {
    config.outgoing.oAuth2 = config.oAuth2;
    try {
      await config.outgoing.verifyLogin();
    } catch (ex) {
      if (config.isLoggedIn) {
        await config.logout();
      }
      config.outgoing.fatalError = ex;
      throw ex;
    }
  }
}

export function isCertError(ex: Error): boolean {
  if (!ex || !(ex instanceof Error)) {
    return false;
  }
  let code = (ex as any).code;
  if (code == "ERR_TLS_CERT_ALTNAME_INVALID") { // IMAPFlow
    return true;
  } else if (code == "DEPTH_ZERO_SELF_SIGNED_CERT") { // IMAPFlow
    return true;
  } else if (code == "ESOCKET" && ex.message) { // SMTP nodemailer
    if (ex.message.includes("altnames")) {
      return true;
    } else if (ex.message.includes("self signed certificate")) {
      return true;
    }
  }
  return false;
}
