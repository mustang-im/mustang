import { appGlobal } from '../app';
import { WebMailBackend } from './backend';
import { login } from './config';
import type { Account } from '../Abstract/Account';
import { createCollectedAddressbook, createDefaultAddressbooks } from '../Contacts/AccountsList/Addressbooks';
import { readSavedSearches } from '../Mail/Virtual/SavedSearchFolder';
import { loadTagsList } from '../Mail/Tag';
import { assert } from '../util/util';
import { logError } from '../../frontend/Util/error';

export async function getStartObjects(): Promise<void> {
  appGlobal.remoteApp = new WebMailBackend();
  appGlobal.collectedAddressbook = await createCollectedAddressbook();
  appGlobal.personalAddressbook = appGlobal.collectedAddressbook;
  appGlobal.addressbooks.add(appGlobal.collectedAddressbook);

  await login();

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
