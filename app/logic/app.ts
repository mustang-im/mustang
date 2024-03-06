import type MailAccount from "../../lib/logic/mail/MailAccount";
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
  let jpc = new JPCWebSocket(null);
  await jpc.connect(kSecret, "localhost", 5455);
  console.log("connected to server");
  let remoteApp = await jpc.getRemoteStartObject();
  //appGlobal.emailAccounts.addAll(await readMailAccounts(remoteApp));
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
      await account.login(false);
    } catch (e) {
      errorCallback(e);
    }
  }

  for (let account of appGlobal.emailAccounts) {
    //if (!(await account.isLoggedIn) && (await account.haveStoredLogin())) {
    try {
      console.log("Logging in mail account", await account.name);
      await account.login(false);
      await account.inbox.fetch();
    } catch (e) {
      errorCallback(e);
    }
  }
}
