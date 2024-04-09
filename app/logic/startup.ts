import { appGlobal } from './app';
import { readMailAccounts } from './Mail/AccountsList/SQL';
import { readChatAccounts } from './Chat/AccountsList/SQL';
import { readAddressbooks } from './Contacts/AccountsList/SQL';
import { readCalendars } from './Calendar/AccountsList/SQL';
import { getTestObjects } from './testData';
import JPCWebSocket from '../../lib/jpc-ws';

const kSecret = 'eyache5C'; // TODO generate, and communicate to client, or save in config files.

export async function getStartObjects(): Promise<void> {
  let jpc = new JPCWebSocket(null);
  await jpc.connect(kSecret, "localhost", 5455);
  console.log("connected to server");
  appGlobal.remoteApp = await jpc.getRemoteStartObject();
  appGlobal.addressbooks.addAll(await readAddressbooks());
  appGlobal.calendars.addAll(await readCalendars());
  appGlobal.emailAccounts.addAll(await readMailAccounts());
  appGlobal.chatAccounts.addAll(await readChatAccounts());
  if (appGlobal.emailAccounts.isEmpty && appGlobal.chatAccounts.isEmpty) {
    await getTestObjects();
  }

  // TODO Save the address book type and ensure that they are of the right type
  appGlobal.personalAddressbook = appGlobal.addressbooks.first;
  appGlobal.collectedAddressbook = appGlobal.addressbooks.get(1);
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
