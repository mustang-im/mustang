import type { MailAccount } from './Mail/MailAccount';
import type { ChatAccount } from './Chat/ChatAccount';
import type { Person } from './Abstract/Person';
import type { VideoConfMeeting } from './Meet/VideoConfMeeting';
import type { Calendar } from './Calendar/Calendar';
import type { Directory } from './Files/File';
import Apps from './Apps/Apps';
import { readMailAccounts } from './Mail/MailAccounts';
import { readChatAccounts } from './Chat/ChatAccounts';
import { ArrayColl } from 'svelte-collections';
import JPCWebSocket from '../../lib/jpc-ws';

export class AppGlobal {
  readonly emailAccounts = new ArrayColl<MailAccount>();
  readonly chatAccounts = new ArrayColl<ChatAccount>();
  readonly calendars = new ArrayColl<Calendar>();
  readonly meetings = new ArrayColl<VideoConfMeeting>();
  readonly persons = new ArrayColl<Person>();
  readonly files = new ArrayColl<Directory>();
  readonly apps = new Apps();
  remoteApp: any;
  me: Person;
}
export let appGlobal = new AppGlobal();

const kSecret = 'eyache5C'; // TODO generate, and communicate to client, or save in config files.

export async function getStartObjects(): Promise<void> {
  let jpc = new JPCWebSocket(null);
  await jpc.connect(kSecret, "localhost", 5455);
  console.log("connected to server");
  appGlobal.remoteApp = await jpc.getRemoteStartObject();
  appGlobal.emailAccounts.addAll(await readMailAccounts());
  appGlobal.chatAccounts.addAll(await readChatAccounts());
}

/**
 * Logs in to all accounts for which we have the credentials stored.
 *
 * @param errorCallback Called for login errors.
 *   May be called multiple times, e.g. once per account.
 */
export async function loginOnStartup(errorCallback: (ex) => void): Promise<void> {
  for (let account of appGlobal.chatAccounts) {
    try {
      await account.login(false);
    } catch (e) {
      errorCallback(e);
    }
  }

  for (let account of appGlobal.emailAccounts) {
    //if (!(await account.isLoggedIn) && (await account.haveStoredLogin())) {
    try {
      console.log("Logging in mail account", account.name);
      await account.login(false);
    } catch (e) {
      errorCallback(e);
    }
  }
}
