import type { MailAccount } from "../MailAccount";
import { SQLMailAccount } from "../SQL/SQLMailAccount";
import { appGlobal } from "../../app";
import { assert } from "../../util/util";

export async function saveConfig(config: MailAccount, emailAddress: string, password: string): Promise<void> {
  fillConfig(config, emailAddress, password);
  appGlobal.emailAccounts.add(config);
  // saveAccountToLocalStorage(config);
  await SQLMailAccount.save(config);
}

/**
 * Replaces any variables (e.g. %EMAILADDRESS%) in the config with the
 * concrete user values. Also adds real name etc.
 * Changes the config in-place.
 */
export function fillConfig(config: MailAccount, emailAddress: string, password: string) {
  config.userRealname = appGlobal.me.name ?? nameFromEmailAddress(emailAddress);
  config.emailAddress = emailAddress;
  config.password = password;
  config.username = replaceVar(config.username, emailAddress);
  config.hostname = replaceVar(config.hostname, emailAddress);
  config.name = config.name ? replaceVar(config.name, emailAddress) : emailAddress;
  if (config.outgoing) {
    fillConfig(config.outgoing, emailAddress, password);
    if (config.outgoing.name == config.name) {
      config.outgoing.name += " "; // Hack for SMTP and uniqueness
    }
  }
}

function replaceVar(str: string, emailAddress: string): string {
  let emailParts = emailAddress.split("@");
  assert(emailParts.length == 2, `Email address ${emailAddress} is malformed`);
  return (str
    .replace("%EMAILADDRESS%", emailAddress)
    .replace("%EMAILLOCALPART%", emailParts[0])
    .replace("%EMAILDOMAIN%", emailParts[1])
  );
}

function nameFromEmailAddress(emailAddress: string): string {
  let name = emailAddress.split("@")[0];
  name = name.replace(/\./g, " ");
  name = name[0].toUpperCase() + name.substring(1);
  return name;
}
