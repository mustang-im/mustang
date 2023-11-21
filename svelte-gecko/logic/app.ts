import type { MailAccount } from './Mail/Account';
import type { ChatAccount } from './Chat/Account';
import type { Person } from './Abstract/Person';
import type { VideoConfMeeting } from './Meet/VideoConfMeeting';
import type { Calendar } from './Calendar/Calendar';
import type { Directory } from './Files/File';
import Apps from './Apps/Apps';
import { readChatAccounts } from './Chat/Accounts';
import { getTestObjects } from './testData';
import { ArrayColl, Collection } from 'svelte-collections';
import JPCWebSocket from 'jpc-ws';

export class AppGlobal {
  addNewAccountFromConfig: Function;
  findAccountConfig: Function;
  AccountConfig: Object;
  emailAccounts = new ArrayColl<MailAccount>();
  chatAccounts = new ArrayColl<ChatAccount>();
  calendars = new ArrayColl<Calendar>();
  meetings = new ArrayColl<VideoConfMeeting>();
  persons = new ArrayColl<Person>();
  files = new ArrayColl<Directory>();
  apps = new Apps();
}
export let appGlobal = new AppGlobal();

const kSecret = 'eyache5C'; // TODO generate, and communicate to client, or save in config files.

export async function getStartObjects(): Promise<AppGlobal> {
  appGlobal.chatAccounts.addAll(await readChatAccounts());
  let chatAccountsSaved = appGlobal.chatAccounts;
  for (let chatAccount of appGlobal.chatAccounts) {
    await chatAccount.login();
  }
  appGlobal.chatAccounts.addAll(chatAccountsSaved.contents); // no idea why MatrixAccount.login() overwrites `appGlobal.chatAccounts`. Maybe because of `.global = window`?
  return getTestObjects();
  /*
  let jpc = new JPCWebSocket(null);
  await jpc.connect(kSecret, "localhost", 5455);
  console.log("connected to server");
  appGlobal = await jpc.getRemoteStartObject();
  console.log("appGlobal", appGlobal);
  return appGlobal;
  */
}
