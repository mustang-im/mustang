import { appGlobal } from './app';
import { readMailAccounts } from './Mail/AccountsList/MailAccounts';
import { readChatAccounts } from './Chat/AccountsList/ChatAccounts';
import { readAddressbooks } from './Contacts/AccountsList/Addressbooks';
import { readCalendars } from './Calendar/AccountsList/Calendars';
import { readMeetAccounts } from './Meet/AccountsList/MeetAccounts';
import { readSavedSearches } from './Mail/Virtual/SavedSearchFolder';
import { loadTagsList } from './Mail/Tag';
import JPCWebSocket from '../../lib/jpc-ws';

const kSecret = 'eyache5C'; // TODO generate, and communicate to client, or save in config files.

export async function getStartObjects(): Promise<void> {
  let jpc = new JPCWebSocket(null);
  await jpc.connect(kSecret, "localhost", 5455);
  console.log("Connected to backend");
  appGlobal.remoteApp = await jpc.getRemoteStartObject();
  appGlobal.addressbooks.addAll(await readAddressbooks());
  appGlobal.calendars.addAll(await readCalendars());
  appGlobal.emailAccounts.addAll(await readMailAccounts());
  appGlobal.chatAccounts.addAll(await readChatAccounts());
  appGlobal.meetAccounts.addAll(await readMeetAccounts());

  // TODO Save the address book type and ensure that they are of the right type
  appGlobal.personalAddressbook = appGlobal.addressbooks.first;
  appGlobal.collectedAddressbook = appGlobal.addressbooks.get(1);
  readSavedSearches();
  await loadTagsList();
}

/**
 * Logs in to all accounts for which we have the credentials stored.
 *
 * @param startupErrorCallback Called for login errors.
 *   May be called multiple times, e.g. once per account.
 * @param backgroundErrorCallback Called for errors while updating the folder etc.
 *   Called later on, if there are errors on processing server responses,
 *   e.g. the account being logged out, malformed data etc..
 */
export async function loginOnStartup(startupErrorCallback: (ex) => void, backgroundErrorCallback: (ex) => void): Promise<void> {
  for (let account of appGlobal.chatAccounts) {
    account.errorCallback = backgroundErrorCallback;
    if (account.loginOnStartup) {
      account.login(false).catch(startupErrorCallback);
    }
  }

  for (let account of appGlobal.emailAccounts) {
    //if (!(await account.isLoggedIn) && (await account.haveStoredLogin())) {
    account.errorCallback = backgroundErrorCallback;
    if (account.loginOnStartup) {
      account.login(false).catch(startupErrorCallback);
      // account.inbox.getNewMessages().catch(startupErrorCallback);
    }
  }
}
