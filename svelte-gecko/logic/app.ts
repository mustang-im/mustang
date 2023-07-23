import type { MailAccount } from './Mail/Account';
import type { ChatAccount } from './Chat/Account';
import type { VideoConfMeeting } from './Meet/VideoConfMeeting';
import type { MapColl } from 'svelte-collections';
import { getTestObjects } from './testData';
import JPCWebSocket from 'jpc-ws';

export class AppGlobal {
  addNewAccountFromConfig: Function;
  findAccountConfig: Function;
  AccountConfig: Object;
  emailAccounts: MapColl<string, MailAccount>;
  chatAccounts: MapColl<string, ChatAccount>;
  meeting: VideoConfMeeting;
}
export let appGlobal = new AppGlobal();

const kSecret = 'eyache5C'; // TODO generate, and communicate to client, or save in config files.

export async function getStartObjects(): Promise<AppGlobal> {
  return getTestObjects();
  let jpc = new JPCWebSocket(null);
  await jpc.connect(kSecret, "localhost", 5455);
  console.log("connected to server");
  appGlobal = await jpc.getRemoteStartObject();
  console.log("appGlobal", appGlobal);
  return appGlobal;
}
