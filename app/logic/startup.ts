import { appGlobal } from './app';
import { readMailAccounts } from './Mail/MailAccounts';
import { readChatAccounts } from './Chat/ChatAccounts';
import { getTestObjects } from './testData';
import JPCWebSocket from '../../lib/jpc-ws';

const kSecret = 'eyache5C'; // TODO generate, and communicate to client, or save in config files.

export async function getStartObjects(): Promise<void> {
  let jpc = new JPCWebSocket(null);
  await jpc.connect(kSecret, "localhost", 5455);
  console.log("connected to server");
  appGlobal.remoteApp = await jpc.getRemoteStartObject();
  appGlobal.emailAccounts.addAll(await readMailAccounts());
  appGlobal.chatAccounts.addAll(await readChatAccounts());
  if (appGlobal.emailAccounts.isEmpty && appGlobal.chatAccounts.isEmpty) {
    await getTestObjects();
  }
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
