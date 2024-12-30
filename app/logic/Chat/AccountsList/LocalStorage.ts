import type { ChatAccount } from '../ChatAccount';
import { ArrayColl } from 'svelte-collections';
import { MatrixAccount } from '../Matrix/MatrixAccount';
import { XMPPAccount } from '../XMPP/XMPPAccount';
import { sanitize } from '../../../../lib/util/sanitizeDatatypes';
import { appGlobal } from '../../app';
import { ContactEntry } from '../../Abstract/Person';

/**
 * Reads settings for chat accounts,
 * and creates corrsponding `ChatAccount` objects.
 * Returns them, and adds them to `appGlobal.chatAccounts`.
 *
 * You still need to call `await account.login()` on each of them.
 */
export async function readChatAccounts(): Promise<ArrayColl<ChatAccount>> {
  let accounts = new ArrayColl<ChatAccount>();
  for (let i = 1; true; i++) {
    let prefBranch = `chat.account${i}.`;
    try {
      let protocol = sanitize.enum(localStorage.getItem(prefBranch + "protocol"), ["xmpp", "matrix"]);
      if (!protocol) {
        break;
      } else if (protocol == "matrix") {
        accounts.add(readMatrixAccount(prefBranch));
      } else if (protocol == "xmpp") {
        accounts.add(readXMPPAccount(prefBranch));
      } else {
        console.error(`Unknown chat protocol ${protocol} in localStorage ${prefBranch}protocol`);
      }
    } catch (ex) {
      console.log("Could not load account", prefBranch);
      console.error(ex);
    }
  }
  if (accounts.isEmpty) {
    console.log("No chat accounts configured. Please set up chat.account1.*");
  }
  for (let account of accounts) {
    readMe(account);
  }
  return accounts;
}

function readMatrixAccount(prefBranch: string): MatrixAccount {
  let account = new MatrixAccount();
  account.baseURL = sanitize.url(localStorage.getItem(prefBranch + "server"), "https://matrix.org");
  account.username = sanitize.nonemptystring(localStorage.getItem(prefBranch + "username"));
  // unused code - account.password = sanitize.nonemptystring(localStorage.getItem(prefBranch + "password"));
  let deviceID = sanitize.alphanumdash(localStorage.getItem(prefBranch + "deviceID"), null);
  if (!deviceID) {
    account.deviceID = crypto.randomUUID();
    localStorage.setItem(prefBranch + "deviceID", account.deviceID);
  }
  account.name = "Matrix " + account.username;
  return account;
}

function readXMPPAccount(prefBranch: string): XMPPAccount {
  let account = new XMPPAccount();
  account.username = sanitize.nonemptystring(localStorage.getItem(prefBranch + "username"));
  // unused code - account.password = sanitize.nonemptystring(localStorage.getItem(prefBranch + "password"));
  let deviceID = sanitize.alphanumdash(localStorage.getItem(prefBranch + "deviceID"), null);
  if (!deviceID) {
    account.deviceID = crypto.randomUUID();
    localStorage.setItem(prefBranch + "deviceID", account.deviceID);
  }
  account.name = account.username;
  return account;
}

function readMe(account: ChatAccount) {
  if (!appGlobal.me.name && account.userRealname) {
    appGlobal.me.name = account.userRealname;
  }
  appGlobal.me.chatAccounts.add(new ContactEntry(account.id, "account"));
}
