import type { MailAccount } from '../Mail/MailAccount';
import { OAuth2 } from '../Auth/OAuth2';
import { OAuth2UIMethod } from '../Auth/UI/OAuth2UIMethod';
import { saveAndInitConfig } from '../Mail/AutoConfig/saveConfig';
import { OAuth2Redirect, WaitForRedirect } from '../Auth/UI/OAuth2Redirect';
import { JMAPAccount } from '../Mail/JMAP/JMAPAccount';
import type { Addressbook } from '../Contacts/Addressbook';
import type { Calendar } from '../Calendar/Calendar';
import type { ChatAccount } from '../Chat/ChatAccount';
import type { MeetAccount } from '../Meet/MeetAccount';
import { appGlobal } from '../app';
import { readConfigFromXML } from '../Mail/AutoConfig/readConfig';
import { assert } from '../util/util';

/**
 * Reads the account config, and logs the user in
 * using OAuth2 and OpenID Connect.
 *
 * Adds all accounts to `appGlobal`, including mail, chat,
 * meet, calendar etc., and returns the main mail account.
 */
export async function login(): Promise<MailAccount> {
  let configs = await getConfig();
  let mail = configs.mail;
  let oAuth2 = mail.oAuth2;
  oAuth2.uiMethod = OAuth2UIMethod.Redirect;
  OAuth2Redirect.load(oAuth2);
  try {
    await oAuth2.login(true);
  } catch (ex) {
    if (ex instanceof WaitForRedirect) {
      return; // page will unload
    }
    throw ex;
  }

  // replaces placeholders, logs in, fetches, and adds to `appGlobal.emailAccounts`
  saveAndInitConfig(mail, oAuth2.account.username, null);

  /*
  appGlobal.addressbooks.add(new JMAPAddressbook());
  appGlobal.calendars.add(new JMAPCalendar());
  appGlobal.chatAccounts.add(...);
  appGlobal.meetAccounts.add(...);
  */
  return mail;
}

async function getConfig(): Promise<{ mail: JMAPAccount, addressbook?: Addressbook, calendar?: Calendar, chat?: ChatAccount, meet?: MeetAccount }> {
  const kAccountConfigURL = "/config/autoconfig.xml";
  let ky = await appGlobal.remoteApp.kyCreate();
  let configFile = await ky.get(kAccountConfigURL, { result: "text" }) as string;
  let configs = readConfigFromXML(configFile, null, "autoconfig-isp");
  let mailConfig = configs.first;
  assert(mailConfig instanceof JMAPAccount, "Mail, contacts and calendar account must be JMAP");
  assert(mailConfig.oAuth2 instanceof OAuth2 && mailConfig.oAuth2.authURL, "Need OAuth2 config");
  return {
    mail: mailConfig,
  };
}
