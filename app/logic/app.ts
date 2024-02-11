//import type { MailAccount } from "mustang-lib";
//import type MailAccount from "../../lib/logic/mail/MailAccount";
import type { MailAccount } from './Mail/Account';
import type { ChatAccount } from './Chat/Account';
import type { Person } from './Abstract/Person';
import type { VideoConfMeeting } from './Meet/VideoConfMeeting';
import type { Calendar } from './Calendar/Calendar';
import type { Directory } from './Files/File';
import Apps from './Apps/Apps';
import { readChatAccounts } from './Chat/Accounts';
import { getTestObjects } from './testData';
import { ArrayColl } from 'svelte-collections';
import JPCWebSocket from 'jpc-ws';

export class AppGlobal {
  addNewAccountFromConfig: Function;
  findAccountConfig: Function;
  AccountConfig: Object;
  readonly emailAccounts = new ArrayColl<MailAccount>();
  readonly chatAccounts = new ArrayColl<ChatAccount>();
  readonly calendars = new ArrayColl<Calendar>();
  readonly meetings = new ArrayColl<VideoConfMeeting>();
  readonly persons = new ArrayColl<Person>();
  readonly files = new ArrayColl<Directory>();
  readonly apps = new Apps();
  me: Person;
}
export let appGlobal = new AppGlobal();

const kSecret = 'eyache5C'; // TODO generate, and communicate to client, or save in config files.

export async function getStartObjects(): Promise<void> {
  await getTestObjects(appGlobal);
  /*
  let jpc = new JPCWebSocket(null);
  await jpc.connect(kSecret, "localhost", 5455);
  console.log("connected to server");
  let remoteApp = await jpc.getRemoteStartObject();
  appGlobal.emailAccounts = await remoteApp.accounts;
  */
  appGlobal.chatAccounts.addAll(await readChatAccounts());
}

/**
 * Logs in to all accounts for which we have the credentials stored.
 *
 * @param errorCallback Called for login errors.
 * May be called multiple times, e.g. once per account.
 */
export async function login(errorCallback = (ex) => console.error(ex)): Promise<void> {
  for (let account of appGlobal.chatAccounts) {
    try {
      await account.login();
    } catch (e) {
      errorCallback(e);
    }
  }

  /*
  for (let account of appGlobal.emailAccounts) {
    if (!(await account.isLoggedIn) && (await account.haveStoredLogin())) {
      try {
        console.log("Logging in mail account", await account.name);
        await account.login();
        await account.inbox.fetch();
      } catch (e) {
        errorCallback(e);
      }
    }
  }
  */
}
