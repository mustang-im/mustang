import type { ChatAccount } from './ChatAccount';
import { ArrayColl } from 'svelte-collections';
import { MatrixAccount } from './Matrix/MatrixAccount';
import { XMPPAccount } from './XMPP/XMPPAccount';
import { sanitize } from '../../../lib/util/sanitizeDatatypes';

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
      let protocol = localStorage.getItem(prefBranch + "protocol");
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
  return accounts;
}

function readMatrixAccount(prefBranch: string): MatrixAccount {
  let account = new MatrixAccount();
  account.baseURL = sanitize.url(localStorage.getItem(prefBranch + "server") ?? "https://matrix.org");
  account.username = sanitize.nonemptystring(localStorage.getItem(prefBranch + "username"));
  account.password = sanitize.nonemptystring(localStorage.getItem(prefBranch + "password"));
  account.deviceID = sanitize.alphanumdash(localStorage.getItem(prefBranch + "deviceID"));
  if (!account.deviceID) {
    account.deviceID = crypto.randomUUID();
    localStorage.setItem(prefBranch + "deviceID", account.deviceID);
  }
  return account;
}

function readXMPPAccount(prefBranch: string): XMPPAccount {
  let account = new XMPPAccount();
  account.serverDomain = sanitize.hostname(localStorage.getItem(prefBranch + "server"));
  account.username = sanitize.nonemptystring(localStorage.getItem(prefBranch + "username"));
  account.password = sanitize.nonemptystring(localStorage.getItem(prefBranch + "password"));
  account.deviceID = sanitize.alphanumdash(localStorage.getItem(prefBranch + "deviceID"));
  if (!account.deviceID) {
    account.deviceID = crypto.randomUUID();
    localStorage.setItem(prefBranch + "deviceID", account.deviceID);
  }
  return account;
}
