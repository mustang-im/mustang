import { appGlobal } from './app';
import { readMailAccounts } from './Mail/AccountsList/MailAccounts';
import { readChatAccounts } from './Chat/AccountsList/ChatAccounts';
import { readAddressbooks } from './Contacts/AccountsList/Addressbooks';
import { readCalendars } from './Calendar/AccountsList/Calendars';
import { readMeetAccounts } from './Meet/AccountsList/MeetAccounts';
import { readFileSharingAccounts } from './Files/AccountsList/FileSharingAccounts';
import { readSavedSearches } from './Mail/Virtual/SavedSearchFolder';
import { loadWorkspaces } from './Abstract/Workspace';
import { loadTagsList } from './Abstract/Tag';
import type { MailAccount } from './Mail/MailAccount';
import type { Addressbook } from './Contacts/Addressbook';
import type { Calendar } from './Calendar/Calendar';
import type { FileSharingAccount } from './Files/FileSharingAccount';
import { type Account, setMainAccounts } from './Abstract/Account';
import JPCWebSocket from '../../lib/jpc-ws';
import { production } from './build';
import { logError } from '../frontend/Util/error';

const kSecret = 'eyache5C'; // TODO generate, and communicate to client, or save in config files.

export async function getStartObjects(): Promise<void> {
  let jpc = new JPCWebSocket(null);
  await jpc.connect(kSecret, "localhost", production ? 5455 : 5453);
  console.log("Connected to backend");
  appGlobal.remoteApp = await jpc.getRemoteStartObject();
  await loadWorkspaces();
  await loadTagsList();
  appGlobal.emailAccounts.addAll(await readMailAccounts());
  appGlobal.chatAccounts.addAll(await readChatAccounts());
  appGlobal.meetAccounts.addAll(await readMeetAccounts());
  appGlobal.calendars.addAll(await readCalendars());
  appGlobal.addressbooks.addAll(await readAddressbooks());
  appGlobal.fileSharingAccounts.addAll(await readFileSharingAccounts());
  setMainAccounts();

  // TODO Save the address book type and ensure that they are of the right type
  appGlobal.personalAddressbook = appGlobal.addressbooks.first;
  appGlobal.collectedAddressbook = appGlobal.addressbooks.get(1);
  readSavedSearches();
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
export async function loginOnStartup(startupErrorCallback: (ex: Error) => void, backgroundErrorCallback: (ex) => void): Promise<void> {
  for (let account of appGlobal.chatAccounts) {
    account.errorCallback = (ex) => backgroundErrorInAccount(ex, account);
    if (account.loginOnStartup) {
      account.login(false)
        .catch(errorWithAccountName(account, startupErrorCallback));
    }
  }

  for (let account of appGlobal.emailAccounts) {
    account.errorCallback = (ex) => backgroundErrorInAccount(ex, account);
    if (account.loginOnStartup) {
      emailAccountLogin(account)
        .catch(errorWithAccountName(account, startupErrorCallback));
    }
  }

  for (let account of appGlobal.addressbooks) {
    account.errorCallback = (ex) => backgroundErrorInAccount(ex, account);
    if (account.loginOnStartup) {
      addressbookLogin(account)
        .catch(errorWithAccountName(account, startupErrorCallback));
    }
  }

  for (let account of appGlobal.calendars) {
    account.errorCallback = (ex) => backgroundErrorInAccount(ex, account);
    if (account.loginOnStartup) {
      calendarLogin(account)
        .catch(errorWithAccountName(account, startupErrorCallback));
    }
  }

  for (let account of appGlobal.fileSharingAccounts) {
    account.errorCallback = (ex) => backgroundErrorInAccount(ex, account);
    if (account.loginOnStartup) {
      fileShareLogin(account)
        .catch(errorWithAccountName(account, startupErrorCallback));
    }
  }
}

async function emailAccountLogin(account: MailAccount) {
  await account.login(false);
  if (account.isLoggedIn) {
    await account.inbox.getNewMessages();
  }
}

async function addressbookLogin(account: Addressbook) {
  await account.login(false);
  if (account.isLoggedIn) {
    await account.listContacts()
  }
}

async function calendarLogin(account: Calendar) {
  await account.login(false);
  if (account.isLoggedIn) {
    await account.listEvents();
  }
}

async function fileShareLogin(account: FileSharingAccount) {
  await account.login(false);
  if (account.isLoggedIn) {
    await account.sync();
  }
}

function errorWithAccountName(account: Account, errorCallback: (ex: Error) => void) {
  return (ex: Error) => {
    account.errors.add(ex);
    if (ex?.message) {
      ex.message = `${account.name}: ${ex.message}`;
    }
    errorCallback(ex);
  };
}

function backgroundErrorInAccount(ex: Error, account: Account) {
  account.errors.add(ex);
  logError(ex);
}
