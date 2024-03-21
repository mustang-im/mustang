import type { MailAccount } from "../../../../logic/Mail/MailAccount";
import { SQLAccount } from "../../../../logic/Mail/SQL/SQLAccount";
import { saveNewAccountToLocalStorage } from "../../../../logic/Mail/MailAccounts";
import { appGlobal } from "../../../../logic/app";
import { assert } from "../../../../logic/util/util";

export async function saveConfig(config: MailAccount, emailAddress: string, password: string): Promise<void> {
  fillConfig(config, emailAddress, password);
  appGlobal.emailAccounts.add(config);
  saveNewAccountToLocalStorage(config);
  await SQLAccount.save(config);
}

/**
 * Replaces any variables (e.g. %EMAILADDRESS%) in the config with the
 * concrete user values. Also adds real name etc.
 * Changes the config in-place.
 */
export function fillConfig(config: MailAccount, emailAddress: string, password: string) {
  config.userRealname = appGlobal.me.name;
  config.emailAddress = emailAddress;
  config.password = password;
  config.username = replaceVar(config.username, emailAddress);
  config.hostname = replaceVar(config.hostname, emailAddress);
  config.name = replaceVar(config.name, emailAddress);
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
