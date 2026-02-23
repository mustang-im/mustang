import { appGlobal } from '../app';
import { WebMailBackend } from './backend';
import { login } from './config';
import type { Account } from '../Abstract/Account';
import { gLicense } from '../util/License';
import { createCollectedAddressbook } from '../Contacts/AccountsList/Addressbooks';
import { createPersonalCalendar } from '../Calendar/AccountsList/Calendars';
import { readSavedSearches } from '../Mail/Virtual/SavedSearchFolder';
import { loadTagsList } from '../Abstract/Tag';
import { assert } from '../util/util';
import { logError } from '../../frontend/Util/error';

export async function getStartObjects(): Promise<void> {
  gLicense.license = { valid: true }; // Proprietary, see comment in License.ts
  appGlobal.remoteApp = new WebMailBackend();
  appGlobal.collectedAddressbook = await createCollectedAddressbook();
  appGlobal.personalAddressbook = appGlobal.collectedAddressbook;
  appGlobal.addressbooks.add(appGlobal.collectedAddressbook);
  appGlobal.calendars.add(await createPersonalCalendar());

  await login();

  readSavedSearches();
  await loadTagsList();
}

/**
 * Logs in to all accounts for which we have the credentials stored.
 */
export async function loginOnStartup(): Promise<void> {
  for (let account of appGlobal.chatAccounts) {
    account.errorCallback = (ex) => backgroundErrorInAccount(ex, account);
    if (!account.isDependentAccount) {
      account.login(false).catch(account.errorCallback);
    }
  }

  for (let account of appGlobal.emailAccounts) {
    account.errorCallback = (ex) => backgroundErrorInAccount(ex, account);
    account.login(false).catch(account.errorCallback);
  }
}

function backgroundErrorInAccount(ex: Error, account: Account) {
  account.errors.add(ex);
  if (ex?.message) {
    ex.message = `${account.name}: ${ex.message}`;
  }
  console.error(ex);
  logError(ex);
}
