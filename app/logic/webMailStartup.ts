import { appGlobal } from './app';
import { WebMailBackend } from './webMailBackend';
import type { Account } from './Abstract/Account';
import { JMAPAccount } from './Mail/JMAP/JMAPAccount';
import type { ChatAccount } from './Chat/ChatAccount';
import type { MeetAccount } from './Meet/MeetAccount';
import { readSavedSearches } from './Mail/Virtual/SavedSearchFolder';
import { loadTagsList } from './Mail/Tag';
import { assert } from './util/util';
import { logError } from '../frontend/Util/error';

export async function getStartObjects(): Promise<void> {
  appGlobal.remoteApp = new WebMailBackend();

  await getMainAccount();
  await getChatAccount();
  await getMeetAccount();

  appGlobal.personalAddressbook = appGlobal.addressbooks.first;
  appGlobal.collectedAddressbook = appGlobal.addressbooks.get(1);
  readSavedSearches();
  await loadTagsList();
}

async function getMainAccount(): Promise<void> {
  /*
  appGlobal.addressbooks.add(new JMAPAccount());
  appGlobal.calendars.add(new JMAPCalendar());
  appGlobal.emailAccounts.add(new JMAPAddressbook());
  */
}

async function getChatAccount(): Promise<void> {
  // appGlobal.chatAccounts.add(...);
}

async function getMeetAccount(): Promise<void> {
  // appGlobal.meetAccounts.add(...);
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
    await account.login(false);
  }

  for (let account of appGlobal.emailAccounts) {
    account.errorCallback = (ex) => backgroundErrorInAccount(ex, account);
    await account.login(false);
    assert(account.inbox, "Inbox not found");
    await account.inbox.getNewMessages();
  }
}

function backgroundErrorInAccount(ex: Error, account: Account) {
  account.errors.add(ex);
  console.error(ex);
  logError(ex);
}
