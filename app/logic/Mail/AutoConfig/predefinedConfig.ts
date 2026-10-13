import type { MailAccount } from "../MailAccount";
import { readConfigFromXML } from "./readConfig";
import { getConfigDir } from "../../util/backend-wrapper";
import { appGlobal } from "../../app";
import { fillConfig } from "./saveConfig";
import { MailIdentity } from "../MailIdentity";
import { assert } from "../../util/util";

/**
 * Allows an adminstrator to set a specific user config.
 * If found, and if it doesn't exist yet, it creates a concrete
 * user email account, without user interaction. The user
 * is only asked to log in, but the account is otherwise
 * set up completely automatically.
 *
 * The file format is the same as AutoConfig, but with a
 * concrete user email address and real name.
 *
 * This check runs at startup.
 */
export async function predefinedConfig(): Promise<MailAccount | null> {
  try {
    let fileName = await appGlobal.remoteApp.path.join(await getConfigDir(), "useraccount.xml");
    let xmlArray = await appGlobal.remoteApp.readFile(fileName, { encoding: "utf-8" });
    let xmlStr = new TextDecoder().decode(xmlArray);
    if (!xmlStr) {
      return null;
    }
    let config = await readConfigFromXML(xmlStr, null, "harddisk").first;
    if (appGlobal.emailAccounts.some(acc => acc.emailAddress == config.emailAddress)) {
      return null; // already set up
    }
    assert(config.realname, "Need <realname> in useraccount.xml");
    assert(config.emailAddress, "Need <emailAddress> in useraccount.xml");
    appGlobal.me.name ??= config.realname;
    fillConfig(config, config.emailAddress, config.password);
    return config;
  } catch (ex) {
    console.error(ex);
    return null;
  }
}
